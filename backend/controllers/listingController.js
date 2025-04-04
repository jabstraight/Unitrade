
// backend/controllers/listingController.js
const Listing = require('../models/Listing');
const User = require('../models/User');

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res) => {
  try {
    const { title, description, price, category, condition, location } = req.body;
    
    // Handle image uploads
    const images = [];
    if (req.files) {
      req.files.forEach(file => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    const listing = await Listing.create({
      user: req.user._id,
      title,
      description,
      price,
      category,
      condition,
      images,
      location,
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res) => {
  try {
    // Build query
    const query = {};
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by status (active by default)
    if (req.query.status) {
      query.status = req.query.status;
    } else {
      query.status = 'Active';
    }
    
    // Search by title or description
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    
    const listings = await Listing.find(query)
      .populate('user', 'name university')
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const count = await Listing.countDocuments(query);
    
    res.json({
      listings,
      page,
      pages: Math.ceil(count / limit),
      total: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get listing by ID
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'user',
      'name email university'
    );

    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update fields
    const { title, description, price, category, condition, location, status } = req.body;
    
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (price) listing.price = price;
    if (category) listing.category = category;
    if (condition) listing.condition = condition;
    if (location) listing.location = location;
    if (status) listing.status = status;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      listing.images = [...listing.images, ...newImages];
    }

    const updatedListing = await listing.save();
    res.json(updatedListing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await listing.remove();
    res.json({ message: 'Listing removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user listings
// @route   GET /api/listings/user
// @access  Private
const getUserListings = async (req, res) => {
  try {
    const listings = await Listing.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getUserListings,
};