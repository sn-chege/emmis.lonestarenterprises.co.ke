# EMMIS Database Setup Guide

This directory contains the MySQL database schema for the Equipment Maintenance Management Information System (EMMIS).

## Quick Setup

### Option 1: Single Command (Recommended)

Run the consolidated SQL script that creates the database and all tables:

\`\`\`bash
mysql -u root -p < scripts/01-create-database.sql
\`\`\`

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Go to File → Open SQL Script
4. Select `scripts/01-create-database.sql`
5. Click the Execute button (⚡)

### Option 3: Using phpMyAdmin (XAMPP/WAMP)

1. Open phpMyAdmin in your browser
2. Click on "Import" tab
3. Choose file: `scripts/01-create-database.sql`
4. Click "Go" button

## Database Structure

The script creates the following tables:

1. **users** - System users (admin, supervisor, technician)
2. **customers** - Customer/client information
3. **assets** - Equipment and asset tracking
4. **repair_history** - Asset repair records
5. **work_orders** - Service and repair work orders
6. **consumable_parts** - Parts used in work orders
7. **maintenance_schedules** - Scheduled maintenance tasks
8. **maintenance_parts** - Parts used in maintenance
9. **maintenance_templates** - Reusable maintenance procedures
10. **leases** - Equipment lease agreements
11. **lease_payments** - Lease payment tracking
12. **reports** - Generated system reports
13. **system_settings** - Application configuration

## Default Credentials

After running the script, you can login with:

- **Email:** admin45@emmis.com
- **Password:** qwertyhudra45678911
- **Role:** Administrator

⚠️ **Important:** Change the default password after first login!

## Connection Configuration

Update your `.env.local` file with your MySQL credentials:

\`\`\`env
DATABASE_URL=mysql://username:password@localhost:3306/emmis_db
\`\`\`

Replace:
- `username` with your MySQL username (usually `root`)
- `password` with your MySQL password
- `localhost` with your MySQL host if different
- `3306` with your MySQL port if different

## Troubleshooting

### Error: Access denied for user

Make sure you're using the correct MySQL username and password:

\`\`\`bash
mysql -u root -p
# Enter your password when prompted
\`\`\`

### Error: Database already exists

If you need to recreate the database, first drop it:

\`\`\`sql
DROP DATABASE IF EXISTS emmis_db;
\`\`\`

Then run the script again.

### Error: Table already exists

The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times. Existing tables won't be affected.

## Backup and Restore

### Create Backup

\`\`\`bash
mysqldump -u root -p emmis_db > backup_emmis_$(date +%Y%m%d).sql
\`\`\`

### Restore from Backup

\`\`\`bash
mysql -u root -p emmis_db < backup_emmis_20240215.sql
\`\`\`

## Need Help?

- Check MySQL is running: `sudo service mysql status` (Linux) or check Services (Windows)
- Verify connection: `mysql -u root -p`
- Check MySQL error logs for detailed error messages
