import pool from './config';

async function addPreferences() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Add preferences columns to job_seeker_profiles
    console.log('Adding preferences columns to job_seeker_profiles...');
    await client.query(`
      ALTER TABLE job_seeker_profiles
      ADD COLUMN IF NOT EXISTS preferred_work_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS availability_start_date DATE,
      ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS job_alerts_enabled BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS application_updates_enabled BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS marketing_emails_enabled BOOLEAN DEFAULT FALSE;
    `);

    // Create job categories table (reference data)
    console.log('Creating job_categories table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_categories (
        id SERIAL PRIMARY KEY,
        category_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create job_seeker_preferred_categories junction table
    console.log('Creating job_seeker_preferred_categories table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_seeker_preferred_categories (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER NOT NULL REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
        category_id INTEGER NOT NULL REFERENCES job_categories(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(profile_id, category_id)
      );
    `);

    // Create indexes
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_preferred_categories_profile
      ON job_seeker_preferred_categories(profile_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_preferred_categories_category
      ON job_seeker_preferred_categories(category_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_profiles_work_type
      ON job_seeker_profiles(preferred_work_type);
    `);

    // Insert default job categories
    console.log('Inserting default job categories...');
    const categories = [
      ['Software Development', 'Software engineering, programming, and development roles'],
      ['Data Science & Analytics', 'Data analysis, data science, and business intelligence'],
      ['Product Management', 'Product management and strategy roles'],
      ['Design', 'UI/UX design, graphic design, and creative roles'],
      ['Marketing', 'Digital marketing, content marketing, and growth'],
      ['Sales', 'Sales, business development, and account management'],
      ['Customer Support', 'Customer service and support roles'],
      ['Human Resources', 'HR, recruitment, and people operations'],
      ['Finance & Accounting', 'Accounting, finance, and financial analysis'],
      ['Operations', 'Operations, logistics, and supply chain management'],
      ['Engineering', 'Hardware, mechanical, civil, and other engineering'],
      ['Healthcare', 'Medical, nursing, and healthcare services'],
      ['Education & Training', 'Teaching, training, and educational services'],
      ['Legal', 'Legal counsel, paralegal, and compliance'],
      ['Consulting', 'Management consulting and advisory services'],
      ['Project Management', 'Project and program management'],
      ['Quality Assurance', 'QA, testing, and quality control'],
      ['DevOps & Infrastructure', 'DevOps, cloud infrastructure, and SRE'],
      ['Security', 'Cybersecurity, information security, and risk management'],
      ['Research & Development', 'R&D, innovation, and scientific research'],
    ];

    for (const [name, description] of categories) {
      await client.query(
        `INSERT INTO job_categories (category_name, description)
         VALUES ($1, $2)
         ON CONFLICT (category_name) DO NOTHING`,
        [name, description]
      );
    }

    await client.query('COMMIT');
    console.log('✓ Preferences migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addPreferences().catch(console.error);
