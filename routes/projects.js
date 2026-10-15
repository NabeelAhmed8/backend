import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectsFilePath = path.join(__dirname, '../data/projects.json');

async function getStoredProjects() {
  try {
    const raw = await fs.readFile(projectsFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * GET /api/projects
 * Returns all portfolio projects
 */
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    let projects = await getStoredProjects();

    if (category) {
      projects = projects.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (featured !== undefined) {
      projects = projects.filter((p) => String(p.featured) === String(featured));
    }

    return res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error('[PROJECTS GET ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve project archive.',
    });
  }
});

/**
 * GET /api/projects/:id
 * Returns a single project by id
 */
router.get('/:id', async (req, res) => {
  try {
    const projects = await getStoredProjects();
    const project = projects.find((p) => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: `Project with ID ${req.params.id} not found.`,
      });
    }

    return res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('[PROJECT GET BY ID ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve project.',
    });
  }
});

export default router;
