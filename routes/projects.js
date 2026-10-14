import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Project from '../models/Project.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectsFilePath = path.join(__dirname, '../data/projects.json');

async function getStoredProjects() {
  try {
    const raw = await fs.readFile(projectsFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(projectsFilePath, '[]', 'utf-8');
      return [];
    }
    throw err;
  }
}

async function saveProjects(projects) {
  try {
    await fs.writeFile(projectsFilePath, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (err) {
    console.error('[BACKUP SAVE ERROR]', err.message);
  }
}

/**
 * GET /api/projects
 * Returns all portfolio projects from MongoDB (or JSON fallback)
 */
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (category) {
        filter.category = new RegExp(`^${category}$`, 'i');
      }
      if (featured !== undefined) {
        filter.featured = featured === 'true';
      }

      const projects = await Project.find(filter).sort({ id: 1 }).lean();
      return res.json({
        success: true,
        source: 'mongodb',
        count: projects.length,
        data: projects,
      });
    }

    // JSON Fallback if MongoDB is offline
    const projects = await getStoredProjects();
    let filtered = projects;

    if (category) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (featured !== undefined) {
      const isFeatured = featured === 'true';
      filtered = filtered.filter((p) => Boolean(p.featured) === isFeatured);
    }

    return res.json({
      success: true,
      source: 'json-fallback',
      count: filtered.length,
      data: filtered,
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
    if (mongoose.connection.readyState === 1) {
      const project = await Project.findOne({ id: req.params.id }).lean();
      if (!project) {
        return res.status(404).json({
          success: false,
          error: `Project with ID ${req.params.id} not found in database.`,
        });
      }
      return res.json({
        success: true,
        source: 'mongodb',
        data: project,
      });
    }

    // Fallback
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
      source: 'json-fallback',
      data: project,
    });
  } catch (error) {
    console.error('[PROJECT GET BY ID ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve project details.',
    });
  }
});

/**
 * POST /api/projects
 * Adds a new project into MongoDB and writes to backup JSON
 */
router.post('/', async (req, res) => {
  try {
    const { title, category, description, stack, liveUrl, githubUrl, featured, year } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required.',
      });
    }

    let nextId = '01';

    if (mongoose.connection.readyState === 1) {
      const count = await Project.countDocuments();
      nextId = String(count + 1).padStart(2, '0');

      const newProject = new Project({
        id: nextId,
        title: title.trim(),
        category: category ? category.trim() : 'Commercial Platform',
        description: description.trim(),
        stack: Array.isArray(stack) ? stack : ['React', 'Tailwind CSS'],
        liveUrl: liveUrl || '#',
        githubUrl: githubUrl || '#',
        featured: featured !== undefined ? Boolean(featured) : true,
        year: year || String(new Date().getFullYear()),
      });

      await newProject.save();

      // Keep backup file in sync
      const stored = await getStoredProjects();
      stored.push(newProject.toObject());
      await saveProjects(stored);

      return res.status(201).json({
        success: true,
        source: 'mongodb',
        message: 'Project registered successfully in MongoDB.',
        data: newProject,
      });
    }

    // JSON file fallback mode
    const projects = await getStoredProjects();
    nextId = String(projects.length + 1).padStart(2, '0');

    const newProject = {
      id: nextId,
      title: title.trim(),
      category: category ? category.trim() : 'Commercial Platform',
      description: description.trim(),
      stack: Array.isArray(stack) ? stack : ['React', 'Tailwind CSS'],
      liveUrl: liveUrl || '#',
      githubUrl: githubUrl || '#',
      featured: featured !== undefined ? Boolean(featured) : true,
      year: year || String(new Date().getFullYear()),
      createdAt: new Date().toISOString(),
    };

    projects.push(newProject);
    await saveProjects(projects);

    return res.status(201).json({
      success: true,
      source: 'json-fallback',
      message: 'Project registered successfully.',
      data: newProject,
    });
  } catch (error) {
    console.error('[PROJECT CREATE ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add project to archive.',
    });
  }
});

/**
 * PUT /api/projects/:id
 * Updates an existing project (e.g., liveUrl, githubUrl, description)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (mongoose.connection.readyState === 1) {
      const updated = await Project.findOneAndUpdate(
        { id },
        { $set: updates },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({ success: false, error: `Project ${id} not found.` });
      }

      // Sync backup JSON
      const stored = await getStoredProjects();
      const idx = stored.findIndex((p) => p.id === id);
      if (idx !== -1) {
        stored[idx] = { ...stored[idx], ...updates };
        await saveProjects(stored);
      }

      return res.json({
        success: true,
        source: 'mongodb',
        message: `Project ${id} updated successfully.`,
        data: updated,
      });
    }

    // JSON fallback
    const stored = await getStoredProjects();
    const idx = stored.findIndex((p) => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: `Project ${id} not found.` });
    }

    stored[idx] = { ...stored[idx], ...updates };
    await saveProjects(stored);

    return res.json({
      success: true,
      source: 'json-fallback',
      message: `Project ${id} updated successfully.`,
      data: stored[idx],
    });
  } catch (error) {
    console.error('[PROJECT UPDATE ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update project.',
    });
  }
});

export default router;
