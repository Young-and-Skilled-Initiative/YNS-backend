const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Email transporter

const transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    auth: {
      user: 'postmaster@sandbox47388fd5397c4b28b87890145604b111.mailgun.org',
      pass: '98733d63dc0f94c2c9214aba0276577e-7113c52e-93acf438',
    },
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