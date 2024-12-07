import  { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Div1.css';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { AuthContext } from './AuthContext'

function Div1() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSignInVisible, setSignInVisible] = useState(false);
  const [showSignInAlert, setShowSignInAlert] = useState(false);
  const [isSignUpVisible, setSignUpVisible] = useState(false);
  const { handleLoginSuccess } = useContext(AuthContext); // Access handleLoginSuccess from context
  const navigate = useNavigate();

  const images = [
    "https://img.freepik.com/premium-photo/group-cow-herd-is-feeding-grass-dry-field_40260-137.jpg",
    "https://img.freepik.com/premium-photo/herd-cows-with-number-1-back_1216215-2781.jpg",
    "https://img.freepik.com/premium-photo/cattle-morning-light-herd-cattle-flock-together-early-morning-light_1028938-227096.jpg",
    "https://img.freepik.com/premium-photo/herd-cows-are-standing-field-with-sun-setting-them_1295019-9592.jpg",
    "https://img.freepik.com/premium-photo/cows-standing-field_1048944-29670284.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handlePostListingClick = () => {
    const user = localStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : null;

    if (parsedUser && parsedUser.id && parsedUser.email) {
      navigate('/Postlisting');
    } else {
      setSignInVisible(true);
      setShowSignInAlert(true);
    }
  };

  const closeSignIn = () => setSignInVisible(false);
  const closeSignUp = () => setSignUpVisible(false);

  const handleSignInClick = () => {
    setSignUpVisible(false);
    setSignInVisible(true);
    setShowSignInAlert(false);
  };

  const handleSignUpClick = () => {
    setSignInVisible(false);
    setSignUpVisible(true);
  };

  return (
    <div id="default-carousel" className="relative w-full">
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

      {isSignUpVisible && <SignUp onClose={closeSignUp} onSignInClick={handleSignInClick} />}
      {isSignInVisible && (
        <SignIn
          onClose={closeSignIn}
          onSignUpClick={handleSignUpClick}
          onLoginSuccess={() => {
            handleLoginSuccess();
            closeSignIn();
            navigate('/Postlisting');
          }}
          showAlert={showSignInAlert}
        />
      )}
    </div>
  );
}

export default Div1;
