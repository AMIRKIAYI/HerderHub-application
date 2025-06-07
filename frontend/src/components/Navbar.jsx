import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser, faTimes, faPen } from '@fortawesome/free-solid-svg-icons';
import HerderHub5 from '../images/HerderHub5.png';
import './Navbar.css';
import './Div1.css';
import { Link, useNavigate } from 'react-router-dom';
import SignUp from './SignUp';
import SignIn from './SignIn';
import SearchInput from './SearchInput';

function Navbar({ data, onFilter }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isLoginMenuOpen, setLoginMenuOpen] = useState(false);
  const [isAccountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isSignUpVisible, setSignUpVisible] = useState(false);
  const [isSignInVisible, setSignInVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(false);
  const [showSignInAlert, setShowSignInAlert] = useState(false);
  const [isBrowseDropdownOpen, setBrowseDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);

  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length === 0) {
      setFilteredResults([]);
      onFilter(data);
      return;
    }

    const results = data.filter(item =>
      item.title.toLowerCase().includes(term.toLowerCase()) ||
      item.category.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredResults(results);
    onFilter(results);
  };

  const handlePostListingClick = () => {
    if (isLoggedIn) {
      navigate('/Postlisting');
    } else {
      setSignInVisible(true);
      setRedirectAfterLogin(true);
      setShowSignInAlert(true);
    }
  };

  const handleSignUpClick = () => {
    setLoginMenuOpen(false);
    setAccountMenuOpen(false);
    setSignInVisible(false);
    setSignUpVisible(true);
  };

  const handleSignInClick = () => {
    setLoginMenuOpen(false);
    setAccountMenuOpen(false);
    setSignUpVisible(false);
    setSignInVisible(true);
    setRedirectAfterLogin(false);
    setShowSignInAlert(false);
  };

  const closeSignUp = () => setSignUpVisible(false);
  const closeSignIn = () => {
    setSignInVisible(false);
    setShowSignInAlert(false);
  };

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);
  
  const handleLoginSuccess = () => {
    setSignInVisible(false);
    setLoginMenuOpen(false);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  
    if (redirectAfterLogin) {
      navigate('/Postlisting');
      setRedirectAfterLogin(false);
    }
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setAccountMenuOpen(false);
    localStorage.removeItem('isLoggedIn');
  };

  const loginMenuRef = useRef(null);

  const handleOutsideClick = (event) => {
    if (loginMenuRef.current && !loginMenuRef.current.contains(event.target)) {
      setLoginMenuOpen(false);
      setAccountMenuOpen(false);
      setMenuOpen(false);
      setBrowseDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={loginMenuRef}>
      <div className={`maindiv ${isSignUpVisible || isSignInVisible ? 'blurred' : ''}`}>
        <nav className="nav1 bg-brown border-gray-200 dark:bg-gray-900">
          <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <Link to="/" className="flex items-center space-x-1">
              <img src={HerderHub5} className="h-12" alt="HerderHub Logo" />
              <span className="self-center text-2xl font-semibold dark:text-white">HerderHub</span>
            </Link>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <a href="tel:5541251234" className="hidden sm:inline text-sm text-white-500 dark:text-white hover:underline">
                <FontAwesomeIcon icon={faPen} className="mr-1" /> Blog & Podcast
              </a>

              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setAccountMenuOpen(!isAccountMenuOpen)}
                    className="flex items-center p-2 text-sm text-white-600 dark:text-white-500 rounded"
                  >
                    <FontAwesomeIcon icon={faUser} />
                    <Link to="/Account"> <span className="ml-1">My Account</span></Link> 
                  </button>

                  {isAccountMenuOpen && (
                    <div className="account-menu open">
                      <ul>
                        <li><Link to="/Account" className="block text-white py-1">My Account</Link></li>
                        <li><Link to="/Account/Messages" className="block text-white py-1">Messages</Link></li>
                        <li><Link to="/Account/MyListings" className="block text-white py-1">Listings</Link></li>
                        <li><Link to="/Account/Settings" className="block text-white py-1">Settings</Link></li>
                        <li>
                          <button onClick={handleLogout} className="w-full text-left text-white py-1">Log Out</button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setLoginMenuOpen(!isLoginMenuOpen);
                    setMenuOpen(false);
                  }}
                  className="flex items-center p-2 text-sm text-white-600 dark:text-white-500 rounded"
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span className="ml-1">Login</span>
                </button>
              )}

              <button
                onClick={() => setMenuOpen(!isMenuOpen)}
                className="sm:hidden p-2 text-white-500 dark:text-white"
              >
                <FontAwesomeIcon icon={faBars} /> Menu
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Search */}
        <div className="sm:hidden px-4 py-3 dark:bg-gray-700">
       
<SearchInput 
  searchTerm={searchTerm}
  onSearchChange={handleSearchChange}
  listingsData={data} // Pass your listings data here
/>

        </div>

        <nav className="nav2 dark:bg-gray-700">
          <div className="max-w-screen-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <ul className="nav3 hidden sm:flex flex-row font-medium space-x-8 text-sm">
                <li><Link to="/" className="text-white dark:text-gray-200 hover:text-gray-400">Home</Link></li>
                <li className="relative"
                  onMouseEnter={() => setBrowseDropdownOpen(true)}
                  onMouseLeave={() => setBrowseDropdownOpen(false)}>
                    <Link to="/listings" className="text-white dark:text-gray-200 hover:text-gray-400">Browse Listings</Link>
                    {isBrowseDropdownOpen && (
                      <ul className="browse-dropdown">
                        <li><Link to="/listings?category=Livestock&title=Cattle">Cattle</Link></li>
                        <li><Link to="/listings?category=Livestock&title=Goat">Goats</Link></li>
                        <li><Link to="/listings?category=Livestock&title=Sheep">Sheep</Link></li>
                        <li><Link to="/listings?category=Livestock&title=Camel">Camel</Link></li>
                        <li><Link to="/listings?category=Livestock&title=Donkey">Donkey</Link></li>
                        <li><Link to="/listings?category=Product">Products</Link></li>
                      </ul>
                    )}
                </li>
                <li><Link to="/AboutUs" className="text-white dark:text-gray-200 hover:text-gray-400">About Us</Link></li>
                <li><Link to="/Help" className="text-white dark:text-gray-200 hover:text-gray-400">Help</Link></li>
              </ul>

              {/* Desktop Search and Post Listing */}
              <div className="hidden sm:flex items-center flex-grow mx-10">
                <div className="flex-grow max-w-md mr-4">
                  <SearchInput 
                    searchTerm={searchTerm}
                    filteredResults={filteredResults}
                    onSearchChange={handleSearchChange}
                  />
                </div>
                <button onClick={handlePostListingClick} className="ml-2 px-4 py-2 text-white newbag rounded whitespace-nowrap">
                  Post Listing
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Slide-out Menus */}
        <div className={`menu-slide ${isMenuOpen ? 'open' : ''}`}>
          <div className="close-button">
            <button onClick={() => setMenuOpen(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="block text-gray-900 dark:text-white hover:text-gray-400">Home</Link></li>
            <li onMouseEnter={() => setBrowseDropdownOpen(true)}
                onMouseLeave={() => setBrowseDropdownOpen(false)}>
              <Link to="/listings" className="block text-gray-900 dark:text-white hover:text-gray-400">Browse Listing</Link>
              {isBrowseDropdownOpen && (
                <ul className="browse-dropdown">
                  <li><Link to="/listings?category=Livestock&title=Cattle">Cattle</Link></li>
                  <li><Link to="/listings?category=Livestock&title=Goat">Goats</Link></li>
                  <li><Link to="/listings?category=Livestock&title=Sheep">Sheep</Link></li>
                  <li><Link to="/listings?category=Livestock&title=Camel">Camel</Link></li>
                  <li><Link to="/listings?category=Livestock&title=Donkey">Donkey</Link></li>
                  <li><Link to="/listings?category=Product">Products</Link></li>
                </ul>
              )}
            </li>
            <li><Link to="/AboutUs" className="block text-gray-900 dark:text-white hover:text-gray-400">About Us</Link></li>
            <li><Link to="/Help" className="block text-gray-900 dark:text-white hover:text-gray-400">Help</Link></li>
          </ul>
        </div>

        {/* Login Menu for non-logged-in users */}
        <div className={`login-slide ${isLoginMenuOpen ? 'open' : ''}`}>
          <div className="close-button">
            <button onClick={() => setLoginMenuOpen(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <ul className="space-y-4 p-4 text-sm">
            <li>
              <button onClick={handleSignUpClick} className="w-full text-left text-gray-900 dark:text-white hover:text-gray-900 newbar">Sign Up</button>
            </li>
            <li>
              <button onClick={handleSignInClick} className="w-full text-left text-gray-900 dark:text-white hover:text-gray-900 newbar">Sign In</button>
            </li>
          </ul>
        </div>
      </div>

      {/* SignUp and SignIn Modals */}
      {isSignUpVisible && <SignUp onClose={closeSignUp} onSignInClick={handleSignInClick} />}
      {isSignInVisible && <SignIn onClose={closeSignIn} onSignUpClick={handleSignUpClick} onLoginSuccess={handleLoginSuccess} showAlert={showSignInAlert} />}
    </div>
  );
}

Navbar.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
    })
  ).isRequired,
  onFilter: PropTypes.func.isRequired,
};

export default Navbar;