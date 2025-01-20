const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const Subscriber = require('../models/subscribermodel');
const SentMail = require('../models/sentMailModel')

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.PARTNER_EMAIL,
    pass: process.env.PARTNER_EMAIL_PASSWORD,
},
tls:{
    rejectUnauthorized:false
}

});

// verify transporter
transporter.verify((error, success) => {
    if (error) {
      console.error('Error verifying transporter:', error);
    } else {
      console.log('Transporter is ready:', success);
    }
  });

// generating unsubscribe link
const generateUnsubscribeLink = (email) => {
  const unsubscribeToken = encodeURIComponent(email);
  return `http://your-website.com/unsubscribe?email=${unsubscribeToken}`;
};


// Function to send an email
const sendMail = async ({recipient = Subscriber.email, subject, html, attachments = []}) => {
  if (!recipient) {
    console.error("Recipient email is required!");
    throw new Error("Recipient email is required!");
  }

  const mailOptions = {
      from:  process.env.PARTNER_EMAIL,
      to: recipient,
      subject,
      html,
      attachments,
  }

  try {
    await transporter.sendMail(mailOptions);

    // Log the sent email into the database
    const sentMail = new SentMail({
      recipient,
      subject,
      html,
      status: 'sent',
    });
    await sentMail.save();

    console.log(`Email sent to: ${recipient}`);
  } catch (error) {
    console.error(`Error sending email to ${recipient}:`, error);

    // Log the failed email attempt into the database
    const sentMail = new SentMail({
      recipient,
      subject,
      html,
      status: 'failed',
    });
    await sentMail.save();
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipient}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${recipient}:`, error.message);
    throw error;
  }

  return transporter.sendMail(mailOptions);
};


const sendBulkMails = async (subscribers) => {
  const validSubscribers = subscribers.filter((subscriber) => {
    return (
      subscriber.email &&
      !subscriber.unsubscribed &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subscriber.email)
    );
  });

  if (validSubscribers.length === 0) {
    console.log("No valid subscribers found.");
    return;
  }

  const emailPromises = validSubscribers.map(async (subscriber) => {
    try {
      const subject = "Newsletter Update";
      const html = `
      <p>Hi <b>${subscriber.name}</b>,
      </p><p>Thank you for staying connected. Here's our latest update!</p>
      <p>Best regards,<br>Your Team</p>
      <p><a href="${generateUnsubscribeLink(subscriber.email)}">Unsubscribe from this newsletter</a></p>
      `;

      await sendMail({
        recipient: subscriber.email, 
        subject, 
        html
      });
    } catch (error) {
      console.error(`Error sending email to ${subscriber.email}:`, error);
    }
  });

  return Promise.all(emailPromises);
};

const sendMailWithAttachment = async ({ recipient, subject, html, attachmentPath }) => {
  const attachment = attachmentPath
    ? [
        {
          filename: path.basename(attachmentPath),
          path: attachmentPath,
        },
      ]
    : [];

  return sendMail({ recipient, subject, html, attachments: attachment });
};


module.exports = { sendMail, sendBulkMails, sendMailWithAttachment };