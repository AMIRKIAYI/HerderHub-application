import { useState } from "react";
import PropTypes from "prop-types";  // Import PropTypes

const EmailSellerForm = ({ listing }) => {
  const [emailData, setEmailData] = useState({
    subject: "",
    message: "",
  });

  const [emailStatus, setEmailStatus] = useState(""); // Email status state

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData({
      ...emailData,
      [name]: value
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailStatus("Sending email...");

    const token = localStorage.getItem("authToken"); // Get JWT token from localStorage

    try {
      const response = await fetch("http://localhost:5000/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`  // Send the token in the Authorization header
        },
        body: JSON.stringify({
          sellerEmail: listing.sellerEmail,
          subject: emailData.subject,
          message: emailData.message
        })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailStatus("Email sent successfully!");
      } else {
        setEmailStatus(data.error || "Failed to send email");
      }
    } catch (error) {
      setEmailStatus("Error sending email");
    }
  };

  return (
    <div>
      <h2>Contact Seller</h2>
      <form onSubmit={handleEmailSubmit}>
        <div>
          <label>Subject:</label>
          <input
            type="text"
            name="subject"
            value={emailData.subject}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div>
          <label>Message:</label>
          <textarea
            name="message"
            value={emailData.message}
            onChange={handleEmailChange}
            required
          ></textarea>
        </div>
        <button type="submit">Send Email</button>
      </form>

      {emailStatus && <p>{emailStatus}</p>}
    </div>
  );
};

// PropTypes validation for the component
EmailSellerForm.propTypes = {
  listing: PropTypes.shape({
    sellerEmail: PropTypes.string.isRequired, // Expect sellerEmail as a string
  }).isRequired, // The listing prop should always be passed
};

export default EmailSellerForm;
