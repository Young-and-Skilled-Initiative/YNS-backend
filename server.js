const express = require('express');
const connectDB = require('./config/connectDB');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const Subscriber = require('./models/subscribermodel');
const { sendBulkMails, sendMailWithAttachment } = require('./utils/mailer.js');


const app = express();
const PORT = process.env.PORT || 5000;

// connecting to the database
connectDB();

// middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


// Routes

// root route
app.get('/', (req, res) => {
    res.send('Hello from YNS Newsletter')
})

// route for adding subscribers to the newsletter
app.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send('Email is required');
    }

    try {
        const subscriber = new Subscriber({ email });
        await subscriber.save();
        res.status(201).send('Subscription successful');
    } catch (error) {
        res.status(400).send('Error subscribing: ' + error.message);
    }
});

// route to fetch all subscribers
app.get('/subscribers', async (req, res) => {
  try {
    // Fetch all subscribers from the database
    const subscribers = await Subscriber.find();

    // Return the subscribers as a JSON response
    res.status(200).json({ success: true, data: subscribers });
  } catch (error) {
    console.error("Error fetching subscribers:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch subscribers." });
  }
});

// Route to send emails to all subscribers
app.post('/send-mails', async (req, res) => {
  try {
    // Fetch subscribers from the database
    const subscribers = await Subscriber.find();

    if (subscribers.length === 0) {
      return res.status(404).json({ message: "No subscribers found." });
    }

    console.log("Fetched Subscribers:", subscribers); // Log to debug

    await sendBulkMails(subscribers);
    res.status(200).json({ message: "Emails processed successfully." });
  } catch (error) {
    console.error("Error processing emails:", error.message);
    res.status(500).json({ message: "Failed to process emails.", error: error.message });
  }
});

// Route to send email with an attachment to all subscribers
app.post('/send-mail-with-attachment', async (req, res) => {
  const { subject, html, attachmentPath } = req.body;

  if (!subject || !html) {
    return res.status(400).send('Subject and HTML content are required');
  }

  try {
    // Fetch all active subscribers from the database
    const subscribers = await Subscriber.find({ unsubscribed: false });

    if (subscribers.length === 0) {
      return res.status(404).json({ message: 'No subscribers found.' });
    }

    const emailPromises = subscribers.map(async (subscriber) => {
      // Send email with attachment to each subscriber
      await sendMailWithAttachment({
        recipient: subscriber.email,
        subject,
        html,
        attachmentPath, // Attach the file to the email
      });
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    res.status(200).json({ message: 'Emails with attachment sent successfully.' });
  } catch (error) {
    console.error('Error sending emails with attachment:', error);
    res.status(500).json({ message: 'Error sending emails with attachment', error: error.message });
  }
});


// Route to handle unsubscribing
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