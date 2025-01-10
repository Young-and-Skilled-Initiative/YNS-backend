const express = require('express');
const connectDB = require('./config/connectDB');
const bodyParser = require('body-parser');
require('dotenv').config();
const Subscriber = require('./models/subscribermodel');
const { sendMail } = require('./utils/mailer.js');


const app = express();
const PORT = process.env.PORT || 5000;

// connecting to the database
connectDB();

// middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes

app.get('/api', (req, res) => {
    res.send('Hello from YNS Newsletter')
})

// route for adding subscribers to the newsletter
app.post('/api/subscribe', async (req, res) => {
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

app.use(express.json());

// route to send email
app.post('/api/send-email', async (req, res) => {
  const { to, subject, text} = req.body;

  try {
    const info = await sendMail(to, subject, text);
    res.status(200).json({ message: 'Email sent successfully', info });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email', 
        error: error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : 'Unknown error', });
  }
});

console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASSWORD);



// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});