const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    image: {
        data: Buffer, // Store the image as binary data
        contentType: String // Store the content type (e.g., 'image/png')
    },
    username: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
