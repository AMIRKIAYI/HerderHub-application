import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import SignUpValidation from './SignUpValidation';
import axios from 'axios';

function SignUp({ onClose, onSignInClick }) {
  SignUp.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSignInClick: PropTypes.func.isRequired,
  };

  const [values, setValues] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");  // For handling server-side errors

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setServerError("");  // Clear server error when user starts typing again
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Trim values to avoid trailing/leading spaces
    const trimmedValues = {
      ...values,
      email: values.email.trim(),
      password: values.password.trim(),
      confirmPassword: values.confirmPassword.trim(),
    };

    console.log("Submitting form with values:", trimmedValues);

    const validationErrors = SignUpValidation(trimmedValues);
    console.log("Validation errors:", validationErrors);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      axios.post('http://localhost:5000/signup', trimmedValues)
        .then(() => {
          console.log("User successfully registered!");
          alert("Signup successful! Redirecting to login...");
          onSignInClick(); // Redirect to SignIn if signup is successful
        })
        .catch((err) => {
          if (err.response) {
            console.log("Server error response:", err.response.data);
            if (err.response.status === 409) {
              setServerError("An account with this email already exists.");
            } else {
              setServerError("An error occurred. Please try again later.");
            }
          } else if (err.request) {
            console.log("No response from server:", err.request);
            setServerError("Unable to connect to the server. Please try again later.");
          } else {
            console.log("Request setup error:", err.message);
            setServerError("An unexpected error occurred.");
          }
        });
    } else {
      console.log("Fix validation errors before submitting.");
    }
};

  return (
    <section className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative w-full max-w-sm md:max-w-md bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
        
        <div className="bg-brown w-full relative p-4 rounded-t-lg">
          <h1 className="text-lg md:text-xl font-bold leading-tight tracking-tight text-white dark:text-white">
            Create an account
          </h1>
          <button onClick={onClose} className="absolute top-2 right-2 text-white text-xl">
            &times;
          </button>
        </div>

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

            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Confirm password
              </label>
              <input 
                type="password" 
                name="confirmPassword" 
                id="confirmPassword"
                value={values.confirmPassword}
                onChange={handleInput}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                placeholder="••••••••" 
                required 
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                  id="terms" 
                  type="checkbox" 
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" 
                  required 
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-light text-gray-500 dark:text-gray-300">
                  I accept the <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Terms and Conditions</a>
                </label>
              </div>
            </div>

            {/* Server error message */}
            {serverError && <p className="text-red-500 text-sm mt-2">{serverError}</p>}

            <button 
              type="submit" 
              className="w-full text-white bg-brown hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Create an account
            </button>
            
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Already have an account? <a href="#" onClick={onSignInClick} className="font-medium text-brown hover:underline dark:text-primary-500">Login here</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default SignUp;
