import express from 'express';
import mongoose from 'mongoose';
import Skill from '../models/Skill.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database service is currently unavailable.',
      });
    }

    const skills = await Skill.find().sort({ code: 1 }).lean();
    return res.json({
      success: true,
      source: 'mongodb',
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error('[SKILLS GET ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve skills matrix from database.',
    });
  }
});

export default router;
