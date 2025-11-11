#!/bin/bash

# Fix sample data files to include deleted_at column
cd db_backups

# Fix customers
sed -i '' 's/NOW(), NOW());/NOW(), NOW(), NULL);/g' insert_customers.sql

# Fix assets  
sed -i '' 's/NOW(), NOW());/NOW(), NOW(), NULL);/g' insert_assets.sql

# Fix leases
sed -i '' 's/NOW(), NOW());/NOW(), NOW(), NULL);/g' insert_leases.sql

# Fix maintenance_schedules
sed -i '' 's/NOW(), NOW());/NOW(), NOW(), NULL);/g' insert_maintenance_schedules.sql

# Fix users (already has deleted_at in schema)
sed -i '' 's/NULL, NOW(), NOW());/NULL, NOW(), NOW(), NULL);/g' insert_users.sql

echo "Sample data files fixed for soft delete compatibility"