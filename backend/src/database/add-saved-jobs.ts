import pool from './config';

export const createSavedJobsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS saved_jobs (
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, job_id)
    );
  `;

  try {
    await pool.query(query);
    console.log('Saved jobs table created successfully');
  } catch (error) {
    console.error('Error creating saved_jobs table:', error);
    throw error;
  }
};
