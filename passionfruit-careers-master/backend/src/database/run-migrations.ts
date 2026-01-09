import { runJobCategoryMigration } from './add-job-category-column';
import { addNotificationPreferences } from './add-notification-preferences';
import { addCreditsSystem } from './add-credits-system';
import { addTeamManagement } from './add-team-management';

export const runMigrations = async () => {
  console.log('Running database migrations...');
  try {
    await runJobCategoryMigration();
    await addNotificationPreferences();
    await addCreditsSystem();
    await addTeamManagement();
    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration runner failed:', error);
  }
};
