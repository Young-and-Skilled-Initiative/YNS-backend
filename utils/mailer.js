const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Email transporter

const transporter = nodemailer.createTransport({
    service: 'smtp.gmail.com',
    port: 465,
    secure: false,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
    debug: true,
    logger: true
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
const sendMail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};

module.exports = { sendMail };