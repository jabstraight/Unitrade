const mongoose = require('mongoose');

const listingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [50, 'Title cannot be more than 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Textbooks',
        'Electronics',
        'Furniture',
        'Clothing',
        'Kitchen',
        'Sports',
        'Other',
      ],
    },
    condition: {
      type: String,
      required: [true, 'Please select a condition'],
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    },
    images: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
      required: [true, 'Please add a campus location'],
    },
    status: {
      type: String,
      enum: ['Active', 'Sold', 'Reserved'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Listing', listingSchema);