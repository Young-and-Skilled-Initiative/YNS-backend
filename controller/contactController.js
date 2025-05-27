const Contact = require('../models/contactModel');
const nodemailer = require('nodemailer');

// Create email transporter (optional - for sending notifications)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.PARTNER_EMAIL,
        pass: process.env.PARTNER_EMAIL_PASSWORD
    }
});

// Submit contact form
const submitContactForm = async (req, res) => {
    try {
        const { fullName, email, company, subject, message } = req.body;

        // Basic validation
        if (!fullName || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields (Full Name, Email, Subject, Message)'
            });
        }

        // Check if user can send a message today
        const canSend = await Contact.canSendToday(email);
        if (!canSend) {
            return res.status(429).json({
                success: false,
                message: 'You can only send one message per day. Please try again tomorrow.'
            });
        }

        // Get client IP and User Agent for tracking
        const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';

        // Create new contact message
        const contactMessage = new Contact({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            company: company ? company.trim() : '',
            subject: subject.trim(),
            message: message.trim(),
            ipAddress,
            userAgent
        });

        // Save to database
        await contactMessage.save();

        // Optional: Send notification email to your team
        try {
            await transporter.sendMail({
                from: process.env.PARTNER_EMAIL,
                to: process.env.PARTNER_EMAIL,
                subject: `New Contact Form Submission: ${subject}`,
                html: `
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${fullName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Company:</strong> ${company || 'Not provided'}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                    <hr>
                    <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
                    <p><small>IP Address: ${ipAddress}</small></p>
                `
            });
        } catch (emailError) {
            console.error('Failed to send notification email:', emailError);
            // Don't fail the request if email notification fails
        }

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.',
            data: {
                id: contactMessage._id,
                submittedAt: contactMessage.createdAt
            }
        });

    } catch (error) {
        console.error('Contact form submission error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Handle duplicate key errors (shouldn't happen with our setup, but good to have)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'A message with this information already exists'
            });
        }

        // Generic server error
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again later.'
        });
    }
};

// Get all contact messages (for admin use)
const getAllContactMessages = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;

        const query = status ? { status } : {};
        
        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-userAgent -ipAddress'); // Hide sensitive info in list view

        const total = await Contact.countDocuments(query);

        res.status(200).json({
            success: true,
            data: contacts,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve contact messages'
        });
    }
};

// Get single contact message (for admin use)
const getContactMessage = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        res.status(200).json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error('Get contact message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve contact message'
        });
    }
};

// Update contact message status (for admin use)
const updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['unread', 'read', 'responded'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: unread, read, or responded'
            });
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Contact status updated successfully',
            data: contact
        });

    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contact status'
        });
    }
};

module.exports = {
    submitContactForm,
    getAllContactMessages,
    getContactMessage,
    updateContactStatus
};