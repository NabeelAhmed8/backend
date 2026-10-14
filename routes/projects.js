import express from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project.js';

const router = express.Router();

/**
 * GET /api/projects
 * Returns all portfolio projects strictly from MongoDB
 */
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database service is currently unavailable.',
      });
    }

    const { category, featured } = req.query;
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
  } catch (error) {
    console.error('[PROJECTS GET ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve project archive from database.',
    });
  }
});

/**
 * GET /api/projects/:id
 * Returns a single project by id strictly from MongoDB
 */
router.get('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database service is currently unavailable.',
      });
    }

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
  } catch (error) {
    console.error('[PROJECT GET BY ID ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve project details from database.',
    });
  }
});

/**
 * POST /api/projects
 * Adds a new project strictly into MongoDB
 */
router.post('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database service is currently unavailable.',
      });
    }

    const { title, category, description, stack, liveUrl, githubUrl, featured, year } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required.',
      });
    }

    const count = await Project.countDocuments();
    const nextId = String(count + 1).padStart(2, '0');

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

    return res.status(201).json({
      success: true,
      source: 'mongodb',
      message: 'Project registered successfully in MongoDB.',
      data: newProject,
    });
  } catch (error) {
    console.error('[PROJECT CREATE ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add project to database archive.',
    });
  }
});

/**
 * PUT /api/projects/:id
 * Updates an existing project strictly in MongoDB
 */
router.put('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database service is currently unavailable.',
      });
    }

    const { id } = req.params;
    const updates = req.body;

    const updated = await Project.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, error: `Project ${id} not found in database.` });
    }

    return res.json({
      success: true,
      source: 'mongodb',
      message: `Project ${id} updated successfully in MongoDB.`,
      data: updated,
    });
  } catch (error) {
    console.error('[PROJECT UPDATE ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update project in database.',
    });
  }
});

export default router;
