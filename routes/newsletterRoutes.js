const express = require("express");
const { 
  subscribeToNewsletter, 
  sendBulkNewsletter, 
  getNewsletterStats 
} = require("../controller/newsletterController");

const router = express.Router();

router.post("/subscribe", subscribeToNewsletter);
router.post("/send-newsletter", sendBulkNewsletter);
router.get("/stats", getNewsletterStats);

module.exports = router;