const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    class: {
        type: String,
        required: true
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    attendance: [
        {
            date: {
                type: Date,
                required: true
            },
            status: {
                type: String,
                enum: ['present', 'absent', 'late'],
                required: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Student', StudentSchema);