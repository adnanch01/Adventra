import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";

// Booking Modal Component
function BookingModal({ activity, onClose }) {
  const [formData, setFormData] = useState({
    date: "",
    time: "morning",
    guests: 1,
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally send this to your backend
    alert(`✅ Booking confirmed for ${activity.title}!\n\nDate: ${formData.date}\nGuests: ${formData.guests}\nTotal: ${activity.price} x ${formData.guests} = $${parseFloat(activity.price.slice(1)) * formData.guests}\n\nA confirmation email will be sent to ${formData.email}`);
    onClose();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <img
            src={activity.img}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-6 text-white">
            <h2 className="text-3xl font-bold mb-1">{activity.title}</h2>
            <p className="text-sm flex items-center gap-2">
              <span>📍 {activity.city}</span>
              <span>⏱️ {activity.duration}</span>
              <span className="bg-white/20 px-2 py-1 rounded">⭐ {activity.rating}</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Price per person:</span>
              <span className="text-2xl font-bold text-blue-600">{activity.price}</span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time *
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="morning">Morning (8AM-12PM)</option>
                <option value="afternoon">Afternoon (12PM-5PM)</option>
                <option value="evening">Evening (5PM-9PM)</option>
              </select>
            </div>
          </div>

          {/* Number of Guests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Guests *
            </label>
            <input
              type="number"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              min="1"
              max="20"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              Total: ${parseFloat(activity.price.slice(1)) * formData.guests}
            </p>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              rows="3"
              placeholder="Any dietary restrictions, accessibility needs, or special occasions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          {/* Reviews Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span>⭐</span>
              What Travelers Are Saying ({activity.reviews} reviews)
            </h3>
            
            {/* Overall Rating */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-yellow-600">{activity.rating}</div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(activity.rating) ? "text-yellow-500" : "text-gray-300"}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">Based on {activity.reviews} reviews</p>
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {activity.userReviews?.map((review, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{review.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < review.rating ? "text-yellow-500" : "text-gray-300"}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const allActivities = [
  {
    title: "Tokyo Tower Night Walking Tour",
    city: "Tokyo",
    img: "/images/tokyo_tour.jpg",
    path: "/featured/tokyo-tour",
    price: "$45",
    duration: "3 hours",
    rating: 4.8,
    reviews: 342,
    description: "Experience Tokyo's dazzling skyline at night",
    userReviews: [
      { name: "Sarah M.", rating: 5, date: "2 weeks ago", comment: "Absolutely magical! The night views of Tokyo Tower were breathtaking. Our guide was knowledgeable and friendly." },
      { name: "James K.", rating: 5, date: "1 month ago", comment: "Best tour ever! Walking through the illuminated streets was unforgettable. Highly recommend!" },
      { name: "Emily R.", rating: 4, date: "3 weeks ago", comment: "Great experience overall. The timing was perfect for sunset. Only wish it was a bit longer!" }
    ]
  },
  {
    title: "Sailing Through the Norwegian Fjords",
    city: "Norway",
    img: "/images/norway.jpg",
    path: "/norway",
    price: "$120",
    duration: "Full day",
    rating: 4.9,
    reviews: 567,
    description: "Breathtaking cruise through majestic fjords",
    userReviews: [
      { name: "Michael T.", rating: 5, date: "1 week ago", comment: "Stunning scenery! The fjords are even more beautiful in person. The boat was comfortable and the crew was excellent." },
      { name: "Lisa P.", rating: 5, date: "2 weeks ago", comment: "A once-in-a-lifetime experience! We saw waterfalls, mountains, and even some seals. Worth every penny." },
      { name: "David H.", rating: 4, date: "1 month ago", comment: "Beautiful tour but the weather was a bit cold. Bring warm clothes! Otherwise perfect." }
    ]
  },
  {
    title: "Hot Air Balloon Ride in Cappadocia",
    city: "Cappadocia",
    img: "/images/capadocia.jpg",
    path: "/cappadocia",
    price: "$180",
    duration: "2 hours",
    rating: 5.0,
    reviews: 891,
    description: "Soar above fairy chimneys at sunrise",
    userReviews: [
      { name: "Amanda W.", rating: 5, date: "3 days ago", comment: "INCREDIBLE! Watching the sunrise from a hot air balloon over Cappadocia was the highlight of our trip. The pilot was skilled and made us feel safe." },
      { name: "Robert L.", rating: 5, date: "1 week ago", comment: "Bucket list item checked! The views were surreal. Seeing hundreds of balloons in the sky together was magical." },
      { name: "Jessica C.", rating: 5, date: "2 weeks ago", comment: "Best money I've ever spent on a tour. The champagne toast at the end was a nice touch. 10/10 would do again!" }
    ]
  },
  {
    title: "Explore the Glowworm Caves",
    city: "Waitomo",
    img: "/images/waitmo.jpg",
    path: "/waitomo",
    price: "$65",
    duration: "2.5 hours",
    rating: 4.7,
    reviews: 234,
    description: "Marvel at thousands of glowworms in mystical caves",
    userReviews: [
      { name: "Chris B.", rating: 5, date: "5 days ago", comment: "Like being in a natural planetarium! The glowworms created a starry sky effect. Simply mesmerizing." },
      { name: "Rachel S.", rating: 4, date: "2 weeks ago", comment: "Really cool experience. The cave boat ride was peaceful and the glowworms were beautiful. A bit chilly inside though!" },
      { name: "Mark D.", rating: 5, date: "3 weeks ago", comment: "Nature at its finest! Our kids were amazed. The guide explained everything perfectly. A must-do in New Zealand!" }
    ]
  },
];

export default function FeaturedActivities() {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rating"); // rating, price, duration
  const [bookingModal, setBookingModal] = useState(null); // Track which activity to book
  const navigate = useNavigate();

  // Filter by city and search
  let filtered = filter === "All"
    ? allActivities
    : allActivities.filter((a) => a.city === filter);

  // Search filter
  if (searchTerm) {
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Sort activities
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "price") return parseFloat(a.price.slice(1)) - parseFloat(b.price.slice(1));
    if (sortBy === "reviews") return b.reviews - a.reviews;
    return 0;
  });

  const cities = ["All", ...new Set(allActivities.map((a) => a.city))];

  return (
    <section className="max-w-7xl mx-auto text-center px-4">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
        Featured Activities
      </h2>
      <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
        Handpicked adventures across the world — from breathtaking mountains to hidden natural wonders.
      </p>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search activities, cities, or experiences..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 pl-12 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="flex justify-center mb-6">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none cursor-pointer bg-white"
        >
          <option value="rating">Sort by Rating</option>
          <option value="price">Sort by Price</option>
          <option value="reviews">Sort by Popularity</option>
        </select>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center mb-10 flex-wrap gap-3">
        {cities.map((city, idx) => (
          <button
            key={idx}
            onClick={() => setFilter(city)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 transform ${
              filter === city
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:scale-105"
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.length > 0 ? (
          filtered.map((item, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Image */}
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out"
              />

              {/* Rating Badge */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <span className="text-yellow-500 text-sm">⭐</span>
                <span className="text-sm font-semibold text-gray-800">{item.rating}</span>
                <span className="text-xs text-gray-500">({item.reviews})</span>
              </div>

              {/* Price Tag */}
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                {item.price}
              </div>

              {/* Overlay - pointer-events-none so clicks pass through */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none"></div>

              {/* Content - relative z-index to be above overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white transition-all duration-500 z-10">
                {/* Title & Location */}
                <div className="mb-2">
                  <h4 className="text-xl font-semibold mb-1 line-clamp-2">{item.title}</h4>
                  <p className="text-sm text-gray-200 flex items-center gap-1">
                    <span>📍</span>
                    {item.city}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-300 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">
                  {item.description}
                </p>

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm text-gray-200 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span>⏱️</span>
                  <span>{item.duration}</span>
                </div>

                {/* Book Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Book Now clicked for:", item.title);
                    setBookingModal(item);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Book Now
                </button>
              </div>

              {/* Animated Glow Border */}
              <div className="absolute inset-0 ring-0 group-hover:ring-4 ring-blue-400/50 rounded-2xl transition-all duration-500"></div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-gray-500">
            <p className="text-xl">No activities found matching your search.</p>
            <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Booking Modal - Using Portal to render at document root */}
      {bookingModal && ReactDOM.createPortal(
        <BookingModal
          activity={bookingModal}
          onClose={() => setBookingModal(null)}
        />,
        document.body
      )}
    </section>
  );
}
