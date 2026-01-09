import pool from './config';

export async function addCreditsSystem() {
  try {
    console.log('Starting migration: Add credits system...');

    // Add credits_balance column to employer_profiles
    const checkBalanceColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'employer_profiles'
      AND column_name = 'credits_balance'
    `);

    if (checkBalanceColumn.rows.length === 0) {
      await pool.query(`
        ALTER TABLE employer_profiles
        ADD COLUMN credits_balance INTEGER DEFAULT 100 NOT NULL
      `);
      console.log('Added credits_balance column to employer_profiles');
    }

    // Create credit_transactions table
    const checkTable = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'credit_transactions'
    `);

    if (checkTable.rows.length === 0) {
      await pool.query(`
        CREATE TABLE credit_transactions (
          id SERIAL PRIMARY KEY,
          employer_id INTEGER NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL CHECK (type IN ('purchase', 'usage', 'refund')),
          description VARCHAR(255) NOT NULL,
          details TEXT,
          amount INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create index for faster queries
      await pool.query(`
        CREATE INDEX idx_credit_transactions_employer_id ON credit_transactions(employer_id);
        CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
      `);

      console.log('Created credit_transactions table with indexes');
    }

    console.log('Credits system migration completed successfully!');
  } catch (error) {
    console.error('Credits system migration error:', error);
    throw error;
  }
}
