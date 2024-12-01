// import { useState, useEffect } from "react";
// import PropTypes from "prop-types";

// const EmailSellerForm = ({ listing }) => {
//   const [emailData, setEmailData] = useState({
//     subject: "",
//     message: "",
//   });
//   const [emailStatus, setEmailStatus] = useState("");
//   const [isSending, setIsSending] = useState(false);

//   useEffect(() => {
//     setEmailData((prev) => ({
//       ...prev,
//       subject: `Inquiry about ${listing.title || "the item"}`,
//     }));
//     setEmailStatus("");  // Clear previous status when the listing changes
//   }, [listing]);

//   const handleEmailChange = (e) => {
//     const { name, value } = e.target;
//     setEmailData({
//       ...emailData,
//       [name]: value,
//     });
//   };

//   const handleEmailSubmit = async (e) => {
//     e.preventDefault();
//     setIsSending(true);
//     setEmailStatus("Sending email...");

//     console.log("Form submitted. Sending email..."); // Add this line

//     const token = localStorage.getItem("authToken");

//     if (!token) {
//       setEmailStatus("You must be logged in to send an email.");
//       setIsSending(false);
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:5000/api/send-email", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           sellerEmail: listing.sellerEmail,
//           subject: emailData.subject,
//           message: emailData.message,
//         }),
//       });

//       const data = await response.json();

//       console.log("Response received:", data); // Add this line

//       if (response.ok) {
//         setEmailStatus("Email sent successfully!");
//       } else {
//         setEmailStatus(data.error || "Failed to send email.");
//       }
//     } catch (error) {
//       setEmailStatus("Error sending email. Please try again.");
//       console.error("Error sending email:", error);
//     } finally {
//       setIsSending(false);
//     }
// };


//   return (
//     <div className="max-w-md mx-auto mt-8 bg-white shadow-md rounded-lg p-6">
//       <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Seller</h2>
//       <form onSubmit={handleEmailSubmit}>
//         <div className="mb-4">
//           <label
//             htmlFor="subject"
//             className="block text-sm font-medium text-gray-700 mb-1"
//           >
//             Subject
//           </label>
//           <input
//             id="subject"
//             type="text"
//             name="subject"
//             value={emailData.subject}
//             onChange={handleEmailChange}
//             required
//             className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
//           />
//         </div>
//         <div className="mb-4">
//           <label
//             htmlFor="message"
//             className="block text-sm font-medium text-gray-700 mb-1"
//           >
//             Message
//           </label>
//           <textarea
//             id="message"
//             name="message"
//             value={emailData.message}
//             onChange={handleEmailChange}
//             required
//             className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
//             rows="4"
//           ></textarea>
//         </div>
//         <button
//           type="submit"
//           disabled={isSending}
//           className={`w-full px-4 py-2 rounded-md text-white ${
//             isSending
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-indigo-600 hover:bg-indigo-500"
//           } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
//         >
//           {isSending ? "Sending..." : "Send Email"}
//         </button>
//       </form>
//       {emailStatus && (
//   <p
//     className={`mt-4 text-sm ${
//       emailStatus.includes("success")
//         ? "text-green-600"
//         : "text-red-600"
//     }`}
//   >
//     {emailStatus}
//   </p>
// )}

// {/* Add this line to log the status */}
// {console.log("Email Status:", emailStatus)}

//     </div>
//   );
// };

// EmailSellerForm.propTypes = {
//   listing: PropTypes.shape({
//     sellerEmail: PropTypes.string.isRequired,
//     title: PropTypes.string.isRequired,
//   }).isRequired,
// };

// export default EmailSellerForm;
