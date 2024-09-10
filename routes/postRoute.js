const express = require('express');
const multer = require('multer');
const Post = require('../models/postModel');
const verifyToken = require('../middleware/auth');
const router = express.Router();
// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Destination folder for image uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Filename format
    }
});

const upload = multer({ storage: storage });

// Create a new post
router.post('/create', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const username = req.user.username; // Automatically get username from authenticated user

        // Ensure username exists (in case of any middleware issues)
        if (!username) {
            return res.status(400).json({ message: 'Username could not be found', status: 'Failed' });
        }

        // Create the new post
        const newPost = new Post({
            title,
            content,
            category,
            image: req.file ? req.file.path : null, // Save the file path to the image
            author: req.user.id,
            username: req.user.username // Save the username from the token
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

// Get posts by category
router.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const posts = await Post.find({ category }).populate('author', 'userName email').exec();
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while fetching posts by category', status: 'Failed' });
    }
});

// Edit a post
router.put('/edit/:postId', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, content, category } = req.body;
        const image = req.file ? req.file.path : null; // Get the new image path if uploaded

        const post = await Post.findOne({ _id: postId, author: req.user.id });

        if (!post) {
            return res.status(404).json({ message: 'Post not found or unauthorized', status: 'Failed' });
        }

        post.title = title;
        post.content = content;
        post.category = category;
        if (image) post.image = image; // Update image if new image is provided
        post.updatedAt = Date.now();

        await post.save();
        res.status(200).json({ message: 'Post Updated Successfully', status: 'Success', post });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while editing the post', status: 'Failed' });
    }
});

// Like a post
router.post('/like/:postId', verifyToken, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user.id; // Assuming 'verifyToken' middleware attaches 'user' to req

        // Find the post by ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found', status: 'Failed' });
        }

        // Check if the user has already liked the post
        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex === -1) {
            // User hasn't liked yet, so we add a like
            post.likes.push(userId);
            await post.save();
            return res.status(200).json({ message: 'Post liked', status: 'Success' });
        } else {
            // User already liked, so we remove the like (dislike)
            post.likes.splice(likeIndex, 1);
            await post.save();
            return res.status(200).json({ message: 'Post disliked', status: 'Success' });
        }
    } catch (err) {
        res.status(500).json({ message: 'An error occurred', status: 'Failed' });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {

        const posts = await Post.find({ author: req.params.userId }); // Fetch posts by user ID
        console.log(posts);
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
});
router.put('/edit/:postId', async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.postId, req.body, { new: true });
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error });
    }
});
router.delete('/delete/:postId', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error });
    }
});
module.exports = router;
