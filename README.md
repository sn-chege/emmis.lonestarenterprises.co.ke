# EMMIS - Equipment Maintenance Management Information System

A comprehensive backend system for managing and maintaining equipment, customers, assets, work orders, and more.

## Backend Features

✅ **Database Integration**
- Prisma ORM with MySQL database
- Complete schema matching existing SQL structure
- Type-safe database operations

✅ **API Endpoints**
- RESTful API for all entities
- CRUD operations for users, customers, assets, work orders, maintenance
- Authentication endpoints

✅ **Migration System**
- Systematic database migrations
- Rollback capabilities
- Migration status tracking

## Quick Start

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Database Setup
Ensure your MySQL database is running and update `.env.local`:
```env
DATABASE_URL="mysql://appuser:wolverine89@localhost:3306/emmis_db"
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Push Schema to Database
```bash
npm run db:push
```

### 5. Seed Database
```bash
npm run db:seed
```

### 6. Start Development Server
```bash
npm run dev
```

## Migration Commands

### Create New Migration
```bash
tsx scripts/migrate.ts create migration_name
```

### Apply Migrations
```bash
tsx scripts/migrate.ts apply
```

### Rollback Migration
```bash
tsx scripts/migrate.ts rollback
```

### Check Migration Status
```bash
tsx scripts/migrate.ts status
```

### Seed Database
```bash
tsx scripts/migrate.ts seed
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer by ID
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Assets
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create asset
- `GET /api/assets/[id]` - Get asset by ID
- `PUT /api/assets/[id]` - Update asset
- `DELETE /api/assets/[id]` - Delete asset

### Work Orders
- `GET /api/work-orders` - Get all work orders
- `POST /api/work-orders` - Create work order
- `GET /api/work-orders/[id]` - Get work order by ID
- `PUT /api/work-orders/[id]` - Update work order
- `DELETE /api/work-orders/[id]` - Delete work order

### Maintenance
- `GET /api/maintenance` - Get all maintenance schedules
- `POST /api/maintenance` - Create maintenance schedule
- `GET /api/maintenance/[id]` - Get maintenance by ID
- `PUT /api/maintenance/[id]` - Update maintenance
- `DELETE /api/maintenance/[id]` - Delete maintenance

## Default Admin Credentials
- Email: `admin45@emmis.com`
- Password: `qwertyhudra45678911`

## Frontend Integration

Use the API client in your components:

```typescript
import { api } from '@/lib/api'

// Get all customers
const customers = await api.getCustomers()

// Create new user
const user = await api.createUser({
  id: 'USR002',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'technician'
})

// Login
const result = await api.login('admin45@emmis.com', 'qwertyhudra45678911')
```

## Database Schema

The system includes the following entities:
- Users (with role-based access)
- Customers (with contract and payment tracking)
- Assets (equipment with maintenance history)
- Work Orders (with consumable parts)
- Maintenance Schedules (with parts tracking)
- Leases (with payment history)
- Reports
- System Settings

All relationships are properly defined with foreign keys and cascading deletes where appropriate.

## cPanel CI/CD Deployment

After each automated deployment, you need to run these commands on the server to fix Prisma client compatibility:

```bash
cp -r .prisma/* node_modules/.prisma/
cp -r @prisma/* node_modules/@prisma/
```

This is required because CloudLinux NodeJS Selector manages `node_modules` separately from the deployment process.