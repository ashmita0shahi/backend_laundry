const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { geocodeAddress } = require('../utils/geocoder');

// Signup function
exports.signup = async (req, res) => {
    const { fullName, email, location, password, phoneNumber } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Geocode the location to get coordinates
        let coordinates = [0, 0];
        try {
            const geocodeResult = await geocodeAddress(location);
            if (geocodeResult && geocodeResult.length > 0) {
                coordinates = [geocodeResult[0].longitude, geocodeResult[0].latitude];
            }
        } catch (geoError) {
            console.error('Geocoding error:', geoError);
            // Continue with default coordinates if geocoding fails
        }

        // Create new user
        user = new User({
            fullName,
            email,
            location,
            coordinates: {
                type: 'Point',
                coordinates
            },
            password: await bcrypt.hash(password, 10),
            phoneNumber
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({ 
            token, 
            user: { 
                id: user._id, 
                fullName: user.fullName, 
                email: user.email, 
                location: user.location, 
                coordinates: user.coordinates,
                phoneNumber: user.phoneNumber
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login function
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        // Count unread notifications
        const unreadCount = user.notifications.filter(n => !n.read).length;

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                fullName: user.fullName, 
                email: user.email, 
                location: user.location,
                coordinates: user.coordinates,
                phoneNumber: user.phoneNumber,
                role: user.role,
                unreadNotifications: unreadCount
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get current logged in user
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Count unread notifications
        const unreadCount = user.notifications.filter(n => !n.read).length;
        
        res.json({
            success: true,
            data: {
                ...user._doc,
                unreadNotifications: unreadCount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, phoneNumber, location } = req.body;
        
        // Fields to update
        const fieldsToUpdate = {};
        if (fullName) fieldsToUpdate.fullName = fullName;
        if (phoneNumber) fieldsToUpdate.phoneNumber = phoneNumber;
        
        // Update location and coordinates if location is provided
        if (location) {
            fieldsToUpdate.location = location;
            
            // Geocode the location to get coordinates
            try {
                const geocodeResult = await geocodeAddress(location);
                if (geocodeResult && geocodeResult.length > 0) {
                    fieldsToUpdate.coordinates = {
                        type: 'Point',
                        coordinates: [geocodeResult[0].longitude, geocodeResult[0].latitude]
                    };
                }
            } catch (geoError) {
                console.error('Geocoding error:', geoError);
                // Continue with update even if geocoding fails
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user.id);

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};