// routes/friendRequest.js
const express = require('express');
const router = express.Router();
const FriendRequest = require('../models/friendRequest');
const User = require('../models/userModel')
// Send Friend Request
router.post('/send-request', async (req, res) => {
    const { requesterId, recipientId } = req.body;
    try {
        const request = new FriendRequest({ requester: requesterId, recipient: recipientId });
        await request.save();
        res.status(200).json({ message: 'Friend request sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error sending friend request' });
    }
});

// Confirm Friend Request
router.post('/confirm-request', async (req, res) => {
    const { requestId } = req.body;
    try {
        await FriendRequest.findByIdAndUpdate(requestId, { status: 'accepted' });
        res.status(200).json({ message: 'Friend request accepted' });
    } catch (error) {
        res.status(500).json({ error: 'Error accepting friend request' });
    }
});

// Reject Friend Request
router.post('/reject-request', async (req, res) => {
    const { requestId } = req.body;
    try {
        await FriendRequest.findByIdAndUpdate(requestId, { status: 'rejected' });
        res.status(200).json({ message: 'Friend request rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Error rejecting friend request' });
    }
});

// Get All Friend Requests for a User
router.get('/requests/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const requests = await FriendRequest.find({ recipient: userId, status: 'pending' }).populate('requester');
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching friend requests' });
    }
});

router.get('/suggestions/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        // Find users who are either friends or have a pending request
        const requests = await FriendRequest.find({
            $or: [{ requester: userId }, { recipient: userId }]
        }).select('requester recipient status');

        const friendIds = requests
            .filter(r => r.status === 'accepted')
            .flatMap(r => [r.requester, r.recipient])
            .filter(id => id.toString() !== userId);

        const pendingRequestIds = requests
            .filter(r => r.status === 'pending')
            .flatMap(r => [r.requester, r.recipient])
            .filter(id => id.toString() !== userId);

        // Combine friend IDs and pending request IDs
        const excludeIds = [...new Set([...friendIds, ...pendingRequestIds])];

        // Find suggested users excluding the logged-in user and existing friends or pending requests
        const suggestions = await User.find({
            _id: { $ne: userId, $nin: excludeIds }
        }).select('userName');

        // Add pending request information to each suggestion
        const suggestionsWithStatus = await Promise.all(suggestions.map(async (user) => {
            const request = requests.find(r =>
                (r.requester.toString() === user._id.toString() || r.recipient.toString() === user._id.toString()) &&
                r.status === 'pending'
            );
            return {
                ...user.toObject(),
                requestStatus: request ? 'pending' : 'none'
            };
        }));

        res.status(200).json(suggestionsWithStatus);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user suggestions' });
    }
});


module.exports = router;
