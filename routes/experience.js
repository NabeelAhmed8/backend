import express from 'express';
import mongoose from 'mongoose';
import Experience from '../models/Experience.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database service is currently unavailable.',
      });
    }

    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    const experiences = await Experience.find(filter).sort({ id: 1 }).lean();
    return res.json({
      success: true,
      source: 'mongodb',
      count: experiences.length,
      data: experiences,
    });
  } catch (error) {
    console.error('[EXPERIENCE GET ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve experience logbook from database.',
    });
  }
});

export default router;
