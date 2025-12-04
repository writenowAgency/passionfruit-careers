import pool from './config';
import bcrypt from 'bcrypt';

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('Starting database migration...');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Create sessions table for tracking active sessions
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Sessions table created');

    // Insert demo credentials
    const demoEmail = 'demo@writenow.com';
    const demoPassword = 'Demo123!';
    const hashedPassword = await bcrypt.hash(demoPassword, 10);

    // Check if demo user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [demoEmail]
    );

    if (existingUser.rows.length === 0) {
      await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4)`,
        [demoEmail, hashedPassword, 'Demo', 'User']
      );
      console.log('✓ Demo user created');
      console.log('\nDemo Credentials:');
      console.log('Email:', demoEmail);
      console.log('Password:', demoPassword);
    } else {
      console.log('✓ Demo user already exists');
    }

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
