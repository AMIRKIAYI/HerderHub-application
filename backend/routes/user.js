router.post('/update-profile', upload, (req, res) => {
    const { userId, username, email } = req.body;
    let profilePic = req.file ? req.file.path : null; // Use the uploaded file path
  
    console.log('Request received:', { userId, username, email, profilePic });
  
    // SQL query to update the user's profile
    const updateQuery = `
      UPDATE users SET 
      username = ?, 
      email = ?, 
      profile_pic = ? 
      WHERE id = ?
    `;
  
    db.query(updateQuery, [username, email, profilePic, userId], (err, result) => {
      if (err) {
        console.error('Error updating profile:', err); // Log the error
        return res.status(500).json({ message: 'Failed to update profile', error: err });
      }
  
      console.log('Profile updated successfully:', result);
      return res.status(200).json({
        message: 'Profile updated successfully!',
        profilePic: profilePic || null, // If no new image, return null
      });
    });
  });
  