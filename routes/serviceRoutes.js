// routes/serviceRoutes.js

const express = require('express');
const Service = require('../models/serviceModel');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Create a new service
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { title, description, category, price } = req.body;
        const providerId = req.user.id; // ID of the user creating the service

        const newService = new Service({
            title,
            description,
            category,
            price,
            provider: providerId,
        });

        await newService.save();
        res.status(200).json({ message: 'Service Created Successfully', status: 'Success', service: newService });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while creating the service', status: 'Failed' });
    }
});

// Get all services
router.get('/all', async (req, res) => {
    try {
        const services = await Service.find().populate('provider', 'userName email');
        res.status(200).json(services);
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while fetching services', status: 'Failed' });
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const serviceId = req.params.id;
        const service = await Service.findById(serviceId).populate('provider', 'userName email').exec();

        if (!service) {
            return res.status(404).json({ message: 'Service not found', status: 'Failed' });
        }

        res.status(200).json(service);
    } catch (err) {
        console.error('Error fetching service details:', err);
        res.status(500).json({ message: 'An error occurred while fetching service details', status: 'Failed' });
    }
});

// Update a service
router.put('/edit/:serviceId', verifyToken, async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { title, description, category, price } = req.body;

        const service = await Service.findOne({ _id: serviceId, provider: req.user.id });

        if (!service) {
            return res.status(404).json({ message: 'Service not found or unauthorized', status: 'Failed' });
        }

        service.title = title;
        service.description = description;
        service.category = category;
        service.price = price;
        service.updatedAt = Date.now();

        await service.save();
        res.status(200).json({ message: 'Service Updated Successfully', status: 'Success', service });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while editing the service', status: 'Failed' });
    }
});

// Delete a service
router.delete('/delete/:serviceId', verifyToken, async (req, res) => {
    try {
        const { serviceId } = req.params;
        const service = await Service.findOneAndDelete({ _id: serviceId, provider: req.user.id });

        if (!service) {
            return res.status(404).json({ message: 'Service not found or unauthorized', status: 'Failed' });
        }

        res.status(200).json({ message: 'Service Deleted Successfully', status: 'Success' });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while deleting the service', status: 'Failed' });
    }
});

// Express interest in a service
router.post('/interested/:serviceId', verifyToken, async (req, res) => {
    try {
        const { serviceId } = req.params;
        const interestedUser = {
            userId: req.user.id,
            username: req.user.username,
            email: req.user.email,
            phoneNumber: req.user.phoneNumber
        };

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({ message: 'Service not found', status: 'Failed' });
        }

        // Check if user is already interested
        const alreadyInterested = service.interestedUsers.some(user => user.userId.toString() === interestedUser.userId);

        if (alreadyInterested) {
            return res.status(400).json({ message: 'You have already expressed interest in this service', status: 'Failed' });
        }

        service.interestedUsers.push(interestedUser);
        await service.save();

        res.status(200).json({ message: 'Interest Expressed Successfully', status: 'Success' });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred while expressing interest', status: 'Failed' });
    }
});

module.exports = router;
