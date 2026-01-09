import pool from './config';

export const runJobCategoryMigration = async () => {
  try {
    console.log('Starting migration: Add category_id to jobs table...');

    // 1. Add category_id column if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'category_id') THEN
          ALTER TABLE jobs ADD COLUMN category_id INTEGER REFERENCES job_categories(id);
          RAISE NOTICE 'Added category_id column to jobs table';
        END IF;
      END $$;
    `);

    // 2. Ensure job_categories are populated (if empty)
    const categoriesCount = await pool.query('SELECT COUNT(*) FROM job_categories');
    if (parseInt(categoriesCount.rows[0].count) === 0) {
      console.log('Populating job_categories...');
      const categories = [
        'Software Development', 'Data Science & Analytics', 'Product Management', 'Design',
        'Marketing', 'Sales', 'Customer Support', 'Human Resources', 'Finance & Accounting',
        'Operations', 'Engineering', 'Healthcare', 'Education & Training', 'Legal',
        'Consulting', 'Project Management', 'Quality Assurance', 'DevOps & Infrastructure',
        'Security', 'Research & Development'
      ];
      
      for (const cat of categories) {
        await pool.query(
          'INSERT INTO job_categories (category_name) VALUES ($1) ON CONFLICT (category_name) DO NOTHING',
          [cat]
        );
      }
    }

    // 3. Assign random categories to existing jobs that have NULL category_id
    // Get all category IDs
    const catResult = await pool.query('SELECT id FROM job_categories');
    const catIds = catResult.rows.map(r => r.id);

    if (catIds.length > 0) {
      // Get jobs with null category_id
      const jobsResult = await pool.query('SELECT id FROM jobs WHERE category_id IS NULL');
      
      if (jobsResult.rows.length > 0) {
        console.log(`Assigning categories to ${jobsResult.rows.length} existing jobs...`);
        for (const job of jobsResult.rows) {
          const randomCatId = catIds[Math.floor(Math.random() * catIds.length)];
          await pool.query('UPDATE jobs SET category_id = $1 WHERE id = $2', [randomCatId, job.id]);
        }
        console.log(`Updated ${jobsResult.rows.length} jobs with random categories.`);
      }
    }

    console.log('Job Category Migration completed successfully!');
  } catch (error) {
    console.error('Job Category Migration failed:', error);
    // Don't exit process here, let the caller handle it
    throw error;
  }
};