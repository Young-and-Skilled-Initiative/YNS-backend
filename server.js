const express = require('express');
const connectDB = require('./config/connectDB');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const Subscriber = require('./models/subscribermodel');
const MovementSubscriber = require("./models/joinMovementModel.js");
const { sendMail, sendBulkMails, sendMailWithAttachment, sendBulkMailsWithAttachment } = require('./utils/mailer.js');


const app = express();
const PORT = process.env.PORT || 5000;

// CONNECTION TO THE DATABASE
connectDB();

// MIDDLEWARE
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


// ROUTE

// root route
app.get('/', (req, res) => {
    res.send('Hello from YNS Newsletter')
})


// ROUTE TO ADD SUBSCRIBERS TO DATABASE 
// AND TO SEND WELCOME EMAIL
app.post('/subscribe', async (req, res) => {
    const { email, name} = req.body;

    if (!email || !name) {
        return res.status(400).send('Email and Name are required');
    }

    try {

      const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(409).send('You are already subscribed.');
        }

      const subscriber = new Subscriber({
        email: req.body.email,
        name: req.body.name,
      });
      await subscriber.save();

      res.status(201).send("Subscription successful");
        
      const htmlContent = `
            <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; font-family: Arial, sans-serif; text-align: center;">
                <h2 style="color: #007bff;">Welcome, ${name}!</h2>
                <p>Thank you for subscribing to <strong>Young and Skilled Initiative</strong>.</p>
                <p>We are excited to have you on board!</p>
                <p>Stay tuned for updates and opportunities.</p>
                <p style="font-size: 14px; color: #777; margin-top: 20px;">&copy; ${new Date().getFullYear()} Young and Skilled Initiative. All rights reserved.</p>
            </div>
        `;

      await sendMail({
        recipient: email,
        subject: 'Welcome to Our Newsletter!',
        htmlContent
    }).catch(err => console.log("error sending welcome email", err));

    } catch (error) {
        res.status(400).send('Error subscribing: ' + error.message);
    }
});


// ROUTE TO SEND EMAILS TO ALL NEWSLETTER SUBSCRIBERS
app.post('/send-newsletter', async (req, res) => {
  try {
    // Fetch subscribers from the database
    const subscribers = await Subscriber.find();

    if (subscribers.length === 0) {
      return res.status(404).json({ message: "No subscribers found." });
    }

    console.log("Fetched Subscribers:", subscribers); // Log to debug

    const subject = "Our Latest Updates!";
    const placeholders = {
      companyName: "Young And Skilled Initiative",
    };

    await sendBulkMails(subscribers, subject, "newsletter_template", placeholders);

    res.status(200).json({ message: "Emails processed successfully." });

  } catch (error) {
    console.error("Error processing emails:", error.message);
    res.status(500).json({ message: "Failed to process emails.", error: error.message });
  }
});


// ROUTE TO SEND BULK EMAILS TO NEWSLETTER SUBSCRIBERS WITH ATTACHMENTS
app.post('/send-newsletter-attachment', async (req, res) => {
  const { subject, templateName, placeholders, attachmentPath } = req.body;

  if (!subject || !templateName || !placeholders) {
    return res.status(400).send("Subject, template name, and placeholders are required.");
  }

  try {
    // Fetch all active newsletter subscribers (you can change this query to match your data model)
    const subscribers = await NewsletterSubscriber.find({ unsubscribed: false });

    if (subscribers.length === 0) {
      return res.status(404).json({ message: "No active newsletter subscribers found." });
    }

    console.log("Fetched Newsletter Subscribers:", subscribers);

    // Send the bulk email with attachments to all subscribers
    const result = await sendBulkMailsWithAttachment(
      subscribers, subject, templateName, placeholders, attachmentPath
    );

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({ message: "Newsletter emails with attachment sent successfully." });

  } catch (error) {
    console.error("Error sending newsletter emails:", error.message);
    res.status(500).json({ message: "Error sending newsletter emails", error: error.message });
  }
});



// ROUTE TO ALLOW SUBSCRIBERS JOIN THE MOVEMENT
app.post("/join-movement", async (req, res) => {
  const { name, email} = req.body;

  if (!name || !email) {
    return res.status(400).send("Email is required");
  }

  try {

    const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(409).send('You are already subscribed.');
        }

    const subscriber = new MovementSubscriber({
      name: req.body.name,
      email: req.body.email,
    });
    await subscriber.save();

    
    const subject = "Welcome to the Movement!";
    const templateName = "movement_welcome"; 
    const placeholders = { 
      subscriberName: name || "Subscriber", 
      subscriberEmail: email, 
      movementName: "Join the Movement" 
    };
    const attachmentPath = "./assets/movement-guide.pdf"; // Example attachment


    await sendMailWithAttachment({
      recipient: email,
      subject,
      templateName,
      placeholders,
      attachmentPath,
    });

    res.status(201).send("Subscription successful. Welcome email sent.");
  } catch (error) {
    res.status(400).send("Error subscribing: " + error.message);
  }
});


// ROUTE TO HANDLE UNSUBSCRIBING
app.get('/unsubscribe', async (req, res) => {
  const email = decodeURIComponent(req.query.email);

  if (!email) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    const subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    // Mark the subscriber as unsubscribed
    subscriber.unsubscribed = true;
    await subscriber.save();

    res.status(200).json({ message: 'You have successfully unsubscribed.' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ message: 'Error unsubscribing' });
  }
});

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});