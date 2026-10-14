import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Skill from '../models/Skill.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillsFilePath = path.join(__dirname, '../data/skills.json');

router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const skills = await Skill.find().sort({ code: 1 }).lean();
      return res.json({
        success: true,
        source: 'mongodb',
        count: skills.length,
        data: skills,
      });
    }

    const raw = await fs.readFile(skillsFilePath, 'utf-8');
    const skills = JSON.parse(raw);
    return res.json({
      success: true,
      source: 'json-fallback',
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error('[SKILLS GET ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve skills matrix.',
    });
  }
});

export default router;
