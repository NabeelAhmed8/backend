import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const expFilePath = path.join(__dirname, '../data/experience.json');

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const raw = await fs.readFile(expFilePath, 'utf-8');
    let experiences = JSON.parse(raw);

    if (category && category !== 'all') {
      experiences = experiences.filter((exp) => exp.category === category);
    }

    return res.json({
      success: true,
      count: experiences.length,
      data: experiences,
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
