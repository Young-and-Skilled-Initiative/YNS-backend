const mongoose = require('mongoose');
require("dotenv").config();

// subscriber model
const SubscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    subscribedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);
