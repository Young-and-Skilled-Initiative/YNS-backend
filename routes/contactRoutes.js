const express = require('express');
const router = express.Router();
const {
    submitContactForm,
    getAllContactMessages,
    getContactMessage,
    updateContactStatus
} = require('../controller/contactController');

// Rate limiting middleware (additional protection)
const rateLimit = require('express-rate-limit');

// Create rate limiter for contact form
const contactFormLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 requests per windowMs
    message: {
        success: false,
        message: 'Too many contact form submissions. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Admin rate limiter (more generous)
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes  
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    }
});

// Public routes
// POST /api/contact - Submit contact form
router.post('/', contactFormLimiter, submitContactForm);

// Admin routes (you might want to add authentication middleware here)
// GET /api/contact/admin - Get all contact messages (paginated)
router.get('/admin', adminLimiter, getAllContactMessages);

// GET /api/contact/admin/:id - Get single contact message
router.get('/admin/:id', adminLimiter, getContactMessage);

// PUT /api/contact/admin/:id/status - Update contact message status
router.put('/admin/:id/status', adminLimiter, updateContactStatus);

module.exports = router;