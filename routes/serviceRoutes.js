const express = require('express');
const router = express.Router();
const Service = require('../models/service');

// Create a new service
router.post('/', async (req, res) => {
    try {
        const { title, description, serviceType, contactInfo } = req.body;
        const service = new Service({
            title,
            description,
            serviceType,
            contactInfo,
            createdBy: req.user._id
        });
        await service.save();
        res.status(201).json(service);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create service', error: err });
    }
});

// Get all services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find().populate('createdBy', 'username email');
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch services', error: err });
    }
});

// Update a service
router.put('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (service.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const { title, description, serviceType, contactInfo } = req.body;
        service.title = title || service.title;
        service.description = description || service.description;
        service.serviceType = serviceType || service.serviceType;
        service.contactInfo = contactInfo || service.contactInfo;
        await service.save();
        res.json(service);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update service', error: err });
    }
});

// Delete a service
router.delete('/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (service.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await service.remove();
        res.json({ message: 'Service deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete service', error: err });
    }
});

// Express interest in a service
router.post('/:id/interest', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        const interestedUser = {
            userId: req.user._id,
            username: req.user.username,
            email: req.user.email,
            phone: req.user.phone
        };
        service.interestedUsers.push(interestedUser);
        await service.save();
        res.json({ message: 'Interest expressed successfully', interestedUser });
    } catch (err) {
        res.status(500).json({ message: 'Failed to express interest', error: err });
    }
});

module.exports = router;
