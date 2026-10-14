import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Auto-seeds initial data from JSON files if database collections are empty
 */
async function autoSeedDatabase() {
  try {
    const { default: Project } = await import('../models/Project.js');
    const { default: Skill } = await import('../models/Skill.js');
    const { default: Experience } = await import('../models/Experience.js');

    // 1. Projects seed check
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      try {
        const raw = await fs.readFile(path.join(__dirname, '../data/projects.json'), 'utf-8');
        const projects = JSON.parse(raw);
        if (projects.length > 0) {
          await Project.insertMany(projects);
          console.log(`[MONGODB SEED] Seeded ${projects.length} initial projects.`);
        }
      } catch (e) {
        console.warn('[MONGODB SEED NOTICE] Could not seed projects:', e.message);
      }
    }

    // 2. Skills seed check
    const skillCount = await Skill.countDocuments();
    if (skillCount === 0) {
      try {
        const raw = await fs.readFile(path.join(__dirname, '../data/skills.json'), 'utf-8');
        const skills = JSON.parse(raw);
        if (skills.length > 0) {
          await Skill.insertMany(skills);
          console.log(`[MONGODB SEED] Seeded ${skills.length} initial skills.`);
        }
      } catch (e) {
        console.warn('[MONGODB SEED NOTICE] Could not seed skills:', e.message);
      }
    }

    // 3. Experience seed check
    const expCount = await Experience.countDocuments();
    if (expCount === 0) {
      try {
        const raw = await fs.readFile(path.join(__dirname, '../data/experience.json'), 'utf-8');
        const experiences = JSON.parse(raw);
        if (experiences.length > 0) {
          await Experience.insertMany(experiences);
          console.log(`[MONGODB SEED] Seeded ${experiences.length} initial experience logs.`);
        }
      } catch (e) {
        console.warn('[MONGODB SEED NOTICE] Could not seed experience:', e.message);
      }
    }
  } catch (err) {
    console.error('[MONGODB SEED ERROR]', err.message);
  }
}

/**
 * Connect to MongoDB database
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MONGODB CONNECTED] Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
    await autoSeedDatabase();
  } catch (error) {
    console.error('[MONGODB CONNECTION ERROR]', error.message);
    console.error('[MONGODB] Could not connect to database. Ensure MongoDB service is running.');
  }
}

export default connectDB;

