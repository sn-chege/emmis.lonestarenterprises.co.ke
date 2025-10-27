# EMMIS Database Setup Guide

## MySQL Database Configuration

This application uses MySQL as the primary database. Follow these steps to set up your database:

### 1. Prerequisites
- MySQL 8.0 or higher installed
- MySQL client or MySQL Workbench

### 2. Database Creation

Run the SQL scripts in the `scripts/` folder in numerical order:

\`\`\`bash
mysql -u root -p < scripts/01-create-database.sql
\`\`\`

Or run all at once:
\`\`\`bash
cat scripts/*.sql | mysql -u root -p
\`\`\`

### 3. Environment Variables

Create a `.env.local` file in the root directory with your MySQL connection details:

\`\`\`env
DATABASE_URL="mysql://username:password@localhost:3306/emmis_db"
\`\`\`

Replace:
- `username` with your MySQL username
- `password` with your MySQL password
- `localhost` with your MySQL host (if different)
- `3306` with your MySQL port (if different)

### 4. Database Schema Overview

The database includes the following tables:

- **users** - System users with role-based access
- **customers** - Customer/client information
- **assets** - Equipment and asset tracking
- **repair_history** - Asset repair records
- **work_orders** - Service and repair work orders
- **consumable_parts** - Parts used in work orders
- **maintenance_records** - Maintenance scheduling and tracking
- **maintenance_parts** - Parts used in maintenance
- **maintenance_templates** - Reusable maintenance templates
- **template_checklist** - Checklist items for templates
- **leases** - Lease agreements and contracts
- **reports** - Generated reports metadata

### 5. Fallback Mode

The application automatically falls back to localStorage if the database connection is unavailable. This allows you to:

- Test the application without a database
- Continue working during database maintenance
- Use the app in offline mode

All data operations will automatically use localStorage when the database is not connected.

### 6. Connecting to the Database

To connect the application to MySQL, you'll need to:

1. Install MySQL client library:
   \`\`\`bash
   npm install mysql2
   \`\`\`

2. Create database connection utilities in `lib/db.ts`

3. Update API routes to use the database instead of localStorage

The application is currently configured to work with mock data. Database integration can be added by implementing the connection layer in the `lib/` directory.
