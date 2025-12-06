import React, { useState, useRef, useEffect } from "react";
import TopDestinations from "../components/TopDestinations";
import FeaturedActivities from "../components/FeaturedActivities";
import { BedDouble, Plane, Map, X } from "lucide-react";
import AddressAutocomplete from "../components/AddressAutocomplete";
import PlaceSearch from "../components/PlaceSearch";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Stays");
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState(null); // { lat, lon }
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Flight search specific
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const originRef = useRef(null);
  const destRef = useRef(null);

  // Airport autocomplete - IMPROVED VERSION
  const handleAirportSearch = async (
    value,
    setter,
    suggestionSetter,
    dropdownSetter
  ) => {
    setter(value);

    if (value.length < 2) {
      suggestionSetter([]);
      dropdownSetter(false);
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:5001/api/airports/search?q=${encodeURIComponent(
          value
        )}`
      );
      if (!res.ok) throw new Error("Failed to fetch airports");
      const data = await res.json();
      suggestionSetter(data.airports || []);
      dropdownSetter(data.airports && data.airports.length > 0);
    } catch (err) {
      console.error("Airport search failed:", err);
      suggestionSetter([]);
      dropdownSetter(false);
    }
  };

  // Map activity keywords to OpenTripMap kinds (same mapping as PlaceSearch)
  const ACTIVITY_TO_KINDS = {
    museum: 'museums',
    museums: 'museums',
    hiking: 'natural',
    hike: 'natural',
    food: 'restaurants',
    restaurant: 'restaurants',
    restaurants: 'restaurants',
    beach: 'beaches',
    shopping: 'shops',
    shop: 'shops',
    park: 'parks'
  };

  const handleSearch = async () => {
    if (activeTab === "Flights") {
      await handleFlightSearch();
    } else if (activeTab === "Things to Do") {
      await handleThingsSearch();
    } else {
      await handleGeneralSearch();
    }
  };

  // Map OpenTripMap feature/response to a common POI shape used by UI
  function mapFeatureToPoi(f) {
    if (!f) return null;
    try {
      if (f.properties && f.properties.xid) {
        return {
          xid: f.properties.xid,
          name: f.properties.name || f.properties.kinds || 'POI',
          kinds: f.properties.kinds,
          dist: f.properties.dist,
          lon: f.geometry && f.geometry.coordinates ? f.geometry.coordinates[0] : null,
          lat: f.geometry && f.geometry.coordinates ? f.geometry.coordinates[1] : null,
          preview: f.properties.preview && f.properties.preview.source ? f.properties.preview.source : null
        };
      }
      return {
        xid: f.xid || f.properties?.xid || f.id,
        name: f.name || f.kinds || f.properties?.name || 'POI',
        kinds: f.kinds || f.properties?.kinds,
        lon: f.point?.lon || f.geometry?.coordinates?.[0] || null,
        lat: f.point?.lat || f.geometry?.coordinates?.[1] || null,
        preview: f.preview?.source || null
      };
    } catch (e) {
      return null;
    }
  }

  // Overpass fallback (simplified): query OSM for nodes matching common tags
  async function fetchOverpass(lat, lon, radius = 5000, activityKeyword) {
    try {
      const kind = activityKeyword && activityKeyword.trim().length > 0 ? activityKeyword.trim().toLowerCase() : null;
      const activityToOsm = {
        museum: 'tourism=museum',
        museums: 'tourism=museum',
        hiking: 'tourism=information',
        food: 'amenity=restaurant|amenity=cafe|amenity=fast_food',
        beach: 'natural=beach',
        shopping: 'shop',
        park: 'leisure=park'
      };
      let filters = [];
      if (kind && activityToOsm[kind]) {
        const mapped = activityToOsm[kind];
        mapped.split('|').forEach((m) => {
          const [k, v] = m.split('=');
          if (v) filters.push(`node["${k}"="${v}"](around:${radius},${lat},${lon});`);
          else filters.push(`node["${k}"](around:${radius},${lat},${lon});`);
        });
      } else {
        filters = [
          `node["shop"](around:${radius},${lat},${lon});`,
          `node["tourism"](around:${radius},${lat},${lon});`,
          `node["amenity"](around:${radius},${lat},${lon});`
        ];
      }
      const query = `[out:json][timeout:25];(${filters.join('')});out center;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query, headers: { 'Content-Type': 'text/plain' } });
      if (!res.ok) return [];
      const data = await res.json().catch(() => null);
      if (!data || !data.elements) return [];
      const list = data.elements.map((el) => {
        const name = el.tags && (el.tags.name || el.tags['shop'] || el.tags['amenity'] || el.tags['tourism']) || 'Place';
        const preview = el.tags && (el.tags.image || el.tags['image']) ? el.tags.image || el.tags['image'] : null;
        const lon2 = el.lon || (el.center && el.center.lon) || null;
        const lat2 = el.lat || (el.center && el.center.lat) || null;
        return {
          xid: null,
          osmId: el.id,
          osmLink: `https://www.openstreetmap.org/node/${el.id}`,
          name,
          kinds: Object.keys(el.tags || {}).join(', '),
          dist: null,
          lon: lon2,
          lat: lat2,
          preview
        };
      }).filter(Boolean);
      return list;
    } catch (e) {
      console.warn('Overpass fetch failed', e);
      return [];
    }
  }

  async function handleThingsSearch() {
    setLoading(true);
    setError("");
    setResults([]);
    try {
      // determine coords
      let lat = null;
      let lng = null;
      if (locationCoords && locationCoords.lat && locationCoords.lon) {
        lat = locationCoords.lat;
        lng = locationCoords.lon;
      } else if (location) {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`, { headers: { 'User-Agent': 'Aventra/1.0 (contact)' } });
          if (geoRes.ok) {
            const geoJson = await geoRes.json();
            if (Array.isArray(geoJson) && geoJson.length > 0) {
              lat = geoJson[0].lat;
              lng = geoJson[0].lon;
            }
          }
        } catch (e) {
          console.warn('Geocode failed for location', location, e);
        }
      }
      if (!lat || !lng) {
        setError('Please enter or select a location');
        return;
      }

      // determine kinds
      const kindsToUse = q && q.trim().length > 0 ? (ACTIVITY_TO_KINDS[q.trim().toLowerCase()] || q.trim()) : null;

      // try backend proxy to OpenTripMap
      try {
        const proxyUrl = `/api/opentripmap/radius?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&radius=5000&limit=30${kindsToUse ? `&kinds=${encodeURIComponent(kindsToUse)}` : ''}`;
        const r = await fetch(proxyUrl);
        const data = await r.json().catch(() => null);
        if (r.ok && data && (data.features || (Array.isArray(data) && data.length > 0))) {
          const list = (data.features || data || []).map((f) => mapFeatureToPoi(f)).filter(Boolean);
          setResults(list);
          return;
        }
        // retry without kinds if we requested kinds
        if (r.ok && kindsToUse) {
          const retryUrl = `/api/opentripmap/radius?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&radius=5000&limit=30`;
          const r2 = await fetch(retryUrl);
          if (r2.ok) {
            const data2 = await r2.json().catch(() => null);
            if (data2 && (data2.features || (Array.isArray(data2) && data2.length > 0))) {
              const list2 = (data2.features || data2 || []).map((f) => mapFeatureToPoi(f)).filter(Boolean);
              setResults(list2);
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Proxy opentripmap failed', e);
      }

      // fallback to Overpass
      const over = await fetchOverpass(lat, lng, 5000, q);
      if (over && over.length > 0) {
        // normalize keys to match mapFeatureToPoi output where possible
        const normalized = over.map((p) => ({ xid: p.xid || null, name: p.name, kinds: p.kinds, preview: p.preview, lat: p.lat, lon: p.lon }));
        setResults(normalized);
        return;
      }

      setError('No activities found for that location. Try a broader location or different activity.');
    } catch (err) {
      console.error('Things search failed', err);
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const handleFlightSearch = async () => {
    if (!origin || !destination) {
      setError("Please select both origin and destination airports");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      // Extract airport code: "Atlanta Hartsfield (ATL)" → "ATL"
      const extractCode = (str) => {
        if (!str) return "";
        const match = str.match(/\(([A-Z]{3})\)$/);
        return match ? match[1] : str.toUpperCase();
      };

      const params = new URLSearchParams();
      params.append("origin", extractCode(origin));
      params.append("destination", extractCode(destination));
      if (date) {
        params.append("date", date);
      }

      const res = await fetch(
        `http://127.0.0.1:5001/api/flights/search?${params.toString()}`
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Search failed");
      }
      const data = await res.json();
      setResults(data.results || []);
      if (data.results?.length === 0) {
        setError("No flights found for this route");
      }
    } catch (err) {
      console.error("Flight search failed:", err);
      setError(err.message || "Failed to search flights");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSearch = async () => {
    // Only handle Stays (hotels) here. "Things to Do" uses the PlaceSearch component directly.
    if (activeTab !== "Stays") return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const params = new URLSearchParams();
      if (q) params.append("location", q);
      if (date) params.append("checkin", date);

      const res = await fetch(`/api/hotels/search?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Hotel search failed");
      }
      const data = await res.json();
      setResults(data.results || []);
      if (data.results?.length === 0) {
        setError("No hotels found in this location");
      }
    } catch (err) {
      console.error("search failed", err);
      setError(err.message || "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderSearchBar = () => {
    if (activeTab === "Flights") {
      return (
        <div className="bg-white rounded-xl shadow-xl flex flex-col md:flex-row items-center justify-between p-4 md:space-x-4 space-y-3 md:space-y-0 max-w-4xl mx-auto animate-fadeUp">
          {/* Origin Airport */}
          <div className="relative w-full md:w-1/3" ref={originRef}>
            <input
              type="text"
              placeholder="From (city or code)"
              className="w-full p-3 border rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              value={origin}
              onChange={(e) =>
                handleAirportSearch(
                  e.target.value,
                  setOrigin,
                  setOriginSuggestions,
                  setShowOriginDropdown
                )
              }
              onFocus={() => origin && setShowOriginDropdown(true)}
              aria-label="origin-airport"
            />
            {showOriginDropdown && originSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {originSuggestions.map((airport, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => {
                      setOrigin(airport.full_name);
                      setShowOriginDropdown(false);
                    }}
                  >
                    <div className="font-semibold">{airport.code}</div>
                    <div className="text-sm text-gray-600">
                      {airport.name} • {airport.city}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Destination Airport */}
          <div className="relative w-full md:w-1/3" ref={destRef}>
            <input
              type="text"
              placeholder="To (city or code)"
              className="w-full p-3 border rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              value={destination}
              onChange={(e) =>
                handleAirportSearch(
                  e.target.value,
                  setDestination,
                  setDestSuggestions,
                  setShowDestDropdown
                )
              }
              onFocus={() => destination && setShowDestDropdown(true)}
              aria-label="destination-airport"
            />
            {showDestDropdown && destSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {destSuggestions.map((airport, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => {
                      setDestination(airport.full_name);
                      setShowDestDropdown(false);
                    }}
                  >
                    <div className="font-semibold">{airport.code}</div>
                    <div className="text-sm text-gray-600">
                      {airport.name} • {airport.city}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <input
            type="date"
            className="w-full md:w-1/4 p-3 border rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-400 transition-all duration-300"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="flight-date"
          />

          {/* Search Button */}
          <button
            className="relative bg-blue-600 text-white px-6 py-3 rounded-lg overflow-hidden group transition-all duration-300 w-full md:w-auto"
            onClick={handleSearch}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 blur-md"></span>
            <span className="relative z-10">Search Flights</span>
          </button>
        </div>
      );
    }

    // Things to Do search bar — show compact inputs in the hero (activity + location)
    if (activeTab === "Things to Do") {
      return (
        <div className="bg-white rounded-xl shadow-xl flex flex-col md:flex-row items-center justify-between p-4 md:space-x-4 space-y-3 md:space-y-0 max-w-4xl mx-auto animate-fadeUp">
          <input
            type="text"
            placeholder="What are you looking for? (e.g. museum, hiking)"
            className="w-full md:w-1/3 p-3 border rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-400 transition-all duration-300"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="things-query"
          />

          <div className="w-full md:w-1/3">
            <AddressAutocomplete
              value={location}
              placeholder="Location (city or place)"
              onChange={(val) => {
                setLocation(val);
                setLocationCoords(null);
              }}
              onSelect={(place) => {
                if (place && place.display_name) setLocation(place.display_name);
                if (place && place.lat && place.lon) setLocationCoords({ lat: place.lat, lon: place.lon });
              }}
            />
          </div>

          <input
            type="date"
            className="w-full md:w-1/6 p-3 border rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-400 transition-all duration-300"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="things-date"
          />

          <button
            className="relative bg-blue-600 text-white px-6 py-3 rounded-lg overflow-hidden group transition-all duration-300 w-full md:w-auto"
            onClick={handleSearch}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 blur-md"></span>
            <span className="relative z-10">Search Activities</span>
          </button>
        </div>
      );
    }

    // Default search bar for Stays (hotels)
    return (
      <div className="bg-white rounded-xl shadow-xl flex flex-col md:flex-row items-center justify-between p-4 md:space-x-4 space-y-3 md:space-y-0 max-w-3xl mx-auto animate-fadeUp">
        <input
          type="text"
          placeholder={`Search stays...`}
          className="w-full md:w-1/3 p-3 border rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:scale-[1.02] transition-all duration-300"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="search-query"
        />
        <input
          type="date"
          className="w-full md:w-1/3 p-3 border rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:scale-[1.02] transition-all duration-300"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="search-date"
        />
        <input
          type="number"
          placeholder="Guests"
          min="1"
          className="w-full md:w-1/4 p-3 border rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:scale-[1.02] transition-all duration-300"
          aria-label="guests"
        />
        <button
          className="relative bg-blue-600 text-white px-6 py-3 rounded-lg overflow-hidden group transition-all duration-300"
          onClick={handleSearch}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 blur-md"></span>
          <span className="relative z-10">Search</span>
        </button>
      </div>
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (originRef.current && !originRef.current.contains(event.target)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(event.target)) {
        setShowDestDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <div
        className="relative h-[80vh] flex flex-col justify-center items-center text-center text-white overflow-hidden"
        style={{
          backgroundImage: "url('/images/swiss.avif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-blue-800/40 to-blue-700/70"></div>

        <div className="relative z-10 w-full max-w-4xl px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-md animate-fadeUp">
            Find Your Perfect Adventure
          </h1>
          <p className="text-lg md:text-xl mb-10 text-blue-100 animate-fadeUp">
            From hidden gems to world-famous landmarks — discover where your
            next trip begins.
          </p>

          {/* Tabs */}
          <div className="flex justify-center mb-6 space-x-3 animate-fadeUp">
            {[
              { name: "Stays", icon: <BedDouble className="w-4 h-4 mr-1" /> },
              { name: "Flights", icon: <Plane className="w-4 h-4 mr-1" /> },
              { name: "Things to Do", icon: <Map className="w-4 h-4 mr-1" /> },
            ].map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                  setResults([]);
                  setError("");
                }}
                className={`flex items-center px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.name
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-white/90 text-gray-700 hover:bg-blue-100"
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          {renderSearchBar()}
        </div>
      </div>

      {/* Top Destinations Section */}
      <div className="py-20 px-6 bg-white">
        <TopDestinations />
      </div>

      {/* Search Results & Error Messages */}
      <div className="py-6 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center text-lg font-semibold">
              Loading results...
            </div>
          )}

          {!loading && results && results.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold mb-6">
                {activeTab === "Flights"
                  ? `${results.length} Flight(s) Found`
                  : activeTab === "Stays"
                  ? `${results.length} Hotel(s) Found`
                  : "Search Results"}
              </h3>

              {activeTab === "Flights" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((flight, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedFlight(flight)}
                      className="p-4 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {flight.flight_number}
                          </div>
                          <div className="text-sm text-gray-600">
                            {flight.airline_name}
                          </div>
                        </div>
                        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {flight.status || "Scheduled"}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold">
                            {flight.origin_code}
                          </span>
                          <span className="text-gray-500">→</span>
                          <span className="font-semibold">
                            {flight.destination_code}
                          </span>
                        </div>
                        <div className="text-gray-600">
                          {flight.origin_name &&
                            `${flight.origin_name} to ${flight.destination_name}`}
                        </div>
                        <div className="border-t pt-2">
                          <div className="text-xs text-gray-600">
                            Departs:{" "}
                            {flight.departure_time
                              ? new Date(flight.departure_time).toLocaleString()
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-600">
                            Arrives:{" "}
                            {flight.arrival_time
                              ? new Date(flight.arrival_time).toLocaleString()
                              : "N/A"}
                          </div>
                        </div>
                        {flight.aircraft_type && (
                          <div className="text-xs text-gray-500">
                            Aircraft: {flight.aircraft_type}
                          </div>
                        )}
                      </div>
                      <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              ) : activeTab === "Stays" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((hotel, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden"
                    >
                      {hotel.photo_url && (
                        <img
                          src={hotel.photo_url}
                          alt={hotel.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="text-lg font-bold text-gray-800 mb-2">
                          {hotel.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {hotel.address}
                        </p>

                        <div className="flex items-center mb-3">
                          <span className="text-yellow-500 font-semibold">
                            {hotel.rating} ⭐
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({hotel.total_ratings} reviews)
                          </span>
                        </div>

                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-2xl font-bold text-blue-600">
                                ${hotel.nightly_rate}
                              </span>
                              <span className="text-sm text-gray-600">
                                {" "}
                                /night
                              </span>
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeTab === "Things to Do" ? (
                <ul className="space-y-3">
                  {results.map((p, i) => (
                    <li key={p.xid || `${p.lat}-${p.lon}-${i}`} className="p-3 border rounded hover:shadow-sm transition-shadow flex items-start gap-3 bg-white">
                      <div className="w-20 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        {p.preview ? (
                          <img src={p.preview} alt={p.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="text-xs text-gray-400">No image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{p.name}</div>
                          <div className="text-xs text-gray-400">{p.kinds}</div>
                        </div>
                        {p.dist !== undefined && <div className="text-xs text-gray-500 mt-1">{Math.round(p.dist)} m away</div>}
                        <div className="mt-2 flex items-center gap-2">
                          <button onClick={() => window.dispatchEvent(new CustomEvent('aventra:addPlace', { detail: p }))} className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Add</button>
                          {(() => {
                            let detailsHref = '#';
                            if (p.osmLink) {
                              detailsHref = p.osmLink;
                            } else if (p.xid) {
                              detailsHref = `https://opentripmap.com/en/poi/${p.xid}`;
                            } else if (p.lat && p.lon) {
                              detailsHref = `https://www.openstreetmap.org/#map=18/${p.lat}/${p.lon}`;
                            }
                            return (
                              <a target="_blank" rel="noreferrer" href={detailsHref} className="text-sm text-gray-600 border px-3 py-1 rounded">Details</a>
                            );
                          })()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-3">
                  {results.map((r) => (
                    <li key={r.id} className="p-4 bg-white rounded shadow">
                      <div className="font-semibold text-lg">{r.title}</div>
                      <div className="text-sm text-gray-600">
                        {r.start_time || ""} • {r.venue_name || r.venue_address || ""}
                      </div>
                      {r.url && (
                        <div className="mt-2">
                          <a className="text-blue-600" href={r.url} target="_blank" rel="noreferrer">Open on source</a>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!loading && results && results.length === 0 && !error && (
            <div className="text-center text-gray-600">
              No results found — try a different query or date.
            </div>
          )}
        </div>
      </div>

      {/* Flight Details Modal */}
      {selectedFlight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold">
                  {selectedFlight.flight_number}
                </h2>
                <p className="text-blue-100">{selectedFlight.airline_name}</p>
              </div>
              <button
                onClick={() => setSelectedFlight(null)}
                className="text-2xl hover:text-gray-200"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 uppercase">
                    Departure
                  </h4>
                  <p className="text-lg font-bold text-gray-800">
                    {selectedFlight.origin_code}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedFlight.origin_name}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {selectedFlight.departure_time
                      ? new Date(selectedFlight.departure_time).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 uppercase">
                    Arrival
                  </h4>
                  <p className="text-lg font-bold text-gray-800">
                    {selectedFlight.destination_code}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedFlight.destination_name}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {selectedFlight.arrival_time
                      ? new Date(selectedFlight.arrival_time).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Flight Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium">
                      {selectedFlight.status || "Scheduled"}
                    </p>
                  </div>
                  {selectedFlight.aircraft_type && (
                    <div>
                      <span className="text-gray-600">Aircraft:</span>
                      <p className="font-medium">
                        {selectedFlight.aircraft_type}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Tip:</strong> Click "Book Flight" to proceed to
                  booking, or check the airline website directly for the latest
                  information.
                </p>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all">
                Book Flight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Featured Experiences Section */}
      <div className="py-20 px-6 bg-gray-50">
        <FeaturedActivities />
      </div>
    </div>
  );
}
