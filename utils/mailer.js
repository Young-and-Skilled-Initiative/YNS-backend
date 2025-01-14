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
const sendMail = async ({from = process.env.PARTNER_EMAIL, to, subject, html,}) => {
  const mailOptions = {
      from,
      to,
      subject,
      html,
  }

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

// sendMail({
//   to: 'dvineonyi@gmail.com',
//   subject: 'Hello this is a test mail',
//   html: 'Hello from Divine',
// }).then((info) => {
//   console.log('Success:', info);
// }).catch((error) => {
//   console.error('Error:', error);
// });

module.exports = { sendMail };