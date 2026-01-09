#!/bin/bash

echo "🗄️  Importing database to Railway PostgreSQL..."
echo ""

# Create a temporary SQL file with all commands
cat > /tmp/railway_import.sql << 'EOF'
-- Drop and recreate schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Import the cleaned dump
\i /home/julius/Downloads/passionfruit-careers-master/writenow_db_dump_clean.sql

-- Verify import
\dt
EOF

echo "Connecting to Railway PostgreSQL and importing..."
railway connect postgres < /tmp/railway_import.sql

echo ""
echo "✅ Database import complete!"
echo ""
echo "Verify the import:"
echo "  railway connect postgres"
echo "  Then run: SELECT COUNT(*) FROM users;"
