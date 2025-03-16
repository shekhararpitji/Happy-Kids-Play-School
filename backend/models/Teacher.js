const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    bio: {
        type: String,
        required: true
    },
    classes: [
        {
            type: String
        }
    ],
    joinDate: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Teacher', TeacherSchema);