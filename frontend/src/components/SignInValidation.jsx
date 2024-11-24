function SignInValidation(values) {
    let error = {};

    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const password_pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;

    if (!values.email) {
        error.email = "Email is required";
    } else if (!email_pattern.test(values.email)) {
        error.email = "Invalid email format";
    }

    if (!values.password) {
        error.password = "Password is required";
    } else if (!password_pattern.test(values.password)) {
        error.password = "Password must be at least 8 characters, with uppercase, lowercase, number, and special character.";
    }

    return error;
}

export default SignInValidation;
