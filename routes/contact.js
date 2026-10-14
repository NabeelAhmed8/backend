import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendContactNotification } from '../config/mailer.js';
import Message from '../models/Message.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const messagesFilePath = path.join(__dirname, '../data/messages.json');

/**
 * Helper to read existing messages from JSON backup storage
 */
async function getStoredMessages() {
  try {
    const raw = await fs.readFile(messagesFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(messagesFilePath, '[]', 'utf-8');
      return [];
    }
    throw err;
  }
}

/**
 * Helper to save messages to JSON backup storage
 */
async function saveMessages(messages) {
  try {
    await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (err) {
    console.error('[MESSAGES BACKUP ERROR]', err.message);
  }
}

/**
 * POST /api/contact
 * Handles contact form submissions into MongoDB
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

    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || 'Unknown',
      ip: req.ip || req.connection?.remoteAddress || 'Unknown',
    };

    // Store in MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const dbMessage = new Message(messageData);
      await dbMessage.save();
    }

    // Always keep backup JSON file synchronized
    const messages = await getStoredMessages();
    messages.push(messageData);
    await saveMessages(messages);

    // Send email notification (real SMTP or logged simulation)
    const mailResult = await sendContactNotification({
      name: messageData.name,
      email: messageData.email,
      message: messageData.message,
    });

    console.log(`[CONTACT DISPATCH] New message received from ${messageData.name} (${messageData.email})`);

    return res.status(201).json({
      success: true,
      message: 'Transmission received and logged successfully.',
      source: mongoose.connection.readyState === 1 ? 'mongodb' : 'json-backup',
      data: {
        id: messageData.id,
        timestamp: messageData.timestamp,
        mailStatus: mailResult.success ? 'sent' : 'logged',
      },
    });
  } catch (error) {
    console.error('[CONTACT ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error: Failed to process dispatch.',
    });
  }
});

/**
 * GET /api/contact/messages
 * View all received inquiries from MongoDB (or JSON backup)
 */
router.get('/messages', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const messages = await Message.find().sort({ timestamp: -1 }).lean();
      return res.json({
        success: true,
        source: 'mongodb',
        count: messages.length,
        data: messages,
      });
    }

    const messages = await getStoredMessages();
    return res.json({
      success: true,
      source: 'json-fallback',
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('[MESSAGES GET ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve stored transmissions.',
    });
  }
});

export default router;
