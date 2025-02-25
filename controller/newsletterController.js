const NewsletterSubscriber = require("../models/newsletterSubscribermodel");
const sendMail = require("../utils/mailer");

/**
 * Subscribe to the newsletter.
 */
const subscribeToNewsletter = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    const existingSubscriber = await NewsletterSubscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(409).json({ message: "Already subscribed." });
    }

    const newSubscriber = new NewsletterSubscriber({ name, email });
    await newSubscriber.save();

    const htmlContent = `
      <div style="text-align: center; font-family: Arial, sans-serif;">
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for subscribing to <strong>Young and Skilled Initiative</strong>.</p>
      <p>We are excited to have you on board!</p>
      <p>Stay tuned for updates and opportunities.</p>
      <p style="font-size: 14px; color: #777; margin-top: 20px;">&copy; ${new Date().getFullYear()} Young and Skilled Initiative. All rights reserved.</p>
    </div>
`;
    await sendMail({ 
        recipient: email, 
        subject: "Welcome!", 
        htmlContent 
    });

    res.status(201).json({ message: "Subscribed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error subscribing", error: error.message });
  }
};

/**
 * Send bulk newsletters to all subscribers.
 */
const sendBulkNewsletter = async (req, res) => {
  
    try {
      // Fetch all active subscribers
      const subscribers = await NewsletterSubscriber.find({ unsubscribed: false });
  
      if (subscribers.length === 0) {
        return res.status(404).json({ message: "No active subscribers found." });
      }

      const subject = "Latest Newsletter!";
      const htmlContent = "<h2>Stay Updated!</h2><p>Here is your latest newsletter.</p>";

      // Send emails to all subscribers
      for (const subscriber of subscribers) {
        await sendMail({
          recipient: subscriber.email,
          subject,
          htmlContent,
        });
      }
  
      res.status(200).json({ message: "Newsletter sent successfully to all subscribers." });
    } catch (error) {
      console.error("Error sending bulk newsletter:", error);
      res.status(500).json({ message: "Error sending newsletter.", error: error.message });
    }
  };

module.exports = { subscribeToNewsletter, sendBulkNewsletter };