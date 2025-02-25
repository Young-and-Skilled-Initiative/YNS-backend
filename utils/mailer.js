const nodemailer = require('nodemailer');
const path = require("path");
const dotenv = require('dotenv');
dotenv.config();


// EMAIL TRANSPORTER
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


// TRANSPORTER VERIFICATION
transporter.verify((error, success) => {
    if (error) {
      console.error('Error verifying transporter:', error);
    } else {
      console.log('Transporter is ready:', success);
    }
  });


// TO GENERATE UNSUBSCRIPTION LINK
const generateUnsubscribeLink = (email) => {
  const unsubscribeToken = encodeURIComponent(email);
  return `http://your-website.com/unsubscribe?email=${unsubscribeToken}`;
};



// FUNCTION TO SEND EMAIL
/**
 * Send an email.
 * @param {string} recipient - Recipient's email.
 * @param {string} subject - Email subject.
 * @param {string} htmlContent - Email content.
 * @param {string} [attachmentPath] - Optional attachment.
 */
const sendMail = async ({ recipient, subject, htmlContent, attachmentPath }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject,
      html: htmlContent,
    };

    if (attachmentPath) {
      mailOptions.attachments = [{ filename: path.basename(attachmentPath), path: attachmentPath }];
    }

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipient}`);
  } catch (error) {
    console.error(`Error sending email to ${recipient}:`, error);
  }
};

module.exports = sendMail;