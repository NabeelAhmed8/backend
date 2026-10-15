import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contactRouter from './routes/contact.js';
import projectsRouter from './routes/projects.js';
import skillsRouter from './routes/skills.js';
import experienceRouter from './routes/experience.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman) or matching client
    if (!origin || origin === CLIENT_URL || origin.startsWith('http://localhost:') || origin.endsWith('github.io')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for production cross-origin
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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

// ==========================================
// ROUTES
// ==========================================

// Health Check (support both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    mode: 'DIRECT_EMAIL_DISPATCH',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'Nabeel Ahmed Dhillon — Portfolio Backend',
  });
});

// Mount Resource Routes (both /api/xxx and /xxx for robust routing)
app.use('/api/contact', contactRouter);
app.use('/contact', contactRouter);

app.use('/api/projects', projectsRouter);
app.use('/projects', projectsRouter);

app.use('/api/skills', skillsRouter);
app.use('/skills', skillsRouter);

app.use('/api/experience', experienceRouter);
app.use('/experience', experienceRouter);

// Root Endpoint (support both / and /api)
app.get(['/', '/api'], (req, res) => {
  res.json({
    message: 'NABEEL DHILLON // PORTFOLIO API SERVER',
    status: 'OPERATIONAL',
    mode: 'DIRECT_EMAIL_DISPATCH',
    receiver: process.env.NOTIFICATION_RECEIVER || 'nabeelprojects@hotmail.com',
    endpoints: {
      health: 'GET /api/health',
      contact: 'POST /api/contact',
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
    console.log('====================================================');
  });
}

export default app;
