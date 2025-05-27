// models/newsletterSendModel.js
const mongoose = require('mongoose');

const newsletterSendSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  headerText: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  bodyText: {
    type: String,
    required: true,
    maxLength: 5000
  },
  subText: {
    type: String,
    default: '',
    maxLength: 2000
  },
  recipientCount: {
    type: Number,
    required: true,
    min: 0
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'sent'
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Create indexes for better query performance
newsletterSendSchema.index({ createdAt: -1 }); // For finding recent sends
newsletterSendSchema.index({ sentAt: -1 });    // For sorting by send date
newsletterSendSchema.index({ status: 1 });     // For filtering by status

const NewsletterSend = mongoose.model('NewsletterSend', newsletterSendSchema);

module.exports = NewsletterSend;