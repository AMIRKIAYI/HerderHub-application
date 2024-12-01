import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faComment } from "@fortawesome/free-solid-svg-icons";
import RelatedListings from "./RelatedListings";
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import the toast styles


const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: `Inquiry about ${listing?.title || "Item"}`,
    message: "",
  });
  const [emailStatus, setEmailStatus] = useState(""); // State for email status



  // Advertisement messages
  const adMessages = [
    {
      text: "Connecting You to What Matters – Fast, Easy, Reliable! 😃😃",
      backgroundImage: "url('https://img.freepik.com/free-photo/peaceful-laid-back-sunset-with-herd-zebu-cattle-myanmar_181624-769.jpg?ga=GA1.1.1776042718.1729511895&semt=ais_hybrid')",
    },
    {
      text: "Discover. Connect. Trade Smarter! 🤝",
      backgroundImage: "url('https://img.freepik.com/premium-photo/horses-field_1048944-26320547.jpg?ga=GA1.1.1776042718.1729511895')",
    },
    {
      text: "Your Gateway to Better Deals and Smarter Choices! Hurry! Don't waste time! 🤔🤔",
      backgroundImage: "url('https://img.freepik.com/free-photo/goats-land-with-grass-eating_23-2148672989.jpg?ga=GA1.1.1776042718.1729511895&semt=ais_hybrid')",
    },
  ];

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
        console.log(response.data); // Debugging
        setListing(response.data);
      } catch (error) {
        console.error(error); // Debugging
        setError("Failed to fetch listing details.");
      } finally {
        setLoading(false);
      }
    };
    fetchListing();

    // Cycle through the ads every 5 seconds
    const adInterval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % adMessages.length);
    }, 5000); // Change ad every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(adInterval);
  }, [id]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? listing.images.length - 1 : prevIndex - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === listing.images.length - 1 ? 0 : prevIndex + 1));
  };

  const handleEmailClick = () => {
    console.log("Email Seller button clicked");
    setShowEmailForm(true);
  };

  const handleCloseEmailForm = () => {
    setShowEmailForm(false);
  };
  const user = JSON.parse(localStorage.getItem('user')) || { name: "Guest", email: "no-reply@example.com" };
  // console.log("User details:", user); // Debugging the user details
  
  // In the email submit function
  const handleEmailSubmit = async (e) => {
      e.preventDefault();
  
      // Log user details to verify the correct email is being used
      // console.log("User details:", user);
  
      // Log email data before sending to backend
      // console.log("Email data being sent:", {
      //     sellerEmail: listing.sellerEmail,  // Recipient's email
      //     subject: emailData.subject,        // Subject of the email
      //     message: emailData.message,        // Message content
      //     senderName: user?.username || "Anonymous", // User's name or fallback
      //     senderEmail: user?.email || "no-reply@example.com", // User's email or fallback
      // });
  
      try {
          const response = await fetch('http://localhost:5000/api/send-email', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  sellerEmail: listing.sellerEmail, // recipient's email
                  subject: emailData.subject,
                  message: emailData.message,
                  senderName: user?.username || "Anonymous", // fallback name
                  senderEmail: user?.email || "no-reply@example.com", // fallback email
              }),
          });
  
          const data = await response.json();
          if (response.ok) {
              setEmailStatus("Email sent successfully!");
              toast.success('Email sent successfully! ✔️', { position: "top-center", autoClose: 5000 }); // Show success toast
              handleCloseEmailForm();
              
          } else {
              setEmailStatus(data.error || "Failed to send email");
              toast.error(data.error || 'Failed to send email 😞', { position: "top-center", autoClose: 5000 }); // Show error toast
            
          }
      } catch (error) {
          console.error("Error in API request:", error);
          setEmailStatus("Error sending email");
          toast.error('Error sending email 😞', { position: "top-center", autoClose: 5000 }); // Show error toast
      }
  };
  


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  if (loading) {
    return <div className="text-center text-xl text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-xl text-red-500">{error}</div>;
  }

  if (!listing) {
    return <div className="text-center text-xl text-gray-600">No listing found.</div>;
  }

  return (
    <div className="flex flex-col mx-auto p-6 bg-gray-100 shadow-lg rounded-lg">
      {/* Advertisement Section */}
      <div
        className="relative bg-cover bg-center h-30 text-white text-center flex items-center justify-center p-3 mb-6 animate-zoom"
        style={{ backgroundImage: adMessages[currentAdIndex].backgroundImage }}
      >
        <p className="font-semibold text-lg">{adMessages[currentAdIndex].text}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-8 bg-white p-8">
        {/* Left side: Image Gallery with Carousel */}
        <div className="w-full md:w-1/2 space-y-4">
          {listing.images && listing.images.length > 0 ? (
            <div className="relative">
              <img
                src={`http://localhost:5000/uploads/${listing.images[currentImageIndex]}`}
                alt={listing.title}
                className="w-full h-72 object-cover rounded-lg shadow-md transition-all duration-500"
              />
              <button
                onClick={handlePrevImage}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700"
              >
                &lt;
              </button>
              <button
                onClick={handleNextImage}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700"
              >
                &gt;
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-center">No images available</p>
          )}
        </div>

        {/* Right side: Listing Details */}
        <div className="w-full md:w-1/2 space-y-4">
          <h2 className="text-3xl font-semibold text-gray-800">{listing.title}</h2>
          <p className="text-xl text-gray-600">{listing.description}</p>
          <div className="text-lg text-gray-900">
            <p>
              <span className="font-bold">Price:</span> Kshs {listing.price}
            </p>
            <p>
              <span className="font-bold">Location:</span> {listing.location}
            </p>
            <p>
              <span className="font-bold">Age:</span> {listing.age} years
            </p>
            <p>
              <span className="font-bold">Sex:</span> {listing.sex}
            </p>
            <p className="mt-2">
              <span className="font-bold">Additional Info:</span> {listing.additionalInfo}
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900">Seller Details</h3>
            <p className="text-lg text-gray-900">
              <span className="font-bold">Name:</span> {listing.sellerName}
            </p>
            <p className="text-lg text-gray-900">
              <span className="font-bold">Email:</span> {listing.sellerEmail}
            </p>
            <p className="text-lg text-gray-900">
              <span className="font-bold">Phone:</span> {listing.sellerPhone}
            </p>
            <p className="text-lg text-gray-900">
              <span className="font-bold">Address:</span> {listing.sellerAddress}
            </p>

            {/* Buttons for Email and Contact Seller */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                className="flex items-center justify-center px-4 py-2 text-sm bg-[#8b5cf6] text-white font-semibold rounded-md hover:bg-purple-600"
                onClick={handleEmailClick}
              >
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                Email Seller
              </button>
              <button
                className="flex items-center justify-center px-4 py-2 text-sm bg-brown text-white rounded-lg shadow-md hover:bg-brown-600 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                <FontAwesomeIcon icon={faComment} className="mr-2" />
                Leave a Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Listings */}
      <RelatedListings category={listing.category} />

      {/* Email Form Modal */}
      {showEmailForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Send an Email</h3>
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <label htmlFor="subject" className="block text-gray-700">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={emailData.subject}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-gray-700">Message</label>
                <textarea
                  id="message"
                  name="message"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows="5"
                  value={emailData.message}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded-lg"
                  onClick={handleCloseEmailForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Send Email
                </button>
              </div>
            </form>
            {/* Display email status */}
            {emailStatus && (
              <div>
                <p className={`mt-4 text-sm ${emailStatus.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {emailStatus}
                </p>
                <pre className="mt-4 bg-gray-100 p-2 rounded-lg text-xs text-gray-800">
                  {JSON.stringify(emailData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
       <ToastContainer /> {/* ToastContainer is required to display toast notifications */}
    </div>
  );
};

export default ListingDetail;
