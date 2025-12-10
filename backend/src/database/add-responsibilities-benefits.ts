import pool from './config';

/**
 * Migration: Add responsibilities and benefits fields to jobs table
 *
 * Purpose: Allow employers to specify job responsibilities and benefits
 *          Allow job seekers to view this information when browsing/applying
 *
 * Changes:
 * - Add 'responsibilities' TEXT column to jobs table
 * - Add 'benefits' TEXT column to jobs table
 */

async function addResponsibilitiesAndBenefits() {
  const client = await pool.connect();

  try {
    console.log('Starting migration: Add responsibilities and benefits to jobs table...');

    // Start transaction
    await client.query('BEGIN');

    // Check if columns already exist
    const checkColumns = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'jobs'
        AND column_name IN ('responsibilities', 'benefits')
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);

    // Add responsibilities column if it doesn't exist
    if (!existingColumns.includes('responsibilities')) {
      console.log('Adding responsibilities column...');
      await client.query(`
        ALTER TABLE jobs
        ADD COLUMN responsibilities TEXT
      `);
      console.log('✓ responsibilities column added');
    } else {
      console.log('→ responsibilities column already exists, skipping');
    }

    // Add benefits column if it doesn't exist
    if (!existingColumns.includes('benefits')) {
      console.log('Adding benefits column...');
      await client.query(`
        ALTER TABLE jobs
        ADD COLUMN benefits TEXT
      `);
      console.log('✓ benefits column added');
    } else {
      console.log('→ benefits column already exists, skipping');
    }

    // Commit transaction
    await client.query('COMMIT');

    console.log('\n✓ Migration completed successfully!');
    console.log('\nNew schema:');
    console.log('  jobs table now includes:');
    console.log('    - responsibilities (TEXT): Job duties and responsibilities');
    console.log('    - benefits (TEXT): Company benefits and perks');

  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('✗ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
addResponsibilitiesAndBenefits()
  .then(() => {
    console.log('\nMigration script completed. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration script failed:', error);
    process.exit(1);
  });
