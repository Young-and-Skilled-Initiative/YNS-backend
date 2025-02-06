const mongoose = require("mongoose");
require("dotenv").config;


const MovementSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  unsubscribed: { type: Boolean, default: false },
});

module.exports = mongoose.model("MovementSubscriber", MovementSubscriberSchema);