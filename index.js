const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDb = require('./config/db');
const userRoutes = require('./routes/userRoute');
const postRoutes = require('./routes/postRoute');
const friendRequestRoutes = require('./routes/friendRequest');
const messageRoutes = require('./routes/messageRoute');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const serviceRoutes = require('./routes/serviceRoutes');

dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(cors({
    origin: '*', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
const io = socketIo(server, {
    cors: {
        origin: 'https://social-media-380d7.web.app', // Ensure this matches your frontend's URL
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
    origin: 'http://localhost:4200' // Adjust this if your frontend is running on a different port
}));
app.use(express.json());

connectDb();

// Handle socket connections
io.on('connection', (socket) => {
    console.log('New client connected: ' + socket.id);

    // Join a specific room with the userId
    socket.on('joinRoom', (userId) => {
        console.log(`User ${userId} joined room`);
        socket.join(userId);
    });

    // Handle sending messages
    socket.on('sendMessage', (data) => {
        console.log('Message sent from', data.senderId, 'to', data.recipientId);
        io.to(data.recipientId).emit('receiveMessage', {
            senderId: data.senderId,
            content: data.message
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Apply middleware globally for routes that require authentication
app.use('/user', userRoutes);
app.use('/post', postRoutes);
app.use('/friends', friendRequestRoutes);
app.use('/messages', messageRoutes);
app.use('/services', serviceRoutes);

app.get('/', async (req, res) => {
    try {

        res.status(200).json('user');
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Server Started At ' + PORT);
});
