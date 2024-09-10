// models/serviceModel.js

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }, // Reference to the user providing the service
    interestedUsers: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
        username: String,
        email: String,
        phoneNumber: String,
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
