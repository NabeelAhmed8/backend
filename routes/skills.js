import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillsFilePath = path.join(__dirname, '../data/skills.json');

router.get('/', async (req, res) => {
  try {
    const raw = await fs.readFile(skillsFilePath, 'utf-8');
    const skills = JSON.parse(raw);
    return res.json({
      success: true,
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
