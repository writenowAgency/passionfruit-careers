const pool = require('./dist/database/config').default;

async function checkJobFields() {
  console.log('\n=== Checking Job Type and Experience Level Values ===\n');

  try {
    const jobTypesResult = await pool.query(`
      SELECT DISTINCT job_type
      FROM jobs
      WHERE status = 'published' AND job_type IS NOT NULL
      ORDER BY job_type
    `);

    const expLevelsResult = await pool.query(`
      SELECT DISTINCT experience_level
      FROM jobs
      WHERE status = 'published' AND experience_level IS NOT NULL
      ORDER BY experience_level
    `);

    console.log('Job Types in database:');
    jobTypesResult.rows.forEach(row => {
      console.log(`  - "${row.job_type}"`);
    });

    console.log('\nExperience Levels in database:');
    expLevelsResult.rows.forEach(row => {
      console.log(`  - "${row.experience_level}"`);
    });

    // Also show sample jobs with their types and levels
    const sampleResult = await pool.query(`
      SELECT id, title, job_type, experience_level
      FROM jobs
      WHERE status = 'published'
      LIMIT 5
    `);

    console.log('\nSample jobs:');
    sampleResult.rows.forEach(row => {
      console.log(`  ${row.id}. ${row.title}`);
      console.log(`     Type: ${row.job_type || 'NULL'}`);
      console.log(`     Level: ${row.experience_level || 'NULL'}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkJobFields();
