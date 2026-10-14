import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

const isSmtpConfigured =
  Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // port 587 uses STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
  });
}

/**
 * Sends notification email for new contact form submissions
 * @param {Object} data - Contact message data
 * @param {string} data.name - Sender name
 * @param {string} data.email - Sender email
 * @param {string} data.message - Message content
 */
export async function sendContactNotification({ name, email, message }) {
  const receiver = process.env.NOTIFICATION_RECEIVER || 'nabeelprojects@hotmail.com';

  if (!isSmtpConfigured || !transporter) {
    console.log('[MAILER - SIMULATION MODE] New message received:');
    console.log(`From: ${name} <${email}>`);
    console.log(`To: ${receiver}`);
    console.log(`Message: ${message}`);
    return {
      success: true,
      mode: 'simulation',
      note: 'SMTP not configured in .env; message logged and persisted to MongoDB database',
    };
  }

  const mailOptions = {
    from: `"Portfolio Dispatch" <${process.env.SMTP_USER}>`,
    to: receiver,
    replyTo: email,
    subject: `[Portfolio Dispatch] New Message from ${name}`,
    text: `You received a new inquiry from your portfolio website:

Name: ${name}
Email: ${email}
Timestamp: ${new Date().toISOString()}

Message:
${message}
`,
    html: `
      <div style="font-family: monospace, sans-serif; background-color: #000; color: #fff; padding: 24px; border: 2px solid #fff;">
        <h2 style="color: #fff; border-bottom: 2px solid #fff; padding-bottom: 12px; margin-top: 0;">NEW PORTFOLIO DISPATCH</h2>
        <p><strong>From:</strong> ${name} &lt;<a href="mailto:${email}" style="color: #fff;">${email}</a>&gt;</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <div style="border: 1px solid #444; padding: 16px; background-color: #111; margin-top: 16px;">
          <p style="white-space: pre-wrap; margin: 0; color: #eee;">${message}</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[MAILER] Email dispatched successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[MAILER ERROR] Failed to send email notification:', error);
    // Return gracefully so user form doesn't fail if SMTP server is down
    return { success: false, error: error.message };
  }
}

