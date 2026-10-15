import express from 'express';
import { sendContactNotification } from '../config/mailer.js';

const router = express.Router();

/**
 * POST /api/contact
 * Handles contact form submissions and directly dispatches email to Nabeel
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Strict validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: Name is required and must not be empty.',
      });
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: A valid email address is required.',
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: Message content cannot be empty.',
      });
    }

    // Direct email notification to Nabeel's inbox
    const mailResult = await sendContactNotification({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    console.log(`[CONTACT DISPATCH] Inquiry from ${name} (${email}) — Mail status: ${mailResult.success ? 'SENT' : 'LOGGED'}`);

    return res.status(200).json({
      success: true,
      message: 'Inquiry dispatched successfully to Nabeel Ahmed.',
      data: {
        timestamp: new Date().toISOString(),
        mailStatus: mailResult.success ? 'sent' : 'simulation',
      },
    });
  } catch (error) {
    console.error('[CONTACT ERROR]', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error: Failed to dispatch inquiry.',
    });
  }
});

export default router;
