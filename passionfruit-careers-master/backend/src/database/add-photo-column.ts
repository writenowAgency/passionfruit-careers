import pool from './config';

async function addProfilePhotoColumn() {
  const client = await pool.connect();

  try {
    console.log('Adding profile_photo_url column to job_seeker_profiles table...');

    await client.query(`
      ALTER TABLE job_seeker_profiles
      ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
    `);

    console.log('✓ profile_photo_url column added successfully');

    // Also add column for documents/resume if not exists
    await client.query(`
      ALTER TABLE job_seeker_profiles
      ADD COLUMN IF NOT EXISTS resume_file_url TEXT;
    `);

    console.log('✓ resume_file_url column added successfully');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addProfilePhotoColumn();
