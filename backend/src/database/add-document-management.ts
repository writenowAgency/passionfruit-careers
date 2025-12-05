import pool from './config';

async function addDocumentManagement() {
  const client = await pool.connect();

  try {
    console.log('Starting document management migration...');

    await client.query('BEGIN');

    // Create job_seeker_documents table for comprehensive document management
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_seeker_documents (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(100),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        CONSTRAINT valid_document_type CHECK (document_type IN (
          'cv',
          'cover_letter',
          'id_document',
          'certificate',
          'reference',
          'portfolio'
        ))
      );
    `);

    // Create index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_profile_id
      ON job_seeker_documents(profile_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_type
      ON job_seeker_documents(profile_id, document_type);
    `);

    // Add cover_letter_url column to job_seeker_profiles
    await client.query(`
      ALTER TABLE job_seeker_profiles
      ADD COLUMN IF NOT EXISTS cover_letter_url TEXT;
    `);

    await client.query(`
      ALTER TABLE job_seeker_profiles
      ADD COLUMN IF NOT EXISTS id_document_url TEXT;
    `);

    await client.query(`
      ALTER TABLE job_seeker_profiles
      ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
    `);

    // Link certificates to uploaded files
    await client.query(`
      ALTER TABLE job_seeker_certifications
      ADD COLUMN IF NOT EXISTS certificate_file_url TEXT;
    `);

    await client.query('COMMIT');

    console.log('✅ Document management tables created successfully');
    console.log('✅ Created job_seeker_documents table');
    console.log('✅ Added cover_letter_url, id_document_url, portfolio_url to profiles');
    console.log('✅ Added certificate_file_url to certifications');
    console.log('✅ Created indexes for performance');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addDocumentManagement()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
