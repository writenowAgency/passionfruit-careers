import pool from './config';

async function migrateEmployer() {
  const client = await pool.connect();

  try {
    console.log('Starting employer database migration...');

    // 1. Add role column to users table
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='users' AND column_name='role'
        ) THEN
          ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'jobSeeker';
        END IF;
      END $$;
    `);
    console.log('✓ Added role column to users table');

    // 2. Create employer_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employer_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        company_name VARCHAR(255) NOT NULL,
        company_description TEXT,
        company_logo_url TEXT,
        company_website VARCHAR(255),
        company_size VARCHAR(50),
        industry VARCHAR(100),
        location VARCHAR(255),
        phone VARCHAR(50),
        tax_id VARCHAR(100),
        credits_balance INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Employer profiles table created');

    // 3. Create jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        employer_id INTEGER REFERENCES employer_profiles(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        location VARCHAR(255),
        job_type VARCHAR(50),
        salary_min DECIMAL(12,2),
        salary_max DECIMAL(12,2),
        salary_currency VARCHAR(10) DEFAULT 'USD',
        experience_level VARCHAR(50),
        status VARCHAR(50) DEFAULT 'draft',
        views_count INTEGER DEFAULT 0,
        applications_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Jobs table created');

    // 4. Create job_skills table (many-to-many)
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_skills (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        skill_name VARCHAR(100) NOT NULL,
        is_required BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Job skills table created');

    // 5. Create applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        applicant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        cover_letter TEXT,
        resume_url TEXT,
        match_score DECIMAL(5,2),
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        notes TEXT,
        UNIQUE(job_id, applicant_id)
      );
    `);
    console.log('✓ Applications table created');

    // 6. Create job_seeker_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_seeker_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        headline VARCHAR(255),
        bio TEXT,
        location VARCHAR(255),
        phone VARCHAR(50),
        linkedin_url VARCHAR(255),
        portfolio_url VARCHAR(255),
        resume_url TEXT,
        years_of_experience INTEGER,
        desired_salary_min DECIMAL(12,2),
        desired_salary_max DECIMAL(12,2),
        salary_currency VARCHAR(10) DEFAULT 'USD',
        is_open_to_work BOOLEAN DEFAULT TRUE,
        profile_completion_percentage INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Job seeker profiles table created');

    // 7. Create job_seeker_skills table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_seeker_skills (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
        skill_name VARCHAR(100) NOT NULL,
        proficiency_level VARCHAR(50),
        years_experience INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Job seeker skills table created');

    // 8. Create job_seeker_experience table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_seeker_experience (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL,
        job_title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE,
        is_current BOOLEAN DEFAULT FALSE,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Job seeker experience table created');

    // 9. Create job_seeker_education table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_seeker_education (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
        institution_name VARCHAR(255) NOT NULL,
        degree VARCHAR(255) NOT NULL,
        field_of_study VARCHAR(255),
        start_date DATE NOT NULL,
        end_date DATE,
        grade VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Job seeker education table created');

    // 10. Create credits_transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS credits_transactions (
        id SERIAL PRIMARY KEY,
        employer_id INTEGER REFERENCES employer_profiles(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        description TEXT,
        balance_after INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Credits transactions table created');

    // 11. Create saved_jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, job_id)
      );
    `);
    console.log('✓ Saved jobs table created');

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
      CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
      CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    `);
    console.log('✓ Indexes created');

    console.log('\n✅ Employer migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateEmployer();
