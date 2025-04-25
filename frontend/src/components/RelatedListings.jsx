import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

const RelatedListings = ({ category }) => {
  const [relatedListings, setRelatedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedListings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/listings/category/${category}`
        );
        
        // Process listings to ensure proper image URLs
        const processedListings = response.data.map(listing => ({
          ...listing,
          // Handle both stringified JSON and array formats
          images: typeof listing.images === 'string' 
            ? JSON.parse(listing.images) 
            : listing.images || [],
          // Create primaryImage URL
          primaryImage: listing.primaryImage || (
            listing.images && listing.images.length > 0 
              ? `http://localhost:5000/uploads/${listing.images[0].replace(/^\/?uploads\//, '')}`
              : 'https://via.placeholder.com/150'
          )
        }));
        
        setRelatedListings(processedListings);
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Failed to fetch related listings.");
      } finally {
        setLoading(false);
      }
    };

    if (category) fetchRelatedListings();
  }, [category]);

  const handleImageError = (e) => {
    console.error('Image failed to load:', e.target.src);
    e.target.src = 'https://via.placeholder.com/150';
    e.target.onerror = null; // Prevent infinite loop
  };

  if (loading) return <div className="text-center py-4 text-gray-600">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (!relatedListings.length) return <div className="text-center py-4 text-gray-600">No related listings found.</div>;


  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Related Listings</h3>
      <div className="space-y-4">
        {relatedListings.map((listing) => (
          <Link 
            key={listing.id} 
            to={`/listing/${listing.id}`}
            className="block p-3 hover:bg-gray-50 rounded-lg transition border border-gray-100"
          >
            <div className="flex gap-3 items-center">
              <div className="flex-shrink-0 w-20 h-20">
                <img
                  src={listing.primaryImage}
                  alt={listing.title}
                  className="w-full h-full object-cover rounded-lg"
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>
              
              <div className="flex-grow min-w-0">
                <h4 className="text-lg font-medium text-gray-800 truncate">{listing.title}</h4>
                <p className="text-gray-600 text-sm truncate">{listing.description}</p>
                <p className="text-green-600 font-bold">Ksh {new Intl.NumberFormat().format(listing.price)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

RelatedListings.propTypes = {
  category: PropTypes.string.isRequired,
};

export default RelatedListings;