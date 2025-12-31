import React from "react";

export default function Tokyo() {
  const handleAddToWishlist = async () => {
    const email = localStorage.getItem("userEmail"); // saved at login

    const response = await fetch("/api/wishlist/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination: "Tokyo", email }),
    });

    const data = await response.json();
    alert(data.message);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6">Tokyo, Japan</h1>

      <img
        src="/images/tokyo.jpg"
        alt="Tokyo"
        className="rounded-xl shadow-lg w-full mb-8"
      />

      {/* Want to go Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleAddToWishlist}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          ❤️ Want to go
        </button>
      </div>

      {/* Things To Do */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Top Things to Do</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Visit Shibuya Crossing</li>
          <li>Explore Senso-ji Temple</li>
          <li>Walk around Akihabara Electric Town</li>
          <li>Eat sushi at Tsukiji Outer Market</li>
          <li>Relax at Ueno Park</li>
        </ul>
      </section>

      {/* YouTube Recommendations */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
          📹 YouTube Travel Guides
        </h2>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <iframe
              title="Tokyo - Guide 1"
              className="w-full h-64 rounded-2xl"
              src="https://www.youtube.com/embed/d-0r4VQKcK4"
              allowFullScreen
            ></iframe>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <iframe
              title="Tokyo - Guide 2"
              className="w-full h-64 rounded-2xl"
              src="https://www.youtube.com/embed/4N8UQYdM6x4"
              allowFullScreen
            ></iframe>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <iframe
              title="Tokyo - Guide 3"
              className="w-full h-64 rounded-2xl"
              src="https://www.youtube.com/embed/sWEBl9A4lNY"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Best Time to Visit */}
      <section className="mb-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
          📅 Best Time to Visit
        </h3>
        <p className="text-gray-700 text-lg">
          Spring (March-May) for cherry blossoms 🌸 or Fall (September-November) for perfect weather!
        </p>
      </section>

      {/* TikTok Embed */}
      <section className="mb-10">
        <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
          TikTok Recommendations 🎵
        </h2>
        <p className="text-center text-gray-700 mb-8 text-lg">Check out these amazing Tokyo vibes! ✨</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="https://www.tiktok.com/t/ZP8DnXUhb/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <img
              src="/images/tokyo.jpg"
              alt="Tokyo TikTok"
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">🎵 Watch on TikTok</span>
            </div>
          </a>

          <a
            href="https://www.tiktok.com/t/ZP8DnqHKy/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <img
              src="/images/tokyo_tour.jpg"
              alt="Tokyo Tour TikTok"
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">🎵 Watch on TikTok</span>
            </div>
          </a>

          <a
            href="https://www.tiktok.com/t/ZP8DW6HAu/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <img
              src="/images/tokyo.png"
              alt="Tokyo City TikTok"
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">🎵 Watch on TikTok</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
