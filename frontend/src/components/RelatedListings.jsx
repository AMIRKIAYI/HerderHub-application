import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';  // Import PropTypes

const RelatedListings = ({ category }) => {
  const [relatedListings, setRelatedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch related listings based on category
  useEffect(() => {
    const fetchRelatedListings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/listings/category/${category}`
        );
        setRelatedListings(response.data);
      } catch (error) {
        setError("Failed to fetch related listings.");
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchRelatedListings();
    }
  }, [category]);

  // Handle loading state
  if (loading) {
    return <div className="text-center text-xl text-gray-600">Loading related listings...</div>;
  }

  // Handle error state
  if (error) {
    return <div className="text-center text-xl text-red-500">{error}</div>;
  }

  // Handle empty related listings
  if (!relatedListings || relatedListings.length === 0) {
    return <div className="text-center text-xl text-gray-600">No related listings found.</div>;
  }

  return (
    <div className="bg-[#a50909] shadow-md rounded-lg p-4 mt-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Related Listings</h3>
      <ul>
        {relatedListings.map((listing) => (
          <li key={listing.id} className="mb-4">
            <Link 
              to={`/listing/${listing.id}`} 
              className="block p-4 bg-white hover:bg-gray-200 rounded-lg transition"
            >
              <div className="flex gap-4">
                {/* Listing Image */}
                <div className="flex-shrink-0">
                  {listing.images && listing.images.length > 0 && (
                    <img
                      src={`http://localhost:5000/uploads/${listing.images[0]}`}
                      alt={listing.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                </div>

                {/* Listing Details */}
                <div className="flex-grow">
                  <h4 className="text-xl font-semibold text-gray-700">{listing.title}</h4>
                  <p className="text-gray-600 truncate">{listing.description}</p>
                  <p className="text-gray-700 font-bold">Price: ${listing.price}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Define PropTypes for 'category'
RelatedListings.propTypes = {
  category: PropTypes.string.isRequired,  // Ensure category is a required string
};

export default RelatedListings;
