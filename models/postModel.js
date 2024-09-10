const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    image: String,  // Field for image URL
    username: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
