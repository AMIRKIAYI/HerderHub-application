import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import './LatestListings.css'

function LatestListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();  // Initialize useNavigate hook

  useEffect(() => {
    const fetchLatestListings = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/latest-listings?page=1");
        console.log("API Response:", response.data); // Debug
        if (response.data && response.data.length > 0) {
          setListings(response.data);
        } else {
          setError("No listings found.");
        }
      } catch (err) {
        console.error("API Error:", err); // Debug
        setError("Failed to load listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestListings();
  }, []);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Render listings
  return (
    <div className="container mx-auto px-4 py-8 ">
      <h2 className="text-center text-2xl font-bold mb-6">Latest Listings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => {
          // Check if there are multiple images, use the first image if available
          const imageUrl = listing.images && listing.images.length > 0
            ? `http://localhost:5000/uploads/${listing.images[0]}` // Display only the first image
            : "https://via.placeholder.com/300"; // Fallback image if no images available


          // Format price with commas
          const formattedPrice = new Intl.NumberFormat().format(listing.price);

          return (
            <div key={listing.id} className="bg-white rounded-lg shadow-lg p-4">
              <img
                src={imageUrl}
                alt={listing.title}
                className="w-full h-48 object-cover rounded"
              />
              <h3 className="text-lg font-semibold mt-2">{listing.title}</h3>
              <p className="text-gray-600">{listing.description || "No description"}</p>
              <p className="text-green-600 font-medium">Kshs {formattedPrice}</p>
              <div className="mt-4 flex justify-between">
                {/* Add onClick handler to navigate to the ListingDetail page */}
                <button
                  className="px-4 py-2 bg-[#a52a2a] text-white rounded hover:bg-[#a50909]"
                  onClick={() => navigate(`/listing/${listing.id}`)} // Navigate on click
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Add "View All" button */}
      <div className="mt-12 text-center">
        <button
          className="px-9 py-3 bg-[#a52a2a] text-white rounded hover:bg-[#a50909]"
          onClick={() => navigate('/listings')} // Navigate to Listings component
        >
          View All
        </button>
      </div>
    </div>
  );
}

export default LatestListings;
