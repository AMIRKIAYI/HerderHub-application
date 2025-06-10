
require('dotenv').config();
const express = require('express');
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken"); // Import JWT for user authentication
const mjml = require('mjml');
const handlebars = require('handlebars');

const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser');
const router = express.Router();


const PORT = process.env.PORT || 5000;


const app = express();
// Middleware Setup
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://herder-hub-application.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));


// Middleware for parsing request bodies
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Mount the router
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.use('/api', router);


// Database Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection error:", err.message);
    return;
  }
  console.log("Connected to MySQL database");
  connection.release();
});
// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';




app.post("/api/send-email", async (req, res) => {
  
    const { sellerEmail, subject, message, senderName, senderEmail, livestockDetails } = req.body;

    if (!sellerEmail || !subject || !message) {
        return res.status(400).json({ error: 'Seller email, subject, and message are required.' });
    }

    try {
        const mjmlTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'inquiryEmail.mjml'), 'utf-8');

        // Compile with Handlebars
        const template = handlebars.compile(mjmlTemplate);
        const mjmlWithValues = template({
            senderName: senderName || 'Unknown',
            senderEmail: senderEmail || 'No email provided',
            message: message || '',
            livestock: {
                title: livestockDetails?.title || 'N/A',
                price: livestockDetails?.price || 'N/A',
                age: livestockDetails?.age || 'N/A',
                sex: livestockDetails?.sex || 'N/A',
                location: livestockDetails?.location || 'N/A'
            }
        });

        // Convert to responsive HTML
        const { html } = mjml(mjmlWithValues);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: senderEmail || process.env.EMAIL_USER,
            to: sellerEmail,
            subject: subject,
            html: html,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: 'Beautiful email sent with livestock details!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send styled email.' });
    }
});



// File Upload Configuration
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Normalize all JPEG extensions to .jpg
    const normalizedExt = ext === '.jpeg' ? '.jpg' : ext;
    cb(null, Date.now() + normalizedExt);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    extname && mimetype ? cb(null, true) : cb(new Error("Only images are allowed"));
  }
});

// Helper Functions
function getImageUrl(req, imagePath) {
  if (!imagePath) return `${req.protocol}://${req.get('host')}/default-image.jpg`;
  
  // Normalize path and extension
  const cleanPath = imagePath.replace(/^.*[\\\/]/, '')
                            .replace(/\.jpeg$/, '.jpg');
  
  return `${req.protocol}://${req.get('host')}/uploads/${cleanPath}`;
}

function cleanImagePath(img) {
  if (!img) return null;
  return img.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/?uploads\//, '');
}





function cleanImagePath(img) {
  if (!img) return null;
  // Remove any protocol/host if present
  return img.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/?uploads\//, '');
}

// Static File Serving
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') res.set('Content-Type', 'image/jpeg');
    if (ext === '.png') res.set('Content-Type', 'image/png');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Default Image Route
app.get('/default-image.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'default-image.jpg'));
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uploadsDirectory: {
      exists: fs.existsSync(uploadDir),
      writable: fs.accessSync(uploadDir, fs.constants.W_OK),
      path: uploadDir
    }
  });
});


// Post New Listing
app.post("/api/post-listing", upload.array("images", 10), (req, res) => {
    const {
        title, description, category, price, quantity, location,
        additionalInfo, sellerName, sellerEmail, sellerPhone, sellerAddress, age, sex
    } = req.body;

    const images = req.files
        ? req.files.map(file => file.filename).filter(name => name.match(/\.(jpg|jpeg|png|gif)$/i))
        : [];

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
        INSERT INTO listings (
            title, description, category, price, quantity, location,
            additionalInfo, sellerName, sellerEmail, sellerPhone, sellerAddress,
            age, sex, images
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const imagePathsJson = JSON.stringify(images);

    pool.execute(insertQuery, [
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
        imagePathsJson
    ], (err, result) => {
        if (err) {
            console.error("Error inserting listing data:", err.message);
            return res.status(500).json({ error: 'Failed to save listing' });
        }

        const listingId = result.insertId;

        if (images.length === 0) {
            return res.status(201).json({ message: "Listing posted successfully (no images)", listingId });
        }

        // Insert each image into images table
        const insertImageQuery = `INSERT INTO images (listing_id, image_path) VALUES (?, ?)`;

        const insertTasks = images.map(img =>
            pool.promise().execute(insertImageQuery, [listingId, img])
        );

        Promise.all(insertTasks)
            .then(() => {
                res.status(201).json({ message: "Listing posted successfully", listingId });
            })
            .catch(imageErr => {
                console.error("Error inserting image records:", imageErr.message);
                res.status(500).json({ error: "Listing saved, but failed to record images" });
            });
    });
});

app.get("/api/listing/:id/images", (req, res) => {
  const { id } = req.params;

  const query = `SELECT image_path FROM images WHERE listing_id = ?`;
  pool.execute(query, [id], (err, results) => {
    if (err) {
      console.error("Failed to fetch images:", err.message);
      return res.status(500).json({ error: "Server error" });
    }

    const fullUrls = results.map(img =>
      `http://localhost:5000/uploads/${img.image_path}`
    );

    res.status(200).json(fullUrls);
  });
});



app.get("/api/listings/category/:category", (req, res) => {
  const { category } = req.params;

  // Query to get all listings, but prioritize those matching the category first
  const query = `
    SELECT * FROM listings
    ORDER BY (category = ?) DESC, id DESC
  `;

  pool.execute(query, [category], (err, results) => {
    if (err) {
      console.error("Error fetching listings:", err.message);
      return res.status(500).json({ error: "Failed to fetch listings" });
    }

    // In your /api/listings/category/:category route
const processedResults = results.map(listing => {
  let images = [];
  try {
    images = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images || [];
  } catch(e) {
    images = listing.images || [];
  }

  const fullImageUrls = images.map(img => {
    if (!img) return `${req.protocol}://${req.get('host')}/default-image.jpg`;
    if (img.startsWith('http')) return img;
    return `${req.protocol}://${req.get('host')}/uploads/${img.replace(/^\/?uploads\//, '')}`;
  });

  return {
    ...listing,
    images: fullImageUrls.length > 0 ? fullImageUrls : [`${req.protocol}://${req.get('host')}/default-image.jpg`],
    primaryImage: fullImageUrls[0] || `${req.protocol}://${req.get('host')}/default-image.jpg`
  };
});

    res.status(200).json(processedResults);
  });
});

  


// / GET endpoint to fetch a single listing by ID
app.get("/api/listings/:id", (req, res) => {
    const listingId = req.params.id;
  
    const query = "SELECT * FROM listings WHERE id = ?";
    pool.execute(query, [listingId], (err, results) => {
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
  

// Listings Endpoints
app.get("/api/listings", (req, res) => {
  const { category, sex, age, location, title } = req.query;
  let query = "SELECT * FROM listings WHERE 1=1";
  const params = [];

  if (category) query += " AND category = ?", params.push(category);
  if (sex) query += " AND sex = ?", params.push(sex);
  if (age) query += " AND age LIKE ?", params.push(`%${age}%`);
  if (location) query += " AND location LIKE ?", params.push(`%${location}%`);
  if (title) query += " AND title LIKE ?", params.push(`%${title}%`);

  pool.execute(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch listings" });

    const formattedResults = results.map(listing => {
      let images = [];
      try {
        images = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images || [];
      } catch (e) {
        console.error(`Image parse error:`, e);
        images = [];
      }

      const imageUrls = images.map(img => getImageUrl(req, img));
      return {
        ...listing,
        images: imageUrls.length > 0 ? imageUrls : [getImageUrl(req, null)],
        primaryImage: imageUrls[0] || getImageUrl(req, null)
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

  pool.query(sql, [limit, offset], (err, results) => {
    if (err) {
      console.error("Error fetching listings:", err);
      return res.status(500).send("Failed to load listings.");
    }

    if (results.length === 0) {
      return res.json([]);
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`; // Dynamically get server URL

   // In your /api/latest-listings route
const formattedResults = results.map(listing => {
  let images = [];
  
  try {
    images = typeof listing.images === 'string' 
      ? JSON.parse(listing.images) 
      : listing.images || [];
  } catch (e) {
    console.error(`Image parse error for listing ${listing.id}:`, e);
    images = [];
  }

  // Convert to absolute URLs with proper fallback
  const imageUrls = images.map(img => {
    if (!img) return `${req.protocol}://${req.get('host')}/default-image.jpg`;
    if (img.startsWith('http')) return img;
    return `${req.protocol}://${req.get('host')}/uploads/${img.replace(/^\/?uploads\//, '')}`;
  });

  return {
    ...listing,
    images: imageUrls.length > 0 ? imageUrls : [`${req.protocol}://${req.get('host')}/default-image.jpg`],
    primaryImage: imageUrls[0] || `${req.protocol}://${req.get('host')}/default-image.jpg`
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
    pool.execute(query, [listingId], (err, results) => {
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
        pool.execute(deleteQuery, [listingId], (err, result) => {
            if (err) {
                console.error("Error deleting listing:", err.message);
                return res.status(500).json({ error: "Failed to delete listing" });
            }

            res.status(200).json({ message: "Listing deleted successfully" });
        });
    });
});



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
        pool.execute(checkQuery, [email], (err, results) => {
            if (err) {
                console.error("Error checking for existing user:", err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.length > 0) {
                return res.status(409).json({ error: "An account with this email already exists" });
            }

            const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
            pool.execute(insertQuery, [email, hashedPassword], (err, results) => {
                if (err) {
                    console.error("Error inserting data:", err.message);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                res.status(201).json({ message: 'User created successfully', userId: results.insertId });
            });
        });
    });
});


// Import necessary modules




// User Authentication Endpoints
app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  pool.execute('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match) return res.status(401).json({ error: "Invalid credentials" });

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
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

// Authentication Middleware
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid or expired token" });
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  });
};



// POST endpoint to refresh the access token using a refresh token

app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Check if refresh token exists in database
    const [user] = await pool.promise().query(
      'SELECT id FROM users WHERE id = ? AND refresh_token = ?',
      [decoded.userId, refreshToken]
    );

    if (!user.length) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update refresh token in database
    await pool.promise().query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [newRefreshToken, decoded.userId]
    );

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    console.error("Token refresh error:", err);
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});



// Logout Endpoint
app.post('/logout', authenticateUser, (req, res) => {
  pool.execute(
    'UPDATE users SET refresh_token = NULL WHERE id = ?',
    [req.userId],
    (err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    }
  );
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

    pool.execute(query, params, (err) => {
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
    pool.execute(query, [userId], (err, results) => {
      if (err) {
        console.error(`Database error [${err.code}]: ${err.message}`);
        return res.status(500).json({ success: false, error: "Failed to fetch user settings." });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, error: "User not found." });
      }

      const user = results[0];
      user.preferences = user.preferences ? JSON.parse(user.preferences) : null;

      const baseUrl = process.env.BASE_URL || "http://localhost:5000";
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
    pool.execute(query, [userId], async (err, results) => {
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
      pool.execute(updateQuery, [hashedNewPassword, userId], (updateErr, updateResults) => {
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
  pool.execute(checkListingQuery, [listingId], (err, result) => {
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

      pool.execute(updateQuery, [
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
  pool.execute(query, [recipient.trim()], (err, results) => {
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
    pool.execute(messageQuery, [recipient, messageText, senderEmail, recipient], (err, result) => {
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
  
  pool.execute(query, [userEmail], (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.status(200).json({ messages: results }); // Send the messages as a response
  });
});


// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: "File upload error: " + err.message });
  }
  res.status(500).json({ error: "Internal server error" });
});


// Add this before your app.listen()
app.get('/default-image.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'default-image.jpg'));
});

// Create a public folder and add a default image
// You'll need to create a 'public' directory and add a default-image.jpg file


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
   console.log(`Uploads directory: ${uploadDir}`);
});
