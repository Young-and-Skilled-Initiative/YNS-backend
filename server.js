const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const newsletterRoutes = require("./routes/newsletterRoutes");
const movementRoutes = require("./routes/movementRoutes");
const contactRoutes = require("./routes/contactRoutes"); // NEW: Contact routes

require('dotenv').config();
const connectDB = require('./config/connectDB');

const app = express();
const PORT = process.env.PORT || 3001;

// CONNECTION TO THE DATABASE
connectDB();

// Trust proxy for rate limiting (important for production)
app.set('trust proxy', 1);

// SECURITY MIDDLEWARE
app.use(helmet());

// CORS MIDDLEWARE (FIXED - Updated with production frontend URL)
const allowedOrigins = [
    'https://www.youngandskilled.org', // Your current production frontend
    'https://yns-main.vercel.app',     // Your old frontend (if still needed)
    'http://localhost:3000',           // Local development
    'http://localhost:3001'            // Local development alt port
];

// Add FRONTEND_URL if it exists and isn't already in the array
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// GENERAL RATE LIMITING (optional - protects all routes)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

// BODY PARSING MIDDLEWARE
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

// ROUTES
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to YNS newsletter and join the movement API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        endpoints: {
            newsletter: "/api/newsletter",
            movement: "/api/movement", 
            contact: "/api/contact",
            stats: "/api/stats",
            health: "/health"
        }
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Server is healthy!',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage()
    });
});

// API ROUTES
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/movement", movementRoutes);
app.use("/api/stats", newsletterRoutes);
app.use("/api/contact", contactRoutes); // NEW: Contact routes

// ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.stack);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors
        });
    }
    
    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }
    
    // Duplicate key error
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry detected'
        });
    }
    
    // Default server error
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 HANDLER (catch all unmatched routes)
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        availableEndpoints: [
            '/api/newsletter',
            '/api/movement', 
            '/api/contact',
            '/api/stats',
            '/health'
        ]
    });
});

// GRACEFUL SHUTDOWN
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

// START THE SERVER
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📧 Contact API: http://localhost:${PORT}/api/contact`);
});