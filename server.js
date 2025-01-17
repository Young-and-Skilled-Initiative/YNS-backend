const express = require('express');
const connectDB = require('./config/connectDB');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const Subscriber = require('./models/subscribermodel');
const { sendMail, sendBulkEmails } = require('./utils/mailer.js');


const app = express();
const PORT = process.env.PORT || 5000;

// connecting to the database
connectDB();

// middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


// Routes

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

// route to send email to a single subscriber
app.post('/send-mail', async (req, res) => {
    const { to, subject, html } = req.body;
  
    // Validation to ensure required fields are provided
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ message: 'Missing required fields: to, subject, and either text or html' });
    }
    try {
      // Call the sendMail function
      const info = await sendMail({
        to,
        subject,
        html: html || `<p>${text}</p>`, // Default to text if HTML is not provided
      });
      // Success response
      res.status(200).json({
        message: 'Email sent successfully',
        info,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      // Error response
      res.status(500).json({
        message: 'Error sending email',
        error: {
          message: error.message,
          stack: error.stack,
        },
      });
    }
  });

// Route to send emails to all subscribers
app.post("/send-emails", async (req, res) => {
  try {
    const subscribers = await Subscriber.find(); // Get all subscribers
    if (subscribers.length === 0) {
      return res.status(404).send({ message: "No subscribers found!" });
    }

    await sendBulkEmails(subscribers); // Use the service to send emails
    res.send({ message: "Emails sent successfully!" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).send({ message: "Failed to send emails.", error });
  }
});


// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});