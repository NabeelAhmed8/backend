import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Experience from '../models/Experience.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const experienceFilePath = path.join(__dirname, '../data/experience.json');

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    if (mongoose.connection.readyState === 1) {
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
    }

    // JSON fallback
    const raw = await fs.readFile(experienceFilePath, 'utf-8');
    const experiences = JSON.parse(raw);

    let filtered = experiences;
    if (category && category !== 'all') {
      filtered = filtered.filter((exp) => exp.category === category);
    }

    return res.json({
      success: true,
      source: 'json-fallback',
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error('[EXPERIENCE GET ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve experience logbook.',
    });
  }
});

export default router;
