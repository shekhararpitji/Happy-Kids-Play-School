const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/events');
    },
    filename: function(req, file, cb) {
        cb(null, `event-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2000000 }, // 2MB
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

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
    try {
        const newEvent = new Event({
            ...req.body,
            image: req.file ? req.file.filename : null,
            createdBy: req.user.id
        });

        const event = await newEvent.save();
        res.status(201).json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const updateData = {
            ...req.body
        };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        event = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await event.remove();
        res.json({ message: 'Event removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;