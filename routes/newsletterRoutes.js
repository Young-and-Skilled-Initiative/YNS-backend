const express = require("express");
const { subscribeToNewsletter, sendBulkNewsletter } = require("../controller/newsletterController");

const router = express.Router();


router.post("/subscribe", subscribeToNewsletter);

router.post("/send-newsletter", sendBulkNewsletter);

module.exports = router;