const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');

router.get('/listings', listingController.getAllListings);
router.get('/listings/:id', listingController.getListingById);
router.put('/listings/:id', listingController.updateListing);

module.exports = router;
