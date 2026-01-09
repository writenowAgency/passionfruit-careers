import pool from './config';

async function inspectAndClean() {
  const client = await pool.connect();
  try {
    console.log('--- Current Employers ---');
    const employers = await client.query('SELECT id, company_name FROM employer_profiles');
    console.table(employers.rows);

    console.log('\n--- Current Jobs ---');
    const jobs = await client.query(`
      SELECT j.id, j.title, e.company_name 
      FROM jobs j 
      JOIN employer_profiles e ON j.employer_id = e.id
    `);
    console.table(jobs.rows);

    console.log('\n--- Cleaning Up ---');
    // Delete by Company Name
    const res1 = await client.query(`
      DELETE FROM employer_profiles 
      WHERE company_name ILIKE '%Passion%' 
         OR company_name ILIKE '%CapeTech%'
         OR company_name = 'Passionfruit Careers';
    `);
    console.log(`Deleted ${res1.rowCount} employers matching 'Passion%' or 'CapeTech'`);

    // Delete by Job Title (if they persisted somehow)
    const res2 = await client.query(`
      DELETE FROM jobs 
      WHERE title = 'Senior React Native Engineer' 
         OR title = 'AI Product Manager';
    `);
    console.log(`Deleted ${res2.rowCount} jobs by specific dummy titles`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
  }
}

inspectAndClean();
