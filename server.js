import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import contactRouter from './routes/contact.js';
import projectsRouter from './routes/projects.js';
import skillsRouter from './routes/skills.js';
import experienceRouter from './routes/experience.js';

dotenv.config();

// Connect to MongoDB
connectDB().catch((err) => console.error('[INIT DB NOTICE]', err.message));

const app = express();
const PORT = process.env.PORT || 5005;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman) or matching client
      if (!origin || origin === CLIENT_URL || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request Logger (Brutalist Console Output)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API ${req.method}] ${req.originalUrl} — ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Ensure MongoDB connection in Serverless environments (cold start resilience)
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (_) {}
  }
  next();
});

// ==========================================
// ROUTES
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1
      ? 'MONGODB_CONNECTED'
      : dbState === 2
      ? 'MONGODB_CONNECTING'
      : 'MONGODB_DISCONNECTED';

  res.json({
    status: dbState === 1 ? 'OPERATIONAL' : 'DEGRADED',
    database: dbStatus,
    dbHost: mongoose.connection.host || 'local',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'Nabeel Ahmed Dhillon — Portfolio Backend',
  });
});

// Mount Resource Routes
app.use('/api/contact', contactRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/experience', experienceRouter);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'NABEEL DHILLON // PORTFOLIO API SERVER',
    database: mongoose.connection.readyState === 1 ? 'MONGODB_CONNECTED' : 'MONGODB_DISCONNECTED',
    endpoints: {
      health: 'GET /api/health',
      contact: 'POST /api/contact',
      messages: 'GET /api/contact/messages',
      projects: 'GET /api/projects',
      skills: 'GET /api/skills',
      experience: 'GET /api/experience',
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error('[UNHANDLED SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ==========================================
// START SERVER (Localhost / Traditional Host)
// ==========================================
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`[SERVER ACTIVE] Running on http://localhost:${PORT}`);
    console.log(`[HEALTH CHECK]  http://localhost:${PORT}/api/health`);
    console.log(`[CLIENT URL]    ${CLIENT_URL}`);
    console.log(`[MONGODB URI]   ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio'}`);
    console.log('====================================================');
  });
}

export default app;
