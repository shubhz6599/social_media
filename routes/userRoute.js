const express = require('express');
const User = require('../models/userModel');
const router = express.Router();
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const OnlineUser = require('../models/onlineUser');

dotenv.config();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile-pictures/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });


router.post('/register', async (req, res) => {
    try {
        let { userName, password, email } = req.body;
        console.log(userName, password);
        const existingUser = await User.findOne({
            $or: [{ userName }, { email }]
        });
        if (existingUser) {
            return res.status(500).json({ message: 'User Already Exists', status: 'Failed' })
        }
        const hashedPass = await bcrypt.hash(password, 10)
        userName = userName.toLowerCase()
        const newUser = new User({ userName, password: hashedPass, email });

        await newUser.save();
        const token = jwt.sign({ id: newUser._id, username: newUser.userName }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json({ message: 'User Created', status: 'Success', token, userId: newUser._id })
    } catch (err) {
        res.status(500).json({ message: 'Invalid User', status: 'Failed' })

    }
})
router.post('/signin', async (req, res) => {
    try {
        let { userName, password } = req.body;
        console.log(userName, password);
        userName = userName.toLowerCase()
        const existingUser = await User.findOne({ userName });
        if (!existingUser) {
            return res.status(400).json({ message: 'User does not exist', status: 'Failed' })
        }
        const isCorrectPass = await bcrypt.compare(password, existingUser.password)
        console.log(isCorrectPass);
        if (!isCorrectPass) {
            return res.status(400).json({ message: 'Invalid credentials', status: 'Failed' });
        }
        const token = jwt.sign({ id: existingUser._id, username: existingUser.userName }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json({ message: 'User Sign In Success', status: 'Success', token, userId: existingUser._id })
    } catch (err) {
        res.status(500).json({ message: 'Invalid User', status: 'Failed' })

    }
})
router.post('/resetPassword', async (req, res) => {
    try {
        const { email, oldPassword, password, confirmPassword } = req.body;
        console.log(email, password, confirmPassword);
        const existingUser = await User.findOne({ email });
        console.log(existingUser);

        if (!existingUser) {
            return res.status(400).json({ message: 'User does not exist', status: 'Failed' })
        }
        const isCorrectPass = await bcrypt.compare(oldPassword, existingUser.password)
        if (!isCorrectPass) {
            return res.status(400).json({ message: 'old Pass is wrong', status: 'Failed' })
        }
        if (password != confirmPassword) {
            return res.status(400).json({ message: 'Password And Confirm Password Does Not Match', status: 'Failed' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        existingUser.password = hashedPassword;
        await existingUser.save();
        res.status(200).json({ message: 'Password Reset Success', status: 'Success' })
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while resetting the password', status: 'Failed' })

    }
})

// routes/userRoute.js
// routes/userRoute.js


router.get('/all', async (req, res) => {
    try {
        // Fetch all users with specific fields
        const users = await User.find({}, 'userName _id profilePicture'); // Adjust fields as needed
        res.status(200).json(users); // Send the users as a JSON response
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' }); // Error handling
    }
});
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId); // Fetch user by ID
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
});


router.put('/users/:userId', upload.single('profilePicture'), async (req, res) => {
    try {
        const userId = req.params.userId;
        const updates = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dob: req.body.dob,
            bio: req.body.bio
        };

        // Update profile picture if a new one is uploaded
        if (req.file) {
            updates.profilePicture = req.file.path;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});



module.exports = router