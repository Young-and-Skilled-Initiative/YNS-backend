const NewsletterSubscriber = require("../models/newsletterSubscribermodel");
const NewsletterSend = require("../models/newsletterSendModel");
const sendMail = require("../utils/mailer");
const crypto = require('crypto');

/**
 * Generate unsubscribe token for secure unsubscribe links
 */
const generateUnsubscribeToken = (email) => {
  return crypto.createHash('sha256').update(email + (process.env.UNSUBSCRIBE_SECRET || 'default-secret')).digest('hex');
};

/**
 * Generate the welcome email HTML template with working unsubscribe link
 */
const generateWelcomeEmailTemplate = (name, email) => {
  const unsubscribeToken = generateUnsubscribeToken(email);
  const unsubscribeUrl = `${process.env.BASE_URL || 'https://yourdomain.com'}/api/newsletter/unsubscribe/${unsubscribeToken}`;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Young and Skilled Newsletter</title>
    <style>
        @font-face {
            font-family: 'Cocon';
            src: url('https://res.cloudinary.com/dwjnkuvqv/raw/upload/v1748245946/CoconRegularFont_jevejx.otf') format('opentype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }

        @font-face {
            font-family: 'Manrope';
            src: url('https://res.cloudinary.com/dwjnkuvqv/raw/upload/v1748245947/Manrope-Regular_mjyrxx.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: linear-gradient(135deg, #2d5f4f 0%, #4a8c6f 100%);
            background-image: url('https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748243700/email-bg_qkmzzs.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            color: white;
        }

        .header h1 {
            font-family: 'Cocon', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 28px;
            font-weight: normal;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .star-top {
            position: absolute;
            top: 20px;
            right: 30px;
            width: 40px;
            height: 40px;
            background-image: url('https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748243700/star2_gx3m3s.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }

        .content {
            padding: 40px 30px;
            background-color: white;
            position: relative;
        }

        .thank-you {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
        }

        .welcome-text {
            color: #666;
            margin-bottom: 25px;
            font-size: 14px;
        }

        .benefits-intro {
            color: #333;
            margin-bottom: 15px;
            font-size: 14px;
        }

        .benefits-list {
            list-style: none;
            margin: 20px 0;
        }

        .benefits-list li {
            color: #666;
            margin-bottom: 8px;
            font-size: 14px;
            position: relative;
            padding-left: 25px;
        }

        .benefits-list li:before {
            content: "✅";
            position: absolute;
            left: 0;
            top: 0;
        }

        .exclusive-text {
            color: #666;
            margin: 25px 0;
            font-size: 14px;
        }

        .join-button {
            background: linear-gradient(135deg, #2d5f4f 0%, #4a8c6f 100%);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin: 25px 0;
            text-decoration: none;
            display: inline-block;
            text-align: center;
            transition: transform 0.2s ease;
        }

        .join-button:hover {
            transform: translateY(-2px);
        }

        .closing {
            color: #666;
            margin: 25px 0 10px 0;
            font-size: 14px;
        }

        .signature {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }

        .logo {
            margin: 30px 0;
        }

        .logo img {
            height: 40px;
        }

        .social-icons {
            display: flex;
            gap: 15px;
            margin: 30px 0;
        }

        .social-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            overflow: hidden;
        }

        .social-icon img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .social-icon.twitter {
            background-color: #1DA1F2;
            color: white;
            font-weight: bold;
            font-size: 18px;
        }

        .unsubscribe {
            color: #999;
            font-size: 12px;
            margin: 20px 0 10px 0;
        }

        .unsubscribe a {
            color: #ffa500;
            text-decoration: none;
        }

        .copyright {
            color: #999;
            font-size: 12px;
            margin-bottom: 20px;
        }

        .star-bottom {
            position: absolute;
            bottom: 30px;
            right: 30px;
            width: 30px;
            height: 30px;
            background-image: url('https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748243700/star2_gx3m3s.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }

        .star-middle {
            position: absolute;
            top: 50%;
            right: 50px;
            transform: translateY(-50%);
            width: 25px;
            height: 25px;
            background-image: url('https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748243700/star-green_u7diff.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            z-index: 1;
        }

        /* Hide green star on mobile */
        @media (max-width: 768px) {
            .star-middle {
                display: none;
            }
        }

        .footer {
            position: relative;
            padding-bottom: 60px;
        }
        .name{
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="star-top"></div>
            <h1>Welcome to the Young and<br>Skilled Newsletter!</h1>
        </div>
        
        <div class="content">
            <div class="bird-decoration"></div>
            
            <h2 class="thank-you">Thank you for subscribing to the Young and Skilled Initiative! 🎉</h2>
            
            <p class="welcome-text">Welcome <span class='name'>${name}</span>!</p>
            
            <p class="benefits-intro">You're officially part of our journey to empower young professionals to learn, grow, and connect.</p>
            
            <p class="benefits-intro">Here's what you can look forward to:</p>
            
            <ul class="benefits-list">
                <li>Fresh tips on skill development</li>
                <li>Updates on mentorship programs and networking opportunities</li>
                <li>Insightful stories and resources to help you thrive</li>
            </ul>
            
            <p class="exclusive-text">If you'd like to join our growing community and get access to even more exclusive resources, events, and mentorship opportunities, just click below!</p>
            
            <a href="#" class="join-button">Join Community</a>
            
            <p class="closing">Can't wait to see what you'll achieve next!</p>
            <p class="signature">Cheers,<br>The Young and Skilled Initiative Team</p>
            
            <div class="logo">
                <img src="https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748244988/logo_bydem0.png" alt="Young & Skilled Logo">
            </div>
            
            <div class="social-icons">
                <a href="https://www.facebook.com/profile.php?id=61563309331437&mibextid=LQQJ4d&mibextid=LQQJ4d" class="social-icon">
                    <img src="https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748244987/Facebook_hckslw.png" alt="Facebook">
                </a>
                <a href="https://www.linkedin.com/company/young-and-skilled-initiative/" class="social-icon">
                    <img src="https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748244988/Linkedin_fbhbqj.png" alt="LinkedIn">
                </a>
                <a href="https://www.instagram.com/ysinitiative?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" class="social-icon">
                    <img src="https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748244988/Instagram_jj5rv6.png" alt="Instagram">
                </a>
            </div>
            
            <div class="footer">
                <p class="unsubscribe">Don't want to receive these emails anymore? <a href="${unsubscribeUrl}">Unsubscribe here</a></p>
                <p class="copyright">Copyright © ${new Date().getFullYear()} Young & Skilled Initiative</p>
                <div class="star-bottom"></div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Generate the bulk newsletter HTML template with working unsubscribe link
 */
const generateBulkNewsletterTemplate = (headerText, bodyText, subText, email) => {
  const unsubscribeToken = generateUnsubscribeToken(email);
  const unsubscribeUrl = `${process.env.BASE_URL || 'https://yourdomain.com'}/api/newsletter/unsubscribe/${unsubscribeToken}`;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Young and Skilled Newsletter</title>
    <style>
        @font-face {
            font-family: 'Cocon';
            src: url('https://res.cloudinary.com/dwjnkuvqv/raw/upload/v1748245946/CoconRegularFont_jevejx.otf') format('opentype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }

        @font-face {
            font-family: 'Manrope';
            src: url('https://res.cloudinary.com/dwjnkuvqv/raw/upload/v1748245947/Manrope-Regular_mjyrxx.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: linear-gradient(135deg, #2d5f4f 0%, #4a8c6f 100%);
            background-image: url('https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748243700/email-bg_qkmzzs.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            color: white;
        }

        .header h1 {
            font-family: 'Cocon', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 28px;
            font-weight: normal;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .star-top {
            position: absolute;
            top: 20px;
            right: 30px;
            width: 40px;
            height: 40px;
            background-image: url('https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748243700/star2_gx3m3s.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }

        .content {
            padding: 40px 30px;
            background-color: white;
            position: relative;
        }

        .main-content {
            color: #333;
            font-size: 16px;
            margin-bottom: 25px;
            line-height: 1.6;
        }

        .body-text {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
            line-height: 1.6;
        }

        .sub-text {
            color: #666;
            font-size: 14px;
            margin-bottom: 25px;
            line-height: 1.6;
        }

        .closing {
            color: #666;
            margin: 25px 0 10px 0;
            font-size: 14px;
        }

        .signature {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }

        .logo {
            margin: 30px 0;
            text-align: center;
        }

        .logo img {
            height: 40px;
        }

        .social-icons {
            display: flex;
            gap: 15px;
            margin: 30px 0;
            justify-content: center;
        }

        .social-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            overflow: hidden;
        }

        .social-icon img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .unsubscribe {
            color: #999;
            font-size: 12px;
            margin: 20px 0 10px 0;
            text-align: center;
        }

        .unsubscribe a {
            color: #ffa500;
            text-decoration: none;
        }

        .copyright {
            color: #999;
            font-size: 12px;
            margin-bottom: 20px;
            text-align: center;
        }

        .star-bottom {
            position: absolute;
            bottom: 30px;
            right: 30px;
            width: 30px;
            height: 30px;
            background-image: url('https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748243700/star2_gx3m3s.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }

        .footer {
            position: relative;
            padding-bottom: 60px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="star-top"></div>
            <h1>${headerText}</h1>
        </div>
        
        <div class="content">
            <div class="main-content">${bodyText}</div>
            <div class="sub-text">${subText}</div>
            
            <p class="closing">Keep growing and stay skilled!</p>
            <p class="signature">Best regards,<br>The Young and Skilled Initiative Team</p>
            
            <div class="logo">
                <img src="https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748244988/logo_bydem0.png" alt="Young & Skilled Logo">
            </div>
            
            <div class="social-icons">
                <a href="https://www.facebook.com/profile.php?id=61563309331437&mibextid=LQQJ4d&mibextid=LQQJ4d" class="social-icon">
                    <img src="https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748244987/Facebook_hckslw.png" alt="Facebook">
                </a>
                <a href="https://www.linkedin.com/company/young-and-skilled-initiative/" class="social-icon">
                    <img src="https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748244988/Linkedin_fbhbqj.png" alt="LinkedIn">
                </a>
                <a href="https://www.instagram.com/ysinitiative?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" class="social-icon">
                    <img src="https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748244988/Instagram_jj5rv6.png" alt="Instagram">
                </a>
            </div>
            
            <div class="footer">
                <p class="unsubscribe">Don't want to receive these emails anymore? <a href="${unsubscribeUrl}">Unsubscribe here</a></p>
                <p class="copyright">Copyright © ${new Date().getFullYear()} Young & Skilled Initiative</p>
                <div class="star-bottom"></div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Subscribe to the newsletter with unsubscribe token generation
 */
const subscribeToNewsletter = async (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }
  
  try {
    const existingSubscriber = await NewsletterSubscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(409).json({ message: "Already subscribed." });
    }
    
    // Generate unsubscribe token
    const unsubscribeToken = generateUnsubscribeToken(email);
    
    // Create new subscriber with token
    const newSubscriber = new NewsletterSubscriber({ 
      name, 
      email,
      unsubscribeToken 
    });
    await newSubscriber.save();

    // Use the professional HTML template with working unsubscribe link
    const htmlContent = generateWelcomeEmailTemplate(name, email);

    await sendMail({ 
        recipient: email, 
        subject: "Welcome to Young and Skilled Initiative! 🎉", 
        htmlContent 
    });
    
    res.status(201).json({ message: "Subscribed successfully." });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({ message: "Error subscribing", error: error.message });
  }
};

/**
 * Send bulk newsletters to all subscribers with personalized unsubscribe links
 */
const sendBulkNewsletter = async (req, res) => {
  const { subject, headerText, bodyText, subText } = req.body;
  
  // Validate required fields
  if (!subject || !headerText || !bodyText) {
    return res.status(400).json({ 
      message: "Subject, header text, and body text are required" 
    });
  }

  try {
    // Fetch all active subscribers
    const subscribers = await NewsletterSubscriber.find({ 
      $or: [
        { unsubscribed: { $exists: false } },
        { unsubscribed: false }
      ]
    });

    if (subscribers.length === 0) {
      return res.status(404).json({ message: "No active subscribers found." });
    }

    // Send personalized emails to all subscribers
    for (const subscriber of subscribers) {
      // Generate personalized HTML content with unique unsubscribe link
      const htmlContent = generateBulkNewsletterTemplate(
        headerText, 
        bodyText, 
        subText || '', 
        subscriber.email
      );
      
      await sendMail({
        recipient: subscriber.email,
        subject,
        htmlContent,
      });
    }

    // Track this newsletter send in database
    const newsletterSend = new NewsletterSend({
      subject,
      headerText,
      bodyText,
      subText: subText || '',
      recipientCount: subscribers.length,
      sentAt: new Date()
    });
    await newsletterSend.save();

    res.status(200).json({ 
      message: `Newsletter sent successfully to ${subscribers.length} subscribers.`,
      subscriberCount: subscribers.length
    });
  } catch (error) {
    console.error("Error sending bulk newsletter:", error);
    res.status(500).json({ message: "Error sending newsletter.", error: error.message });
  }
};

/**
 * Unsubscribe from newsletter via token (GET request from email link)
 */
const unsubscribeViaToken = async (req, res) => {
  const { token } = req.params;
  
  if (!token) {
    return res.status(400).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2>Invalid Unsubscribe Link</h2>
          <p>This unsubscribe link is not valid.</p>
        </body>
      </html>
    `);
  }
  
  try {
    const subscriber = await NewsletterSubscriber.findOne({ 
      unsubscribeToken: token
    });
    
    if (!subscriber) {
      return res.status(404).send(`
        <html>
          <head>
            <title>Invalid Unsubscribe Link</title>
            <style>
              body { 
                font-family: 'Manrope', Arial, sans-serif; 
                text-align: center; 
                padding: 50px; 
                background-color: #f5f5f5; 
              }
              .container { 
                max-width: 500px; 
                margin: 0 auto; 
                background: white; 
                padding: 40px; 
                border-radius: 10px; 
                box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
              }
              h2 { color: #d32f2f; margin-bottom: 20px; }
              p { color: #666; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>❌ Invalid Unsubscribe Link</h2>
              <p>This unsubscribe link is not valid or has expired.</p>
              <p>If you continue to receive emails, please contact our support team.</p>
            </div>
          </body>
        </html>
      `);
    }
    
    if (subscriber.unsubscribed) {
      return res.status(200).send(`
        <html>
          <head>
            <title>Already Unsubscribed</title>
            <style>
              body { 
                font-family: 'Manrope', Arial, sans-serif; 
                text-align: center; 
                padding: 50px; 
                background-color: #f5f5f5; 
              }
              .container { 
                max-width: 500px; 
                margin: 0 auto; 
                background: white; 
                padding: 40px; 
                border-radius: 10px; 
                box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
              }
              h2 { color: #2d5f4f; margin-bottom: 20px; }
              p { color: #666; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>ℹ️ Already Unsubscribed</h2>
              <p>You have already been removed from the Young & Skilled Initiative newsletter.</p>
              <p>You should not receive any further emails from us.</p>
            </div>
          </body>
        </html>
      `);
    }
    
    // Update subscriber status
    await NewsletterSubscriber.updateOne(
      { _id: subscriber._id }, 
      { 
        unsubscribed: true, 
        unsubscribedAt: new Date() 
      }
    );
    
    // Render beautiful success page
    res.status(200).send(`
      <html>
        <head>
          <title>Unsubscribed Successfully</title>
          <style>
            body { 
              font-family: 'Manrope', Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: linear-gradient(135deg, #f5f5f5 0%, #e8f5e8 100%);
              margin: 0;
            }
            .container { 
              max-width: 500px; 
              margin: 0 auto; 
              background: white; 
              padding: 40px; 
              border-radius: 15px; 
              box-shadow: 0 8px 25px rgba(0,0,0,0.1); 
            }
            h2 { 
              color: #2d5f4f; 
              margin-bottom: 20px; 
              font-size: 24px;
            }
            p { 
              color: #666; 
              line-height: 1.6; 
              margin-bottom: 15px;
            }
            .logo {
              margin: 20px 0;
            }
            .logo img {
              height: 50px;
            }
            .success-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h2>Successfully Unsubscribed</h2>
            <p>You have been removed from the Young & Skilled Initiative newsletter.</p>
            <p>We're sorry to see you go! If you change your mind, you can always subscribe again on our website.</p>
            <div class="logo">
              <img src="https://res.cloudinary.com/dwjnkuvqv/image/upload/v1748244988/logo_bydem0.png" alt="Young & Skilled Logo">
            </div>
            <p style="font-size: 12px; color: #999;">Thank you for being part of our community.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error unsubscribing via token:", error);
    res.status(500).send(`
      <html>
        <head>
          <title>Error</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background-color: #f5f5f5; 
            }
            .container { 
              max-width: 500px; 
              margin: 0 auto; 
              background: white; 
              padding: 40px; 
              border-radius: 10px; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            }
            h2 { color: #d32f2f; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>⚠️ Error</h2>
            <p>There was an error processing your unsubscribe request.</p>
            <p>Please try again later or contact our support team.</p>
          </div>
        </body>
      </html>
    `);
  }
};

/**
 * Manual unsubscribe via API (POST request)
 */
const unsubscribeFromNewsletter = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  
  try {
    const subscriber = await NewsletterSubscriber.findOne({ email });
    
    if (!subscriber) {
      return res.status(404).json({ message: "Email not found in our records" });
    }
    
    if (subscriber.unsubscribed) {
      return res.status(409).json({ message: "Already unsubscribed" });
    }
    
    // Update subscriber status
    await NewsletterSubscriber.updateOne(
      { email }, 
      { 
        unsubscribed: true, 
        unsubscribedAt: new Date() 
      }
    );
    
    res.status(200).json({ message: "Successfully unsubscribed from newsletter" });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    res.status(500).json({ message: "Error unsubscribing", error: error.message });
  }
};

/**
 * Get comprehensive newsletter statistics for CMS dashboard
 */
const getNewsletterStats = async (req, res) => {
  try {
    // Get total active subscribers
    const subscriberCount = await NewsletterSubscriber.countDocuments({ 
      $or: [
        { unsubscribed: { $exists: false } },
        { unsubscribed: false }
      ]
    });

    // Get total unsubscribed count
    const unsubscribedCount = await NewsletterSubscriber.countDocuments({ 
      unsubscribed: true 
    });

    // Get total subscriber count (active + unsubscribed)
    const totalSubscribers = await NewsletterSubscriber.countDocuments({});

    // Get the last newsletter send date
    const lastSend = await NewsletterSend.findOne().sort({ createdAt: -1 });
    let lastSent = "Never";
    
    if (lastSend) {
      const lastSendDate = new Date(lastSend.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - lastSendDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) {
        lastSent = "Today";
      } else if (diffDays === 1) {
        lastSent = "1 day ago";
      } else if (diffDays < 7) {
        lastSent = `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        lastSent = weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
      } else {
        const months = Math.floor(diffDays / 30);
        lastSent = months === 1 ? "1 month ago" : `${months} months ago`;
      }
    }

    // Get emails sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const emailsSentToday = await NewsletterSend.aggregate([
      {
        $match: {
          createdAt: {
            $gte: today,
            $lt: tomorrow
          }
        }
      },
      {
        $group: {
          _id: null,
          totalEmails: { $sum: "$recipientCount" }
        }
      }
    ]);

    const emailsSentTodayCount = emailsSentToday.length > 0 ? emailsSentToday[0].totalEmails : 0;

    // Calculate unsubscribe rate
    const unsubscribeRate = totalSubscribers > 0 ? ((unsubscribedCount / totalSubscribers) * 100).toFixed(2) : 0;

    // Get newsletter send history (last 5)
    const recentSends = await NewsletterSend.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('subject recipientCount sentAt createdAt');

    res.status(200).json({
      subscriberCount,
      unsubscribedCount,
      totalSubscribers,
      unsubscribeRate: `${unsubscribeRate}%`,
      lastSent,
      emailsSentToday: emailsSentTodayCount,
      recentSends: recentSends.map(send => ({
        subject: send.subject,
        recipientCount: send.recipientCount,
        sentAt: send.sentAt || send.createdAt,
        date: send.createdAt
      }))
    });

  } catch (error) {
    console.error("Error fetching newsletter stats:", error);
    res.status(500).json({ 
      message: "Error fetching stats", 
      error: error.message 
    });
  }
};

/**
 * Get list of all subscribers (with pagination and filtering)
 */
const getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 50, status = 'all' } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter based on status
    let filter = {};
    if (status === 'active') {
      filter = { 
        $or: [
          { unsubscribed: { $exists: false } },
          { unsubscribed: false }
        ]
      };
    } else if (status === 'unsubscribed') {
      filter = { unsubscribed: true };
    }

    // Get subscribers with pagination
    const subscribers = await NewsletterSubscriber.find(filter)
      .select('name email unsubscribed createdAt unsubscribedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    // Get total count for pagination
    const totalCount = await NewsletterSubscriber.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNumber);

    res.status(200).json({
      subscribers: subscribers.map(sub => ({
        id: sub._id,
        name: sub.name,
        email: sub.email,
        status: sub.unsubscribed ? 'unsubscribed' : 'active',
        subscribedAt: sub.createdAt,
        unsubscribedAt: sub.unsubscribedAt || null
      })),
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalCount,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1
      }
    });

  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ 
      message: "Error fetching subscribers", 
      error: error.message 
    });
  }
};

module.exports = { 
  subscribeToNewsletter, 
  sendBulkNewsletter, 
  getNewsletterStats,
  unsubscribeViaToken,
  unsubscribeFromNewsletter,
  getSubscribers
};