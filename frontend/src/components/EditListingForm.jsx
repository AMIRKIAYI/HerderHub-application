import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';


const EditListingForm = () => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null); // To handle new image upload
  const { id } = useParams(); // Get the listing ID from the URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const jwtToken = localStorage.getItem('accessToken');
        const response = await axios.get(`https://herderhub-application-production.up.railway.app/api/listings/${id}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setListing(response.data);
      } catch (error) {
        console.error('Error fetching listing:', error);
        setError('Failed to fetch listing data.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setListing({ ...listing, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Store the selected image file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('title', listing.title);
    formData.append('description', listing.description);
    formData.append('category', listing.category);
    formData.append('price', listing.price);
    formData.append('quantity', listing.quantity);
    formData.append('location', listing.location);
    formData.append('additionalInfo', listing.additionalInfo);
    formData.append('sellerName', listing.sellerName);
    formData.append('sellerEmail', listing.sellerEmail);
    formData.append('sellerPhone', listing.sellerPhone);
    formData.append('sellerAddress', listing.sellerAddress);
    formData.append('age', listing.age);
    formData.append('sex', listing.sex);
  
    if (image) {
      formData.append('images', image); // Assuming backend expects 'images'
    }
  
    try {
      const jwtToken = localStorage.getItem('accessToken');
      await axios.put(`https://herderhub-application-production.up.railway.app/api/update-listing/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'multipart/form-data', // This is necessary for file uploads
        },
      });
      // Show success toast
      Toastify({
        text: "Listing updated successfully!",
        duration: 3000,
        gravity: "top", // Show at top
        position: "right", // Position to the right
        backgroundColor: "#4caf50", // Green color for success
        close: true, // Show close button
        avatar: "https://cdn.jsdelivr.net/npm/toastify-js/src/images/success.svg", // Animated check mark icon
        stopOnFocus: true, // Stop when focused
      }).showToast();
  
      navigate('/Account/MyListings'); // Redirect to listings page
    } catch (error) {
      console.error('Error updating listing:', error.response ? error.response.data : error.message);
      alert(error.response ? error.response.data.error : 'Failed to update listing. Please try again.');
    }
  };
  

  if (loading) {
    return <div className="text-center text-lg">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Edit Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={listing.title || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5100] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            value={listing.description || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5100] focus:border-transparent"
            rows="4"
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-gray-700 font-medium mb-2">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={listing.price || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5100] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-gray-700 font-medium mb-2">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={listing.quantity || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5100] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-gray-700 font-medium mb-2">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={listing.location || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5100] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="additionalInfo" className="block text-gray-700 font-medium mb-2">Additional Info</label>
          <input
            type="text"
            id="additionalInfo"
            name="additionalInfo"
            value={listing.additionalInfo || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5100] focus:border-transparent"
          />
        </div>

        {/* Seller Information Fields */}
        <div>
          <label htmlFor="sellerName" className="block text-gray-700 font-medium mb-2">Seller Name</label>
          <input
            type="text"
            id="sellerName"
            name="sellerName"
            value={listing.sellerName || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5100] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="sellerEmail" className="block text-gray-700 font-medium mb-2">Seller Email</label>
          <input
            type="email"
            id="sellerEmail"
            name="sellerEmail"
            value={listing.sellerEmail || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5100] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="sellerPhone" className="block text-gray-700 font-medium mb-2">Seller Phone</label>
          <input
            type="text"
            id="sellerPhone"
            name="sellerPhone"
            value={listing.sellerPhone || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5100] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="sellerAddress" className="block text-gray-700 font-medium mb-2">Seller Address</label>
          <input
            type="text"
            id="sellerAddress"
            name="sellerAddress"
            value={listing.sellerAddress || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5100] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-gray-700 font-medium mb-2">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={listing.age || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5100] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="sex" className="block text-gray-700 font-medium mb-2">Sex</label>
          <input
            type="text"
            id="sex"
            name="sex"
            value={listing.sex || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5100] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-gray-700 font-medium mb-2">Upload New Image</label>
          <input
            type="file"
            id="image"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5100] focus:border-transparent"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="w-full py-3 bg-[#ff5100] text-white text-lg rounded-md hover:bg-[#d94c00] focus:outline-none transition duration-300"
          >
            Update Listing
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditListingForm;
