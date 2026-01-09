import pool from './config';

async function deleteDummyJobs() {
  const client = await pool.connect();
  try {
    console.log('Attempting to delete dummy "PassionFruit Tech" employers and jobs...');

    // Delete from employer_profiles. 
    // This will CASCADE delete linked jobs because of the foreign key constraint.
    const deleteResult = await client.query(
      `DELETE FROM employer_profiles 
       WHERE company_name ILIKE '%PassionFruit%' 
          OR company_name ILIKE '%CapeTech%' 
          OR company_name ILIKE '%Passion Fruit%';`
    );

    console.log(`✓ Successfully deleted ${deleteResult.rowCount} dummy employer profiles (and their jobs).`);

  } catch (error) {
    console.error('❌ Failed to delete dummy data:', error);
    throw error;
  } finally {
    client.release();
  }
}

deleteDummyJobs();
