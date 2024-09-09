// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');
const verifyToken = require('../middleware/auth');

// Send a message
router.post('/send', verifyToken, async (req, res) => {
    const { recipientId, content } = req.body;
    const senderId = req.user.id; // Assuming req.user is populated by auth middleware

    try {
        const newMessage = new Message({
            senderId,
            recipientId,
            content
        });
        await newMessage.save();
        res.status(200).json({ message: 'Message sent', status: 'Success' });
    } catch (err) {
        res.status(500).json({ message: 'Error sending message', status: 'Failed' });
    }
});

// Get chat history
// Get chat history
router.get('/history/:userId', verifyToken, async (req, res) => {
    const currentUserId = req.user.id;
    const chatUserId = req.params.userId;

    try {
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, recipientId: chatUserId },
                { senderId: chatUserId, recipientId: currentUserId }
            ]
        })
            .sort('timestamp')
            .populate('senderId', 'userName') // Include sender username
            .populate('recipientId', 'userName'); // Include recipient username

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching messages', status: 'Failed' });
    }
});


module.exports = router;
