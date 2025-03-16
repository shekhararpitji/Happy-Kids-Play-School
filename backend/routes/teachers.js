const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/teachers');
    },
    filename: function(req, file, cb) {
        cb(null, `teacher-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 1000000 }, // 1MB
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check file type
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

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Public
router.get('/', async (req, res) => {
    try {
        const teachers = await Teacher.find().populate('userId', 'name email');
        res.json(teachers);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/teachers/:id
// @desc    Get single teacher
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id).populate('userId', 'name email');
        
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.json(teacher);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/teachers
// @desc    Create new teacher
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), upload.single('photo'), async (req, res) => {
    try {
        const newTeacher = new Teacher({
            ...req.body,
            photo: req.file ? req.file.filename : 'default.jpg'
        });

        const teacher = await newTeacher.save();
        res.status(201).json(teacher);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Private (Admin, Teacher)
router.put('/:id', protect, authorize('admin', 'teacher'), upload.single('photo'), async (req, res) => {
    try {
        let teacher = await Teacher.findById(req.params.id);
        
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Check if teacher is updating their own profile
        if (req.user.role === 'teacher' && teacher.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        const updateData = {
            ...req.body
        };

        if (req.file) {
            updateData.photo = req.file.filename;
        }

        teacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json(teacher);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        await teacher.remove();
        res.json({ message: 'Teacher removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;