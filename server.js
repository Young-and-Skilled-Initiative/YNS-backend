const express = require("express");
const connectDB = require("./config/connectDB");
const bodyParser = require('body-parser');
const Subscriber = require("./models/subscribermodel")
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// connecting to the database
connectDB();

// middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send("Hello from YNS Newsletter")
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

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});