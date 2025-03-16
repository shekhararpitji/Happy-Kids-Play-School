const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/students');
    },
    filename: function(req, file, cb) {
        cb(null, `student-${Date.now()}${path.extname(file.originalname)}`);
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
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only!');
    }
}

// @route   GET /api/students
// @desc    Get all students
// @access  Private (Admin, Teacher)
router.get('/', protect, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const students = await Student.find().populate('parentId', 'name email');
        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Private (Admin, Teacher, Parent)
router.get('/:id', protect, async (req, res) => {
    try {
        const student = await Student.findById(req.id).populate('parentId', 'name email');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if user is parent and has access to this student
        if (req.user.role === 'parent' && student.parentId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to access this student' });
        }

        res.json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/students
// @desc    Create new student
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), upload.single('photo'), async (req, res) => {
    try {
        const newStudent = new Student({
            ...req.body,
            photo: req.file ? req.file.filename : 'default.jpg'
        });

        const student = await newStudent.save();
        res.status(201).json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), upload.single('photo'), async (req, res) => {
    try {
        let student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const updateData = {
            ...req.body
        };

        if (req.file) {
            updateData.photo = req.file.filename;
        }

        student = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await student.remove();
        res.json({ message: 'Student removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/students/:id/attendance
// @desc    Update student attendance
// @access  Private (Admin, Teacher)
router.put('/:id/attendance', protect, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.attendance.push(req.body);
        await student.save();

        res.json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;