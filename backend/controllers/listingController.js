const Listing = require('../models/listingModel');

// Fetch all listings
exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find(); // Replace with your database call
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listings' });
  }
};

// Fetch a single listing by ID
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listing' });
  }
};

// Update a listing by ID
exports.updateListing = async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedListing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: 'Error updating listing' });
  }
};
