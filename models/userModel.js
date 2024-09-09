const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    avatar: { type: String },
    dob: { type: Date }, // Date of birth field
    bio: { type: String }, // Bio field
    profilePicture: { type: String }, // Profile picture path
})

module.exports = mongoose.model('Users', userSchema)