const pool = require('./dist/database/config').default;

async function verifyJobs() {
  console.log('\n=== Verifying Jobs from Database ===\n');

  try {
    const result = await pool.query(`
      SELECT
        j.id,
        j.title,
        j.status,
        j.location,
        e.company_name,
        e.id as employer_id
      FROM jobs j
      JOIN employer_profiles e ON j.employer_id = e.id
      ORDER BY j.created_at DESC
      LIMIT 20
    `);

    if (result.rows.length === 0) {
      console.log('❌ No jobs found in database!');
    } else {
      console.log(`✅ Found ${result.rows.length} jobs in database:\n`);
      result.rows.forEach((job, index) => {
        console.log(`${index + 1}. [${job.status.toUpperCase()}] ${job.title}`);
        console.log(`   Company: ${job.company_name}`);
        console.log(`   Location: ${job.location || 'Not specified'}`);
        console.log(`   Job ID: ${job.id}, Employer ID: ${job.employer_id}\n`);
      });
    }

    // Check published jobs specifically
    const publishedResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM jobs
      WHERE status = 'published'
    `);

    console.log(`📊 Published jobs (visible to job seekers): ${publishedResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error querying database:', error.message);
  } finally {
    await pool.end();
  }
}

verifyJobs();
