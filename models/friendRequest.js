// models/friendRequest.js
const mongoose = require('mongoose');

const FriendRequestSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FriendRequest', FriendRequestSchema);
