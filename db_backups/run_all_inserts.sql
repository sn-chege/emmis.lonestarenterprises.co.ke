-- Master script to run all insert files for January 2025 data
-- Run this script to populate the database with fresh January 2025 data

-- Clear existing data (optional - uncomment if you want to start fresh)
DELETE FROM lease_payments;
DELETE FROM maintenance_parts;
DELETE FROM consumable_parts;
DELETE FROM repair_history;
DELETE FROM maintenance_schedules;
DELETE FROM leases;
DELETE FROM work_orders;
DELETE FROM assets;
DELETE FROM customers;
DELETE FROM users;
DELETE FROM reports;
DELETE FROM maintenance_templates;
DELETE FROM system_settings;
DELETE FROM contract_templates;
DELETE FROM sla_templates;

-- Insert fresh data for January 2025
SOURCE create_contract_sla_tables.sql;
SOURCE insert_users.sql;
SOURCE insert_customers.sql;
SOURCE insert_assets.sql;
SOURCE insert_work_orders.sql;
SOURCE insert_maintenance_schedules.sql;
SOURCE insert_leases.sql;
SOURCE insert_consumable_parts.sql;
SOURCE insert_maintenance_parts.sql;
SOURCE insert_lease_payments.sql;
SOURCE insert_repair_history.sql;
SOURCE insert_system_settings.sql;
SOURCE insert_maintenance_templates.sql;
SOURCE insert_reports.sql;
SOURCE insert_contract_templates.sql;
SOURCE insert_sla_templates.sql;

-- Verify data insertion
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Assets', COUNT(*) FROM assets
UNION ALL
SELECT 'Work Orders', COUNT(*) FROM work_orders
UNION ALL
SELECT 'Maintenance Schedules', COUNT(*) FROM maintenance_schedules
UNION ALL
SELECT 'Leases', COUNT(*) FROM leases
UNION ALL
SELECT 'Consumable Parts', COUNT(*) FROM consumable_parts
UNION ALL
SELECT 'Maintenance Parts', COUNT(*) FROM maintenance_parts
UNION ALL
SELECT 'Lease Payments', COUNT(*) FROM lease_payments
UNION ALL
SELECT 'Repair History', COUNT(*) FROM repair_history
UNION ALL
SELECT 'System Settings', COUNT(*) FROM system_settings
UNION ALL
SELECT 'Maintenance Templates', COUNT(*) FROM maintenance_templates
UNION ALL
SELECT 'Reports', COUNT(*) FROM reports
UNION ALL
SELECT 'Contract Templates', COUNT(*) FROM contract_templates
UNION ALL
SELECT 'SLA Templates', COUNT(*) FROM sla_templates;