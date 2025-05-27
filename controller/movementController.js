const MovementSubscriber = require("../models/joinMovementModel");
const sendMail = require("../utils/mailer");

/**
 * Join the movement.
 */
const joinMovement = async (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }
  
  try {
    const existingSubscriber = await MovementSubscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(409).json({ message: "Already joined." });
    }
    
    const newSubscriber = new MovementSubscriber({ name, email });
    await newSubscriber.save();
    
    // Enhanced HTML email template
    const htmlContent = `
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
            gap: 1em;
            margin: 30px 10px;
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
        
        .name {
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
            
            <h2 class="thank-you">Thank you for applying to join the movement! 🎉</h2>
            
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
                <p class="unsubscribe">Don't want to receive these emails anymore? <a href="#">Unsubscribe here</a></p>
                <p class="copyright">Copyright © ${new Date().getFullYear()} Young & Skilled Initiative</p>
                <div class="star-bottom"></div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
    
    const attachmentPath = "";
    
    await sendMail({
      recipient: email,
      subject: "Thank you for joining the Young and Skilled Movement!",
      htmlContent,
      attachmentPath
    });
    
    res.status(201).json({ message: "Joined successfully." });
  } catch (error) {
    console.error("Error subscribing to the movement:", error.message);
    res.status(500).json({ message: "Error joining", error: error.message });
  }
};

module.exports = { joinMovement };