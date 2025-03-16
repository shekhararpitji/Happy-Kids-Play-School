const express = require('express');
const router = express.Router();
const Admission = require('../models/Admission');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/documents');
    },
    filename: function(req, file, cb) {
        cb(null, `doc-${Date.now()}${path.extname(file.originalname)}`);
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
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image|application\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)/.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Invalid file type!');
    }
}

// @route   POST /api/admissions
// @desc    Submit new admission application
// @access  Public
router.post('/', upload.array('documents', 5), async (req, res) => {
    try {
        const newAdmission = new Admission({
            ...req.body,
            documents: req.files ? req.files.map(file => file.filename) : []
        });

        const admission = await newAdmission.save();
        res.status(201).json(admission);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admissions
// @desc    Get all admissions
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const admissions = await Admission.find().sort({ createdAt: -1 });
        res.json(admissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admissions/:id
// @desc    Get single admission
// @access  Private (Admin)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const admission = await Admission.findById(req.params.id);
        
        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }

        res.json(admission);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admissions/:id
// @desc    Update admission status
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const admission = await Admission.findByIdAndUpdate(
            req.params.id,
            { $set: { status: req.body.status, notes: req.body.notes } },
            { new: true }
        );

        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }

        res.json(admission);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;