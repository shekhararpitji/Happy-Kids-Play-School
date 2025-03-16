const mongoose = require('mongoose');

const AdmissionSchema = new mongoose.Schema({
    childName: {
        type: String,
        required: true
    },
    childAge: {
        type: Number,
        required: true
    },
    childGender: {
        type: String,
        required: true
    },
    childDOB: {
        type: Date,
        required: true
    },
    parentName: {
        type: String,
        required: true
    },
    parentEmail: {
        type: String,
        required: true
    },
    parentPhone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    classApplied: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    documents: [
        {
            type: String
        }
    ],
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Admission', AdmissionSchema);