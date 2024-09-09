// middleware/auth.js

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'Access Denied. No token provided.', status: 'Failed' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from the header
    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.', status: 'Failed' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Verified user:', verified); // Debug log
        req.user = verified; // Store user details from token in request object
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        res.status(400).json({ message: 'Invalid Token', status: 'Failed' });
    }
};

module.exports = verifyToken;
