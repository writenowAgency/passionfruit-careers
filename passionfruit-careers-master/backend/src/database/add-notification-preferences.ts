import pool from './config';

export async function addNotificationPreferences() {
  try {
    console.log('Starting migration: Add notification_preferences to employer_profiles table...');

    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'employer_profiles'
      AND column_name = 'notification_preferences'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('notification_preferences column already exists, skipping migration');
      return;
    }

    // Add notification_preferences column as JSONB
    await pool.query(`
      ALTER TABLE employer_profiles
      ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT NULL
    `);

    console.log('Notification preferences migration completed successfully!');
  } catch (error) {
    console.error('Notification preferences migration error:', error);
    throw error;
  }
}
