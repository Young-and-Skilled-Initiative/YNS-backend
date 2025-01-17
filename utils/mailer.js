const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

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

// Function to send an email
const sendMail = async ({from = process.env.PARTNER_EMAIL, recipient, subject, html,}) => {
  const mailOptions = {
      from,
      to: recipient,
      subject,
      html,
  }

  return transporter.sendMail(mailOptions);
};

// async function sendBulkEmails(subscribers) {
//   const emailPromises = subscribers.map( async (subscriber) => {
//     try {
//       console.log("Sending email to:", subscriber.email); // Debug log
//       const subject = "Newsletter Update";
//       const text = `Hi ${subscriber.name},\n\nThank you for staying connected. Here's our latest update!\n\nBest regards,\nYour Team`;
//       const html = `<p>Hi <b>${subscriber.name}</b>,</p><p>Thank you for staying connected. Here's our latest update!</p><p>Best regards,<br>Your Team</p>`;

//       await sendMail(subscriber.email, subject, text, html);
//       console.log(`Email sent to: ${subscriber.email}`); // Debug log
//     } catch (error) {
//       console.error(`Error sending email to ${subscriber.email}:`, error); // Debug log
//     }
//   });

//   return Promise.all(emailPromises);
// }

async function sendBulkEmails(subscribers) {
  const validSubscribers = subscribers.filter((subscriber) => {
    if (!subscriber.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subscriber.email)) {
      console.warn(`Skipping invalid or missing email for subscriber: ${subscriber.name}`);
      return false;
    }
    return true;
  });

  if (validSubscribers.length === 0) {
    console.log("No valid subscribers found.");
    return;
  }

  const emailPromises = validSubscribers.map(async (subscriber) => {
    try {
      const subject = "Newsletter Update";
      const text = `Hi ${subscriber.name},\n\nThank you for staying connected. Here's our latest update!\n\nBest regards,\nYour Team`;
      const html = `<p>Hi <b>${subscriber.name}</b>,</p><p>Thank you for staying connected. Here's our latest update!</p><p>Best regards,<br>Your Team</p>`;

      await sendMail(subscriber.email, subject, text, html);
      console.log(`Email sent to: ${subscriber.email}`);
    } catch (error) {
      console.error(`Error sending email to ${subscriber.email}:`, error);
    }
  });

  return Promise.all(emailPromises);
}


module.exports = { sendMail, sendBulkEmails };