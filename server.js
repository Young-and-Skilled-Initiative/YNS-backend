const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const newsletterRoutes = require("./routes/newsletterRoutes");
const movementRoutes = require("./routes/movementRoutes");
require('dotenv').config();
const connectDB = require('./config/connectDB');

const app = express();
const PORT = process.env.PORT || 5000;

// CONNECTION TO THE DATABASE
connectDB();

// MIDDLEWARE
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


// ROUTE

app.get("/api", (req, res) => {
    res.send("Welcome to YNS newsletter and join the movemnt API");
})

app.use("/api/newsletter", newsletterRoutes);
app.use("/api/movement", movementRoutes);

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});