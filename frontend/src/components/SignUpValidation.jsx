function SignUpValidation(values) {
    let errors = {};
  
    // Regular expressions for validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;

  
    // Validate email
    if (!values.email) {
      errors.email = "Email is required";
    } else if (!emailPattern.test(values.email)) {
      errors.email = "Invalid email format";
    }
  
    // Validate password
    if (!values.password) {
      errors.password = "Password is required";
    } else if (!passwordPattern.test(values.password.trim())) {
      errors.password = "Password must be at least 8 characters long, with uppercase, lowercase, number, and special character.";
    }
    
  
    // Validate confirm password
    if (!values.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (values.password && values.confirmPassword !== values.password) {
      errors.confirmPassword = "Passwords do not match";
    }
  
    return errors;
  }
  
  export default SignUpValidation;
  