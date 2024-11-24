import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './Div1.css'
import SignIn from './SignIn';

function Div1() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [isSignInVisible, setSignInVisible] = useState(false); // To show sign-in modal
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(false); // Flag for redirection after login
  const [showSignInAlert, setShowSignInAlert] = useState(false); // New state for sign-in alert

  const navigate = useNavigate(); // Use the useNavigate hook for navigation

  // Array of image URLs
  const images = [
    "https://img.freepik.com/premium-photo/group-cow-herd-is-feeding-grass-dry-field_40260-137.jpg?ga=GA1.1.1776042718.1729511895&semt=ais_hybrid",
    "https://img.freepik.com/premium-photo/herd-cows-with-number-1-back_1216215-2781.jpg?ga=GA1.1.1776042718.1729511895&semt=ais_hybrid",
    "https://img.freepik.com/premium-photo/cattle-morning-light-herd-cattle-flock-together-early-morning-light_1028938-227096.jpg?ga=GA1.1.1776042718.1729511895&semt=ais_hybrid",
    "https://img.freepik.com/premium-photo/herd-cows-are-standing-field-with-sun-setting-them_1295019-9592.jpg?ga=GA1.1.1776042718.1729511895&semt=ais_hybrid",
    "https://img.freepik.com/premium-photo/cows-standing-field_1048944-29670284.jpg?ga=GA1.1.1776042718.1729511895&semt=ais_hybrid"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    // If user is already logged in, automatically redirect to Post Listing page
    if (isLoggedIn) {
      navigate('/Postlisting');
    }
  }, [isLoggedIn, navigate]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Handle the Post Listing button click
  const handlePostListingClick = () => {
    if (isLoggedIn) {
      navigate('/Postlisting'); // Redirect to post listing if logged in
    } else {
      setSignInVisible(true); // Show the sign-in modal
      setRedirectAfterLogin(true); // Flag to redirect after login
      setShowSignInAlert(true); // Show alert on sign-in form
    }
  };

  // Close the sign-in modal
  const closeSignIn = () => {
    setSignInVisible(false);
  };

  // After successful login, redirect if necessary
  const handleLoginSuccess = () => {
    setSignInVisible(false);
    setIsLoggedIn(true);

    if (redirectAfterLogin) {
      navigate('/Postlisting'); // Redirect to post listing after login
      setRedirectAfterLogin(false); // Reset flag
    }
  };

  return (
    <div id="default-carousel" className="relative w-full">
      {/* Responsive overlay for heading, paragraph, and buttons */}
      <div className="absolute text-white w-920 top-4 left-4 md:top-10 md:left-10 z-40 p-4 rounded-lg shadow-lg max-w-xs md:max-w-md lg:max-w-lg">
        <h2 className="text-lg md:text-5xl font-bold mb-2">Welcome HerderHub</h2>
        <p className="text-lg md:text-base mb-4 text-white">
          Find or Post your livestock with our app.
        </p>
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
          <button
            onClick={handlePostListingClick}
            className="w-full md:w-auto newbag text-white px-4 py-2 rounded"
          >
            Post Listing
          </button>
          <button className="w-full md:w-auto border-2 text-white px-4 py-2 rounded hover:bg-brown-600">
            Browse Listing
          </button>
        </div>
      </div>

      <div className="relative h-56 overflow-hidden md:h-96">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ zIndex: index === currentIndex ? 10 : 0 }}
          >
            <img src={image} className="block w-full h-full object-cover" alt="Slide" />
          </div>
        ))}
      </div>

      <div className="absolute z-30 flex bottom-5 left-1/2 transform -translate-x-1/2 space-x-3">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
            onClick={() => setCurrentIndex(index)}
          ></button>
        ))}
      </div>

      <button onClick={handlePrev} className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70">
          <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
          </svg>
          <span className="sr-only">Previous</span>
        </span>
      </button>
      <button onClick={handleNext} className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70">
          <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 9l4-4-4-4" />
          </svg>
          <span className="sr-only">Next</span>
        </span>
      </button>

      {/* Show the Sign In Modal only if the user is not logged in */}
      {isSignInVisible && !isLoggedIn && <SignIn onClose={closeSignIn} onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
}

export default Div1;
