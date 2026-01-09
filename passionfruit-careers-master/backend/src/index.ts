import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import employerRoutes from './routes/employer';
import jobSeekerRoutes from './routes/jobSeeker';
import jobsRoutes from './routes/jobs';
import pool from './database/config';
import { runMigrations } from './database/run-migrations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files (for local storage)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WriteNow API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/job-seeker', jobSeekerRoutes);
app.use('/api/jobs', jobsRoutes);

// Test database connection and run migrations
pool.query('SELECT NOW()', async (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✓ Database connected at:', res.rows[0].now);
    // Run migrations after successful connection
    await runMigrations();
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   - GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`   - GET  http://localhost:${PORT}/api/profile`);
  console.log(`   - PUT  http://localhost:${PORT}/api/profile/personal`);
  console.log(`   - POST http://localhost:${PORT}/api/profile/skills`);
  console.log(`   - POST http://localhost:${PORT}/api/profile/experience`);
  console.log(`   - POST http://localhost:${PORT}/api/profile/education`);
  console.log(`   - POST http://localhost:${PORT}/api/profile/photo`);
  console.log(`   - POST http://localhost:${PORT}/api/profile/document\n`);
});

export default app;
