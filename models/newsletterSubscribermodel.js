const mongoose = require('mongoose');
require("dotenv").config();

// subscriber model
const NewsletterSubscriberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    unsubscribed: { type: Boolean, default: false },
    subscribedAt: { type: Date, default: Date.now },
  });
  
module.exports = mongoose.model("NewsletterSubscriber", NewsletterSubscriberSchema);