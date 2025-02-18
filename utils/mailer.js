const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const Subscriber = require('../models/subscribermodel');
const SentMail = require('../models/sentMailModel');
const MovementSubscriber = require("../models/joinMovementModel");
// const { isUtf8 } = require('buffer');


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


// FUNCTION TO LOAD TEMPLATE
// function loadTemplate (templateName, placeholders) {

//   const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
//   const templateSource = fs.readFileSync(templatePath, 'utf8');
//   const template = handlebars.compile(templateSource);

//   // To replace placeholders with actual values
//   Object.keys(placeholders).forEach((key) => {
//     const regex = new RegExp(`{{${key}}}`, 'g'); 
//     template = template.replace(regex, placeholders[key]);
//   });

//   return template;
// }


// FUNCTION TO SEND EMAIL
const sendMail = async ({recipient = Subscriber.email, subject, htmlContent}) => {

  // const emailBody = loadTemplate(templateName, placeholders);

  if (!recipient) {
    console.error("Recipient email is required!");
    throw new Error("Recipient email is required!");
  }

  const mailOptions = {
      from:  process.env.PARTNER_EMAIL,
      to: recipient,
      subject,
      html: htmlContent,
  }

  try {
    await transporter.sendMail(mailOptions);

    // Log the sent email into the database
    const sentMail = new SentMail({
      recipient,
      subject,
      html: htmlContent,
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
      htmlContent,
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

};


// FUNCTION TO SEND BULK MAILS
const sendBulkMails = async (subscribers, subject, htmlContent) => {
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

      // const personalizedPlaceholders = { ...placeholders, subscriberName: subscriber.name, subscriberEmail: subscriber.email };

      // console.log("Sending email to:", subscriber.email);
      // console.log("Subject:", subject);
      // console.log("Personalized Placeholders:", personalizedPlaceholders);


      await sendMail({
        recipient: subscriber.email,
        subject,
        htmlContent
      });

    } catch (error) {
      console.error(`Error sending email to ${subscriber.email}:`, error);
    }
  });

  await Promise.all(emailPromises);
  
  return { success: true, message: "Bulk emails processed successfully." };
};


// Function to send an email with an attachment
const sendMailWithAttachment = async ({  recipient, subject, templateName, placeholders, attachmentPath }) => {
  const attachments = attachmentPath
    ? [{ filename: path.basename(attachmentPath), path: attachmentPath }]
    : [];

  return sendMail({ recipient, subject, templateName, placeholders, attachments });
};


// FUNCTION TO SEND BULK EMAILS WITH ATTACHMENTS
const sendBulkMailsWithAttachment = async (MovementSubscriber, subject, templateName, placeholders, attachmentPath) => {
  const validSubscribers = MovementSubscriber.filter(subscriber => subscriber.email);

  if (validSubscribers.length === 0) {
    console.log("No valid movement subscribers found.");
    return { success: false, message: "No valid movement subscribers found." };
  }

  const emailPromises = validSubscribers.map(async (subscriber) => {
    try {
      
      
      const personalizedPlaceholders = { ...placeholders, MovementSubscriberName: MovementSubscriber.name };

      await sendMailWithAttachment({
        recipient: subscriber.email,
        subject,
        templateName,
        placeholders: personalizedPlaceholders,
        attachmentPath,
      });

      console.log(`Email sent to ${MovementSubscriber.email}`);
    } catch (error) {
      console.error(`Error sending email to ${MovementSubscriber.email}:`, error);
    }
  });

  await Promise.all(emailPromises);
  return { success: true, message: "Emails with attachments sent successfully." };
};


module.exports = { sendMail, sendBulkMails, sendMailWithAttachment, sendBulkMailsWithAttachment };