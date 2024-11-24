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

// Signup endpoint
app.post('/signup', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
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
        db.execute(insertQuery, [email, password], (err, results) => {
            if (err) {
                console.error("Error inserting data:", err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.status(201).json({ message: 'User created successfully', userId: results.insertId });
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
  
      if (results.length === 0 || results[0].password !== password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
  
      // Generate JWT token
      const user = results[0];
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  
      res.status(200).json({ message: "Login successful", token });
    });
  });


  



  

// Static files middleware for serving uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Starting the server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
