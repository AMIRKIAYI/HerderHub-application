import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './LatestListings.css';

function LatestListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestListings = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://herderhub-application-production.up.railway.app/api/latest-listings?page=1");
        if (response.data && response.data.length > 0) {
          // Ensure listings have properly formatted image URLs
          const processedListings = response.data.map(listing => ({
            ...listing,
            // Use primaryImage if provided by API, or construct fallback
            displayImage: listing.primaryImage || 
              (listing.images && listing.images.length > 0 
                ? `https://herderhub-application-production.up.railway.app/uploads/${listing.images[0]}`
                : 'https://via.placeholder.com/300')
          }));
          setListings(processedListings);
        } else {
          setError("No listings found.");
        }
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestListings();
  }, []);

  // Handle image loading errors
  const handleImageError = (e) => {
    console.error('Failed to load image:', e.target.src);
    e.target.src = 'https://via.placeholder.com/300';
    e.target.onerror = null; // Prevent infinite loop
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><p className="text-gray-500">Loading...</p></div>;
  if (error) return <div className="flex items-center justify-center h-screen"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-center text-2xl font-bold mb-6">Latest Listings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow-lg p-4">
            <img
              src={listing.displayImage}
              alt={listing.title}
              className="w-full h-48 object-cover rounded"
              onError={handleImageError}
              loading="lazy"
            />
            <h3 className="text-lg font-semibold mt-2">{listing.title}</h3>
            <p className="text-gray-600">{listing.description || "No description"}</p>
            <p className="text-green-600 font-medium">Kshs {new Intl.NumberFormat().format(listing.price)}</p>
            <div className="mt-4 flex justify-between">
              <button
                className="px-4 py-2 bg-[#a52a2a] text-white rounded hover:bg-[#a50909]"
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <button
          className="px-9 py-3 bg-[#a52a2a] text-white rounded hover:bg-[#a50909]"
          onClick={() => navigate('/listings')}
        >
          View All
        </button>
      </div>
    </div>
  );
}

export default LatestListings;