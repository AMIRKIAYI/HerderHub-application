import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();


  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const jwtToken = localStorage.getItem('accessToken');
      if (!jwtToken) {
        alert('You are not logged in. Please sign in again.');
        return;
      }

      try {
        const response = await axios.get('https://herderhub-application-production.up.railway.app/api/listings', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        const userListings = response.data.filter(
          (listing) => listing.sellerEmail === user.email
        );

        setListings(userListings);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
        setError('Error fetching listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user.email]);

  const handleEdit = (listingId) => {
    navigate(`/Account/MyListings/edit/${listingId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  console.log('Listings Data:', listings);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-brown mb-4">My Listings</h1>
      <p className="text-gray-700 mb-6">Manage and view your active and sold listings.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {listings.length > 0 ? (
          listings.map((listing) => {
            let images = [];
            try {
              images = Array.isArray(listing.images) ? listing.images : JSON.parse(listing.images);
            } catch (error) {
              console.error('Error parsing images:', error, listing.images);
            }

            const firstImage = images.length > 0 ? images[0] : 'https://via.placeholder.com/300';

            return (
              <div key={listing.id} className="bg-white border border-gray-200 rounded-lg shadow-md p-4">
                <img
                  src={`https://herderhub-application-production.up.railway.app/uploads/${firstImage}`}
                  alt={listing.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-800">{listing.title}</h3>
                <p className="text-gray-600">{listing.description}</p>
                <div className="mt-2 text-gray-800">
                  <span className="font-semibold">Price:</span> {listing.price}
                </div>
                <div className="mt-2 text-gray-600">
                  <span className="font-semibold">Category:</span> {listing.category}
                </div>
                <div className="mt-2 text-gray-600">
                  <span className="font-semibold">Sex:</span> {listing.sex}
                </div>
                <div className="mt-2 text-gray-600">
                  <span className="font-semibold">Age:</span> {listing.age}
                </div>
                <button
                  onClick={() => handleEdit(listing.id)}
                  className="mt-4 w-full bg-[#ff5100] text-white py-2 px-4 rounded-md hover:bg-[#e04a00] transition duration-200"
                >
                  Edit Listing
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 col-span-3 text-center">No listings found.</p>
        )}
      </div>
    </div>
  );
};

export default MyListings;
