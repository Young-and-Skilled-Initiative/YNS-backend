const MovementSubscriber = require("../models/joinMovementModel");
const sendMail = require("../utils/mailer");

/**
 * Join the movement.
 */
const joinMovement = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    const existingSubscriber = await MovementSubscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(409).json({ message: "Already joined." });
    }

    const newSubscriber = new MovementSubscriber({ name, email });
    await newSubscriber.save();

    const htmlContent = `<h2>Welcome, ${name}!</h2><p>Find attached your guide.</p>`;
    const attachmentPath = "";
    
    await sendMail({ 
      recipient: email, 
      subject: "Welcome!", 
      htmlContent, 
      attachmentPath 
    });

    res.status(201).json({ message: "Joined successfully." });
  } catch (error) {
    console.error("Error subscribing to the movement:", error.message);
    res.status(500).json({ message: "Error joining", error: error.message });
  }
};

module.exports = { joinMovement };