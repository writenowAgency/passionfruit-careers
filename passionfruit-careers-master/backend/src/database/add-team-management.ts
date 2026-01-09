import pool from './config';

export const addTeamManagement = async () => {
  const client = await pool.connect();
  try {
    console.log('Running team management migration...');

    // Create team members table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employer_team_members (
        id SERIAL PRIMARY KEY,
        employer_id INTEGER REFERENCES employer_profiles(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'viewer',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        joined_at TIMESTAMP,
        last_active_at TIMESTAMP,
        UNIQUE(employer_id, email)
      );
    `);

    console.log('✓ Team members table created');
  } catch (error) {
    console.error('Error in team management migration:', error);
    // Don't throw if it's just that it exists, but create table if not exists handles that.
    // Throwing might stop other migrations if chained poorly, but safe here.
  } finally {
    client.release();
  }
};
