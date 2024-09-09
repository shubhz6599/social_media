const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    serviceType: { type: String, required: true },
    contactInfo: {
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    createdAt: { type: Date, default: Date.now },
    interestedUsers: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
        username: { type: String },
        email: { type: String },
        phone: { type: String }
    }]
});

module.exports = mongoose.model('Service', serviceSchema);
