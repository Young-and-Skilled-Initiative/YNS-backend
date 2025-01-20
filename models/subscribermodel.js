const mongoose = require('mongoose');
require("dotenv").config();

// subscriber model
const SubscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribed: { type: Boolean, default: false }, // to track if unsubscribed
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);
