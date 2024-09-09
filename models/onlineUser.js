// models/onlineUser.js
const mongoose = require('mongoose');

const onlineUserSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, unique: true },
    lastActivity: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OnlineUser', onlineUserSchema);
