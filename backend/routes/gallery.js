const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/gallery');
    },
    filename: function(req, file, cb) {
        cb(null, `gallery-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only!');
    }
}

// @route   GET /api/gallery
// @desc    Get all gallery items
// @access  Public
router.get('/', async (req, res) => {
    try {
        const gallery = await Gallery.find().sort({ createdAt: -1 });
        res.json(gallery);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/gallery/category/:category
// @desc    Get gallery items by category
// @access  Public
router.get('/category/:category', async (req, res) => {
    try {
        const gallery = await Gallery.find({ category: req.params.category }).sort({ createdAt: -1 });
        res.json(gallery);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/gallery
// @desc    Upload new gallery item
// @access  Private (Admin, Teacher)
router.post('/', protect, authorize('admin', 'teacher'), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const newGalleryItem = new Gallery({
            ...req.body,
            image: req.file.filename,
            uploadedBy: req.user.id
        });

        const galleryItem = await newGalleryItem.save();
        res.status(201).json(galleryItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery item
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const galleryItem = await Gallery.findById(req.params.id);
        
        if (!galleryItem) {
            return res.status(404).json({ message: 'Gallery item not found' });
        }

        await galleryItem.remove();
        res.json({ message: 'Gallery item removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;