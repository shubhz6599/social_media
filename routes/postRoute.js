const express = require('express');
const multer = require('multer');
const Post = require('../models/postModel');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Configure Multer for in-memory storage
const storage = multer.memoryStorage(); // Use memory storage
const upload = multer({ storage: storage });

// Create a new post
router.post('/create', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const username = req.user.username; // Automatically get username from authenticated user

        if (!username) {
            return res.status(400).json({ message: 'Username could not be found', status: 'Failed' });
        }

        // Create the new post
        const newPost = new Post({
            title,
            content,
            category,
            image: req.file ? { data: req.file.buffer, contentType: req.file.mimetype } : null, // Save image in MongoDB
            author: req.user.id,
            username: req.user.username
        });

        await newPost.save();
        res.status(200).json({ message: 'Post Created Successfully', status: 'Success', post: newPost });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while creating the post', status: 'Failed' });
    }
});

// Get all posts
router.get('/all', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'userName email').exec();
        res.status(200).json(posts);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ message: 'An error occurred while fetching posts', status: 'Failed' });
    }
});

// Get image by post ID
router.get('/image/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post || !post.image || !post.image.data) {
            return res.status(404).json({ message: 'Image not found', status: 'Failed' });
        }

        res.set('Content-Type', post.image.contentType);
        res.send(post.image.data);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while fetching the image', status: 'Failed' });
    }
});

// Edit a post
router.put('/edit/:postId', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, content, category } = req.body;

        const post = await Post.findOne({ _id: postId, author: req.user.id });

        if (!post) {
            return res.status(404).json({ message: 'Post not found or unauthorized', status: 'Failed' });
        }

        post.title = title;
        post.content = content;
        post.category = category;

        if (req.file) {
            post.image = { data: req.file.buffer, contentType: req.file.mimetype }; // Update the image in MongoDB
        }

        post.updatedAt = Date.now();

        await post.save();
        res.status(200).json({ message: 'Post Updated Successfully', status: 'Success', post });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while editing the post', status: 'Failed' });
    }
});
module.exports = router;
