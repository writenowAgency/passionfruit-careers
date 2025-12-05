import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import pool from './database/config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (for local storage)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WriteNow API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✓ Database connected at:', res.rows[0].now);
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
