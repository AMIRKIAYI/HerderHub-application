const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Livestock', 'Product'], required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  location: { type: String, required: true },
  images: [String], // URLs of images
  sellerName: String,
  sellerEmail: String,
  sellerPhone: String,
  sellerAddress: String,
  age: String,
  sex: String,
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
