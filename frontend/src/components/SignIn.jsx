import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import SignInValidation from './SignInValidation';  // Custom validation function for SignIn
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';  // Import the triangle exclamation icon



function SignIn({ onClose, onSignUpClick, onLoginSuccess, showAlert }) {
  SignIn.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSignUpClick: PropTypes.func.isRequired,
    onLoginSuccess: PropTypes.func.isRequired,
    showAlert: PropTypes.bool // New prop to display the alert
  };

  const [values, setValues] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Handle form input changes
  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setServerError("");  // Clear server error when user starts typing again
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = SignInValidation(values);
    setErrors(validationErrors);
  
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post('http://localhost:5000/signin', values);
        if (response.status === 200) {
          // Store JWT token and user data in localStorage
          localStorage.setItem('isLoggedIn', 'true'); // Persist login state
          localStorage.setItem('token', response.data.token); // Store the JWT token
          localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user details (email and username)
          navigate('/'); // Redirect or close modal on successful login
          onLoginSuccess();
        } else {
          setServerError("Login failed. Please check your credentials.");
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setServerError("Invalid email or password. Please try again.");
        } else {
          setServerError("Unable to connect to the server. Please try again later.");
        }
      }
    }
  };
  
  
  
  

  return (
    <section className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative w-full max-w-sm md:max-w-md bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
        
        {/* Header with close button */}
        <div className="bg-brown w-full relative p-4 rounded-t-lg">
          
          <h1 className="text-lg md:text-xl font-bold leading-tight tracking-tight text-white dark:text-white">
            Sign in to your account
          </h1>
          <button onClick={onClose} className="absolute top-2 right-2 text-white text-xl">
            &times;
          </button>
        </div>

        {/* Optional Alert Message */}
        {showAlert && (
          <div className="p-4 m-4 bg-red-100 text-red-700 text-sm rounded-lg mb-4 border border-red-500">
             <FontAwesomeIcon icon={faTriangleExclamation} /> {/* Alert Icon */}
            Please sign in to post a listing.
          </div>
        )}

        {/* Form content */}
        <div className="p-4 sm:p-6 space-y-4 md:space-y-6">
          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Your email
              </label>
              <input 
                type="email" 
                name="email" 
                id="email"
                value={values.email}
                onChange={handleInput}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                placeholder="name@company.com" 
                required 
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Password
              </label>
              <input 
                type="password" 
                name="password" 
                id="password"
                value={values.password}
                onChange={handleInput}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                placeholder="••••••••" 
                required 
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Server error message */}
            {serverError && <p className="text-red-500 text-sm mt-1">{serverError}</p>}

            <button 
              type="submit" 
              className="w-full text-white bg-brown hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Sign in
            </button>
            
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Don’t have an account yet? 
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault(); // Prevent default action of the link
                  onSignUpClick(); // Trigger the function to open SignUp modal
                }}
                className="font-medium text-brown hover:underline dark:text-primary-500"
              >
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default SignIn;
