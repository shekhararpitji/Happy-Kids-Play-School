const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Admission = require('../models/Admission');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        // Count students (users with role 'parent')
        const students = await User.countDocuments({ role: 'parent' });
        
        // Count teachers
        const teachers = await User.countDocuments({ role: 'teacher' });
        
        // Count upcoming events
        const currentDate = new Date();
        const events = await Event.countDocuments({ 
            date: { $gte: currentDate } 
        });
        
        // Count new admissions (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const admissions = await Admission.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        
        res.json({
            students,
            teachers,
            events,
            admissions
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/dashboard/teacher
// @desc    Get teacher dashboard data
// @access  Private (Teacher)
router.get('/teacher', protect, authorize('teacher'), async (req, res) => {
    try {
        // Here you would fetch teacher-specific data
        // For example, classes assigned to this teacher
        
        res.json({
            classes: [],
            // Add more teacher-specific data here
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/dashboard/parent
// @desc    Get parent dashboard data
// @access  Private (Parent)
router.get('/parent', protect, authorize('parent'), async (req, res) => {
    try {
        // Here you would fetch parent-specific data
        // For example, children information, upcoming events, etc.
        
        res.json({
            children: [],
            // Add more parent-specific data here
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;