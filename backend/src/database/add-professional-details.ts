import pool from './config';

async function addProfessionalDetails() {
  const client = await pool.connect();

  try {
    console.log('Adding professional details tables (Certifications, Languages, Career Objectives)...\n');

    // 1. Create job_seeker_certifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_seeker_certifications (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
        certification_name VARCHAR(255) NOT NULL,
        issuing_organization VARCHAR(255) NOT NULL,
        issue_date DATE NOT NULL,
        expiry_date DATE,
        credential_id VARCHAR(255),
        credential_url TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ job_seeker_certifications table created');

    // 2. Create job_seeker_languages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_seeker_languages (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
        language_name VARCHAR(100) NOT NULL,
        proficiency_level VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(profile_id, language_name)
      );
    `);
    console.log('✓ job_seeker_languages table created');

    // 3. Add career_objectives column to job_seeker_profiles table
    await client.query(`
      ALTER TABLE job_seeker_profiles
      ADD COLUMN IF NOT EXISTS career_objectives TEXT;
    `);
    console.log('✓ career_objectives column added to job_seeker_profiles');

    // 4. Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_certifications_profile_id
      ON job_seeker_certifications(profile_id);
    `);
    console.log('✓ Index created on certifications.profile_id');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_languages_profile_id
      ON job_seeker_languages(profile_id);
    `);
    console.log('✓ Index created on languages.profile_id');

    console.log('\n✅ Professional details migration completed successfully!');
    console.log('\nAdded tables:');
    console.log('  - job_seeker_certifications (certification name, issuing org, dates, credentials)');
    console.log('  - job_seeker_languages (language name, proficiency level)');
    console.log('  - career_objectives (text field in job_seeker_profiles)');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addProfessionalDetails();
