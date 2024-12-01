

const express = require('express');
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken"); // Import JWT for user authentication

const nodemailer = require("nodemailer");
const bodyParser = require('body-parser');
require('dotenv').config(); // For secure environment variables





const app = express();
app.use(cors());
app.use(express.json());

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL2 database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,       // Database host
    user: process.env.DB_USER,       // MySQL username
    password: process.env.DB_PASSWORD, // MySQL password
    database: process.env.DB_NAME    // Database name
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
    const { sellerEmail, subject, message, senderName, senderEmail } = req.body;

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

        // Email details
        const mailOptions = {
            from: senderEmail, // Sender email
            to: sellerEmail,   // Recipient email (seller's email)
            subject: subject,
            text: `You have a new message from ${senderName} (${senderEmail}):\n\n${message}`,
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

            // Extract the username from the email (everything before the '@')
            const username = email.split('@')[0];

            // Generate JWT token after successful password match
            const token = jwt.sign({ userId: user.id, email: user.email, username }, JWT_SECRET, { expiresIn: '1h' });

            // Return the token and the username to the client
            res.status(200).json({ message: "Login successful", token, user: { email: user.email, username } });
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
