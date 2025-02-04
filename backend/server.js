
require('dotenv').config();
const express = require('express');
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken"); // Import JWT for user authentication

const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser');
const router = express.Router();






const app = express();
// CORS configuration
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
// Mount the router
app.use('/api', router);

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL2 database connection
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,       // Database host
  user: process.env.MYSQLUSER,       // MySQL username
  password: process.env.MYSQLPASSWORD, // MySQL password
  database: process.env.MYSQLDATABASE, // Database name
  port: process.env.MYSQLPORT || 11873, // MySQL port
});

// Test the connection
db.connect(err => {
    if (err) {
        console.error("Error connecting to the database:", err.message);
        return;
    }
    console.log("Connected to the MySQL database.");
});

// Secret key for JWT token
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';




app.post("/api/send-email", async (req, res) => {
    const { sellerEmail, subject, message, senderName, senderEmail, livestockDetails } = req.body;

    if (!sellerEmail || !subject || !message) {
        return res.status(400).json({ error: 'Seller email, subject, and message are required.' });
    }

    try {
        // Create a transporter for sending emails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Use environment variable for security
                pass: process.env.EMAIL_PASS, // Use environment variable for security
            },
        });

        // Construct the email content, including livestock details if available
        const emailContent = `
You have a new message from ${senderName || 'Unknown'} (${senderEmail || 'No email provided'}):

${livestockDetails ? `
Livestock Details:
- Title: ${livestockDetails.title || 'N/A'}
- Price: Kshs ${livestockDetails.price || 'N/A'}
- Age: ${livestockDetails.age || 'N/A'} years
- Sex: ${livestockDetails.sex || 'N/A'}
- Location: ${livestockDetails.location || 'N/A'}
` : ''}
        
Message:
${message}
        `;

        // Email details
        const mailOptions = {
            from: senderEmail || process.env.EMAIL_USER, // Default to server email if sender email is missing
            to: sellerEmail,   // Recipient email (seller's email)
            subject: subject,
            text: emailContent.trim(),
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email.' });
    }
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
          image = `${process.env.RAILWAY_PUBLIC_DOMAIN}/uploads/${listing.images[0]}`; // Use the first image
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

app.get('/', (req, res) => {
  res.send('Welcome to the HerderHub API!');
});

app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
  }

  console.log("🔹 Received signup request:", { email, password });

  bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
          console.error("❌ Error hashing password:", err.message);
          return res.status(500).json({ error: 'Internal Server Error' });
      }

      const checkQuery = 'SELECT * FROM users WHERE email = ?';
      db.execute(checkQuery, [email], (err, results) => {
          if (err) {
              console.error("❌ Error checking user:", err.message);
              return res.status(500).json({ error: 'Internal Server Error' });
          }

          if (results.length > 0) {
              return res.status(409).json({ error: "An account with this email already exists" });
          }

          const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
          db.execute(insertQuery, [email, hashedPassword], (err, results) => {
              if (err) {
                  console.error("❌ Error inserting user:", err.message);
                  return res.status(500).json({ error: 'Internal Server Error' });
              }
              console.log("✅ User created successfully:", results);
              res.status(201).json({ message: 'User created successfully', userId: results.insertId });
          });
      });
  });
});


// Import necessary modules




// POST endpoint to handle login and generate JWT tokens
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

    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error("Error comparing passwords:", err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (!match) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET, // Use the same secret for refresh token
        { expiresIn: '7d' }
      );

      // Log tokens for debugging
      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);

      res.status(200).json({
        message: "Login successful",
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          profilePic: user.profile_picture,
        }
      });
    });
  });
});

const authenticateUser = (req, res, next) => {
  

  const authHeader = req.headers.authorization;

  console.log("Request Headers:", req.headers);

  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === 'Bearer null') {
    console.error("Authorization header missing or malformed");
    return res.status(401).json({ error: "Unauthorized: No token provided or invalid token" });
  }

  const token = authHeader.split(' ')[1];

  console.log("Received Token in Middleware:", token);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    console.log("Decoded Token in Middleware:", decoded);

    req.userId = decoded.userId;
    req.userEmail = decoded.email;  // Save the email from the decoded token
    next();
  });
};





// POST endpoint to refresh the access token using a refresh token
app.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is required" });
  }

  // Verify the refresh token
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => { // Use the same secret for verification
    if (err) {
      console.error("Invalid or expired refresh token:", err.message);
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    // Check if the refresh token exists in the database (optional but recommended)
    const query = 'SELECT * FROM users WHERE id = ? AND refresh_token = ?';
    db.execute(query, [decoded.userId, refreshToken], (err, results) => {
      if (err) {
        console.error("Error checking refresh token:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      // Generate a new access token
      const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        accessToken: newAccessToken,
      });
    });
  });
});






// POST endpoint for user logout (invalidate refresh token)
app.post('/logout', authenticateUser, (req, res) => {
  const userId = req.userId;

  // Invalidate the refresh token by setting it to null in the database
  const query = 'UPDATE users SET refresh_token = NULL WHERE id = ?';
  db.execute(query, [userId], (err) => {
    if (err) {
      console.error("Error logging out user:", err.message);
      return res.status(500).json({ error: "Failed to log out" });
    }

    res.status(200).json({ message: "Logged out successfully" });
  });
});


// Update user settings
app.put('/api/settings', authenticateUser, upload.single('profilePicture'), async (req, res) => {
  const { email, username, password, preferences } = req.body;
  const userId = req.userId; // Extracted from the authentication token

  if (!userId) {
    return res.status(400).json({ error: "Authentication failed. User ID is missing." });
  }

  try {
    const updates = [];
    const params = [];

    // Validate and update email
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }
      updates.push("email = ?");
      params.push(email);
    }

    // Validate and update username
    if (username) {
      if (username.trim().length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters long." });
      }
      updates.push("username = ?");
      params.push(username);
    }

    // Hash and update password
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      params.push(hashedPassword);
    }

    // Update preferences (stored as JSON)
    if (preferences) {
      updates.push("preferences = ?");
      params.push(JSON.stringify(preferences));
    }

    // Update profile picture path
    if (req.file) {
      const profilePicturePath = req.file.filename; // Save only the filename
      updates.push("profile_picture = ?");
      params.push(profilePicturePath);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    params.push(userId);

    db.execute(query, params, (err) => {
      if (err) {
        console.error("Error updating user settings:", err.message);
        return res.status(500).json({ error: "Failed to update settings. Please try again later." });
      }

      const response = {
        message: "Settings updated successfully",
        ...(email && { email }),
        ...(username && { username }),
        ...(preferences && { preferences: JSON.parse(preferences) }),
        ...(req.file && { profile_picture: `http://localhost:5000/uploads/${req.file.filename}` }),
      };

      res.status(200).json(response);
    });
  } catch (err) {
    console.error("Unexpected error:", err.message);
    res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
});

// Fetch user settings
app.get('/api/settings', authenticateUser, async (req, res) => {
  const userId = req.userId; // Extracted from the authentication token

  if (!userId) {
    console.warn("Token decoded but userId is missing.");
    return res.status(400).json({ success: false, error: "Invalid token. Please log in again." });
  }

  try {
    const query = "SELECT email, username, preferences, profile_picture FROM users WHERE id = ?";
    db.execute(query, [userId], (err, results) => {
      if (err) {
        console.error(`Database error [${err.code}]: ${err.message}`);
        return res.status(500).json({ success: false, error: "Failed to fetch user settings." });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, error: "User not found." });
      }

      const user = results[0];
      user.preferences = user.preferences ? JSON.parse(user.preferences) : null;

      const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN || "http://localhost:5000";
      user.profile_picture = user.profile_picture
        ? `${baseUrl}/uploads/${user.profile_picture}`
        : `${baseUrl}/uploads/default-avatar.png`;

      res.status(200).json({ success: true, ...user });
    });
  } catch (err) {
    console.error("Unexpected error:", err.message);
    res.status(500).json({ success: false, error: "An unexpected error occurred. Please try again." });
  }
});


app.put('/api/settings/change-password', authenticateUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId; // Extracted from the authentication token

  if (!userId) {
    return res.status(400).json({ error: "Authentication failed. User ID is missing." });
  }

  try {
    // Retrieve the user from the database
    const query = 'SELECT password FROM users WHERE id = ?';
    db.execute(query, [userId], async (err, results) => {
      if (err) {
        console.error('Error fetching user:', err.message);
        return res.status(500).json({ error: "Failed to fetch user." });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found." });
      }

      const user = results[0];
      const match = await bcrypt.compare(currentPassword, user.password);

      if (!match) {
        return res.status(400).json({ error: "Current password is incorrect." });
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update the password in the database
      const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
      db.execute(updateQuery, [hashedNewPassword, userId], (updateErr, updateResults) => {
        if (updateErr) {
          console.error('Error updating password:', updateErr.message);
          return res.status(500).json({ error: "Failed to update password." });
        }

        res.status(200).json({ message: 'Password updated successfully!' });
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

  


// Update Listing API
app.put("/api/update-listing/:id", upload.array("images", 10), (req, res) => {
  const listingId = req.params.id; // Get the listing ID from the URL
  const {
      title, description, category, price, quantity, location,
      additionalInfo, sellerName, sellerEmail, sellerPhone, sellerAddress, age, sex
  } = req.body;

  const images = req.files ? req.files.map(file => file.filename) : [];

  const updatedListingData = {
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
      sex: sex || null,
  };

  // Validate required fields
  if (!updatedListingData.title || !updatedListingData.description || !updatedListingData.category || !updatedListingData.price || !updatedListingData.location || !updatedListingData.sellerName || !updatedListingData.sellerEmail) {
      return res.status(400).json({ error: "Required fields are missing" });
  }

  // If there are new images, we will update the images field
  let imagePaths = [];
  if (images.length > 0) {
      imagePaths = JSON.stringify(images); // Save as JSON string
  }

  // First, check if the listing exists
  const checkListingQuery = 'SELECT * FROM listings WHERE id = ?';
  db.execute(checkListingQuery, [listingId], (err, result) => {
      if (err) {
          console.error('Error checking listing:', err.message);
          return res.status(500).json({ error: 'Failed to check listing' });
      }

      if (result.length === 0) {
          return res.status(404).json({ error: 'Listing not found' });
      }

      // Update the listing in the database
      const updateQuery = `
          UPDATE listings
          SET title = ?, description = ?, category = ?, price = ?, quantity = ?, location = ?, additionalInfo = ?, sellerName = ?, sellerEmail = ?, sellerPhone = ?, sellerAddress = ?, age = ?, sex = ?, images = ?
          WHERE id = ?
      `;

      db.execute(updateQuery, [
          updatedListingData.title,
          updatedListingData.description,
          updatedListingData.category,
          updatedListingData.price,
          updatedListingData.quantity,
          updatedListingData.location,
          updatedListingData.additionalInfo,
          updatedListingData.sellerName,
          updatedListingData.sellerEmail,
          updatedListingData.sellerPhone,
          updatedListingData.sellerAddress,
          updatedListingData.age,
          updatedListingData.sex,
          imagePaths.length > 0 ? imagePaths : result[0].images, // Keep existing images if none are uploaded
          listingId
      ], (err, result) => {
          if (err) {
              console.error('Error updating listing:', err.message);
              return res.status(500).json({ error: 'Failed to update listing' });
          }
          res.status(200).json({ message: 'Listing updated successfully' });
      });
  });
});

app.post('/api/send-message', authenticateUser, (req, res) => {
  const { recipient, messageText } = req.body;
  const senderEmail = req.userEmail;  // Use req.userEmail instead of req.email

  // Log incoming data for debugging
  console.log("Received message request:");
  console.log("Recipient email:", recipient);
  console.log("Message text:", messageText);
  console.log("Sender email:", senderEmail);

  if (!recipient || !messageText) {
    return res.status(400).json({ error: 'Recipient and message are required' });
  }

  // Verify recipient email exists in the database
  const query = 'SELECT email FROM users WHERE email = ?';
  db.execute(query, [recipient.trim()], (err, results) => {
    if (err) {
      console.error("Error fetching recipient email:", err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      console.error("Recipient not found:", recipient);
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Insert message into the database
    const messageQuery = `
      INSERT INTO messages (recipient, messageText, senderEmail, receiverEmail)
      VALUES (?, ?, ?, ?)
    `;
    db.execute(messageQuery, [recipient, messageText, senderEmail, recipient], (err, result) => {
      if (err) {
        console.error("Error inserting message into database:", err.message);
        return res.status(500).json({ error: 'Error inserting message' });
      }

      res.status(200).json({ message: 'Message sent successfully' });
    });
  });
});

// Endpoint to fetch messages for the logged-in user where the user is the recipient
app.get('/api/messages', authenticateUser, (req, res) => {
  const userEmail = req.userEmail; // Get the user's email from the JWT token

  // Query to fetch messages where the logged-in user is the recipient
  const query = 'SELECT * FROM messages WHERE recipient = ?';
  
  db.execute(query, [userEmail], (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.status(200).json({ messages: results }); // Send the messages as a response
  });
});






// Static files middleware for serving uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Starting the server
// Server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
