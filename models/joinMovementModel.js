const mongoose = require("mongoose");
require("dotenv").config;


const MovementSubscriberSchema = new mongoose.Schema({
  name: {type: String, required: true, },
  email: { type: String, required: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  unsubscribed: { type: Boolean, default: false },
});

module.exports = mongoose.model("MovementSubscriber", MovementSubscriberSchema);