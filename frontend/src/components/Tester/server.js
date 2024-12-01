const express = require('express');
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken"); // Import JWT for user authentication


const app = express();
app.use(cors());
app.use(express.json());


// Secret key for JWT token
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';



// Nodemailer transport configuration for email sending
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Use your mail service (Gmail in this case)
  auth: {
      user: process.env.EMAIL_USER,  // Use email from environment variable
      pass: process.env.EMAIL_PASS   // Use app-specific password from environment variable
  }
});



// JWT authentication middleware to verify user
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
      return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
          return res.status(403).json({ error: "Invalid token" });
      }
      req.user = user; // Attach user data to the request
      next();
  });
};


// POST endpoint to handle email submission (send email from logged-in user)
app.post('/api/send-email', authenticateToken, (req, res) => {
  const { sellerEmail, subject, message } = req.body;

  const senderEmail = req.user.email; // Get the sender's email from the authenticated user

  // Define email options
  const mailOptions = {
      from: senderEmail, // Sender's email address (dynamically fetched from authenticated user)
      to: sellerEmail,   // Seller's email address (recipient)
      subject: subject,  // Email subject
      text: message,     // Email message content
      html: `
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <p><strong>Sender's Email:</strong> ${senderEmail}</p>
      `  // HTML version of the email (you can customize this further)
  };

  // Send the email using the transporter
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ error: "Failed to send email" });
      }

      res.status(200).json({ message: "Email sent successfully", info });
  });
});

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer for handling image uploads
// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Directory to store images
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to avoid filename conflicts
    }
  });

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max per image
    },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Only images are allowed"), false);
        }
    }
});

// MySQL database connection
const db = mysql.createConnection({
    host: "localhost",  // Database host
    user: "root",       // MySQL username
    password: "Amir@2024#",  // MySQL password
    database: "signup"  // Database name
});

// Test the MySQL connection
db.connect((err) => {
    if (err) {
        console.error("Database connection error:", err.message);
        return;
    }
    console.log("Connected to the database.");
});



  





app.get("/api/listings/category/:category", (req, res) => {
    const { category } = req.params;
  
    let query = "SELECT * FROM listings WHERE category = ?";
    db.execute(query, [category], (err, results) => {
      if (err) {
        console.error("Error fetching listings by category:", err.message);
        return res.status(500).json({ error: "Failed to fetch listings by category" });
      }
  
      res.status(200).json(results);
    });
  });
  


// / GET endpoint to fetch a single listing by ID
app.get("/api/listings/:id", (req, res) => {
    const listingId = req.params.id;
  
    const query = "SELECT * FROM listings WHERE id = ?";
    db.execute(query, [listingId], (err, results) => {
      if (err) {
        console.error("Error fetching listing:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: "Listing not found" });
      }
  
      const listing = results[0];
      let images = [];
  
      // Assuming images are stored as a JSON string
      try {
        if (typeof listing.images === 'string') {
          images = JSON.parse(listing.images);
        } else if (Array.isArray(listing.images)) {
          images = listing.images;
        }
      } catch (e) {
        console.error(`Error parsing images: ${e.message}`);
      }
  
      res.status(200).json({ ...listing, images });
    });
  });
  

  app.get("/api/listings", (req, res) => {
    const { category, sex, age, location, title } = req.query;

    let query = "SELECT * FROM listings WHERE 1=1";
    const params = [];

    // Apply filters dynamically if provided
    if (category) {
        query += " AND category = ?";
        params.push(category);
    }
    if (sex) {
        query += " AND sex = ?";
        params.push(sex);
    }
    if (age) {
        query += " AND age LIKE ?";
        params.push(`%${age}%`);
    }
    if (location) {
        query += " AND location LIKE ?";
        params.push(`%${location}%`);
    }
    if (title) {
        query += " AND title LIKE ?";
        params.push(`%${title}%`);
    }

    db.execute(query, params, (err, results) => {
        if (err) {
            console.error("Error fetching listings:", err.message);
            return res.status(500).json({ error: "Failed to fetch listings" });
        }

        // Debugging: Log raw results to check the exact value of `images`
        console.log("Raw listings data:", results);

        const formattedResults = results.map((listing) => {
            let images = [];
            try {
                console.log("Parsing images for listing:", listing.id, listing.images);

                // Check if listing.images is a string and needs parsing
                if (typeof listing.images === "string") {
                    images = JSON.parse(listing.images);
                } else if (Array.isArray(listing.images)) {
                    // If listing.images is already an array, use it as is
                    images = listing.images;
                } else {
                    images = []; // Default to empty array if images is neither a string nor an array
                }
            } catch (e) {
                console.error(`Error parsing images for listing ${listing.id}: ${e.message}`);
                images = [];
            }

            return {
                ...listing,
                images,
            };
        });

        res.status(200).json(formattedResults);
    });
});





app.get('/api/latest-listings', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const offset = (page - 1) * limit;
  
    const sql = `SELECT id, title, description, price, location, images 
                 FROM listings 
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?`;
  
    db.query(sql, [limit, offset], (err, results) => {
      if (err) {
        console.error("Error fetching listings:", err);
        return res.status(500).send("Failed to load listings.");
      }
  
      if (results.length === 0) {
        return res.json([]); // No listings found
      }
  
      const formattedResults = results.map((listing) => {
        let image;
        console.log("Raw images data:", listing.images); // Log raw images data
  
        // Directly use imagesArray as it's already an array
        if (Array.isArray(listing.images) && listing.images.length > 0) {
          image = `http://localhost:5000/uploads/${listing.images[0]}`; // Use the first image
        } else {
          image = "https://via.placeholder.com/300"; // Fallback image
        }
  
        // Return the listing with a single `image` field
        return {
          ...listing,
          image, // Add the resolved image URL
        };
      });
  
      res.json(formattedResults);
    });
  });
  
  
  
  
  

// DELETE endpoint to remove listing by ID
app.delete("/api/listings/:id", (req, res) => {
    const listingId = req.params.id;

    // Query to get the images associated with the listing
    const query = "SELECT images FROM listings WHERE id = ?";
    db.execute(query, [listingId], (err, results) => {
        if (err) {
            console.error("Error fetching listing:", err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Listing not found" });
        }

        const listing = results[0];
        const images = JSON.parse(listing.images); // Assuming images are stored as a JSON array of filenames
        
        // Delete images from the file system
        images.forEach(image => {
            const imagePath = path.join(__dirname, "uploads", image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Remove image file from server
            }
        });

        // Delete listing from the database
        const deleteQuery = "DELETE FROM listings WHERE id = ?";
        db.execute(deleteQuery, [listingId], (err, result) => {
            if (err) {
                console.error("Error deleting listing:", err.message);
                return res.status(500).json({ error: "Failed to delete listing" });
            }

            res.status(200).json({ message: "Listing deleted successfully" });
        });
    });
});



// Post a new listing with images
app.post("/api/post-listing", upload.array("images", 10), (req, res) => {
    const {
        title, description, category, price, quantity, location,
        additionalInfo, sellerName, sellerEmail, sellerPhone, sellerAddress, age, sex
    } = req.body;

    const images = req.files ? req.files.map(file => file.filename) : [];

    const listingData = {
        title: title || null,
        description: description || null,
        category: category || null,
        price: price || null,
        quantity: quantity || null,
        location: location || null,
        additionalInfo: additionalInfo || null,
        sellerName: sellerName || null,
        sellerEmail: sellerEmail || null,
        sellerPhone: sellerPhone || null,
        sellerAddress: sellerAddress || null,
        age: age || null,
        sex: sex || null
    };

    if (!listingData.title || !listingData.description || !listingData.category || !listingData.price || !listingData.location || !listingData.sellerName || !listingData.sellerEmail) {
        return res.status(400).json({ error: "Required fields are missing" });
    }

    const insertQuery = `
        INSERT INTO listings (title, description, category, price, quantity, location, additionalInfo, sellerName, sellerEmail, sellerPhone, sellerAddress, age, sex, images)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const imagePaths = JSON.stringify(images); // Save as JSON string

    db.execute(insertQuery, [
        listingData.title,
        listingData.description,
        listingData.category,
        listingData.price,
        listingData.quantity,
        listingData.location,
        listingData.additionalInfo,
        listingData.sellerName,
        listingData.sellerEmail,
        listingData.sellerPhone,
        listingData.sellerAddress,
        listingData.age,
        listingData.sex,
        imagePaths
    ], (err, result) => {
        if (err) {
            console.error("Error inserting listing data:", err.message);
            return res.status(500).json({ error: 'Failed to save listing' });
        }
        res.status(201).json({ message: "Listing posted successfully", listingId: result.insertId });
    });
});

const bcrypt = require('bcryptjs');

app.post('/signup', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    // Hash the password before saving to the database
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error hashing password:", err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const checkQuery = 'SELECT * FROM users WHERE email = ?';
        db.execute(checkQuery, [email], (err, results) => {
            if (err) {
                console.error("Error checking for existing user:", err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.length > 0) {
                return res.status(409).json({ error: "An account with this email already exists" });
            }

            const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
            db.execute(insertQuery, [email, hashedPassword], (err, results) => {
                if (err) {
                    console.error("Error inserting data:", err.message);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                res.status(201).json({ message: 'User created successfully', userId: results.insertId });
            });
        });
    });
});


// POST endpoint to handle login and generate JWT token
app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.execute(query, [email], (err, results) => {
        if (err) {
            console.error("Error fetching user:", err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];

        // Use bcrypt.compare to compare the plain password with the hashed password
        bcrypt.compare(password, user.password, (err, match) => {
            if (err) {
                console.error("Error comparing passwords:", err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (!match) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            // Generate JWT token after successful password match
            const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({ message: "Login successful", token });
        });
    });
});


// POST endpoint to handle password change
app.post('/change-password', (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ error: "Email, current password, and new password are required" });
    }

    // Step 1: Find the user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    db.execute(query, [email], (err, results) => {
        if (err) {
            console.error("Error fetching user:", err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = results[0];

        // Step 2: Verify current password using bcrypt
        bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
            if (err) {
                console.error("Error comparing passwords:", err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (!isMatch) {
                return res.status(401).json({ error: "Current password is incorrect" });
            }

            // Step 3: Hash the new password
            bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                if (err) {
                    console.error("Error hashing new password:", err.message);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                // Step 4: Update the password in the database
                const updateQuery = 'UPDATE users SET password = ? WHERE email = ?';
                db.execute(updateQuery, [hashedPassword, email], (err, results) => {
                    if (err) {
                        console.error("Error updating password:", err.message);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    // Step 5: Respond with success message
                    res.status(200).json({ message: "Password changed successfully" });
                });
            });
        });
    });
});




  

// Static files middleware for serving uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Starting the server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});




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
  
    // Fetch user details from localStorage (or wherever it's stored)
    const user = JSON.parse(localStorage.getItem('user')) || { name: "Guest", email: "no-reply@example.com" }; // Fallback if no user is found
  
    console.log("User details:", user);
  
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
  
    useEffect(() => {
      fetchListing();
    }, [id]);
  
    const handleEmailSubmit = async (e) => {
      e.preventDefault();
  
      // Log email data before sending to backend
      console.log("Email data being sent:", {
        sellerEmail: listing.sellerEmail,  // Recipient's email
        subject: emailData.subject,        // Subject of the email
        message: emailData.message,        // Message content
        senderName: user?.name || "Anonymous", // User's name or fallback
        senderEmail: user?.email || "no-reply@example.com", // User's email or fallback
      });
  
      try {
        const response = await fetch('http://localhost:5000/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sellerEmail: listing.sellerEmail,
            subject: emailData.subject,
            message: emailData.message,
            senderName: user?.name || "Anonymous", // fallback name
            senderEmail: user?.email || "no-reply@example.com", // fallback email
          }),
        });
  
        const data = await response.json();
        if (response.ok) {
          setEmailStatus("Email sent successfully!");
          handleCloseEmailForm();
        } else {
          setEmailStatus(data.error || "Failed to send email");
        }
      } catch (error) {
        console.error("Error in API request:", error);
        setEmailStatus("Error sending email");
      }
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
      </div>
    );
  };
  
  export default ListingDetail;
  