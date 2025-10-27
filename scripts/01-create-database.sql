-- EMMIS Database Creation Script
-- MySQL Database Schema for Equipment Maintenance Management Information System

CREATE DATABASE IF NOT EXISTS emmis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE emmis_db;

-- Adding all table definitions to consolidated SQL file

-- ============================================================================
-- TABLE 1: USERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'supervisor', 'technician') NOT NULL DEFAULT 'technician',
    avatar VARCHAR(500),
    phone VARCHAR(50),
    department VARCHAR(100),
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    last_login DATETIME,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 2: CUSTOMERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    established VARCHAR(50),
    contact_person VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    location VARCHAR(255),
    status ENUM('Active', 'Inactive', 'Pending', 'Suspended') NOT NULL DEFAULT 'Active',
    contract_status ENUM('Active', 'Expired', 'Renewal Due', 'Pending') NOT NULL DEFAULT 'Pending',
    payment_status ENUM('Current', 'Overdue', 'Pending', 'N/A') NOT NULL DEFAULT 'N/A',
    monthly_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_equipment INT NOT NULL DEFAULT 0,
    contract_expiry DATE,
    equipment_details TEXT,
    technician VARCHAR(255),
    supervisor VARCHAR(255),
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company_name (company_name),
    INDEX idx_status (status),
    INDEX idx_contract_status (contract_status),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 3: ASSETS (EQUIPMENT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(50) PRIMARY KEY,
    make VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100),
    description TEXT,
    customer_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    location VARCHAR(255) NOT NULL,
    location_details TEXT,
    location_type ENUM('fixed', 'mobile') NOT NULL DEFAULT 'fixed',
    condition_status ENUM('new', 'good', 'damaged', 'poor') NOT NULL DEFAULT 'good',
    operational_status ENUM('operational', 'maintenance', 'repair', 'retired') NOT NULL DEFAULT 'operational',
    purchase_date DATE,
    purchase_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    current_value DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    warranty_start DATE,
    warranty_end DATE,
    warranty_provider VARCHAR(255),
    last_service_date DATE,
    next_service_date DATE,
    photo_url VARCHAR(500),
    notes TEXT,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_serial_number (serial_number),
    INDEX idx_customer_id (customer_id),
    INDEX idx_condition (condition_status),
    INDEX idx_status (operational_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 4: REPAIR HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS repair_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(50) NOT NULL,
    repair_date DATE NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    technician VARCHAR(255) NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    INDEX idx_asset_id (asset_id),
    INDEX idx_repair_date (repair_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 5: WORK ORDERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS work_orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    equipment_make VARCHAR(255) NOT NULL,
    equipment_model VARCHAR(255) NOT NULL,
    serial_no VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type ENUM('service', 'repair') NOT NULL,
    service_type ENUM('scheduled', 'unscheduled') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    status ENUM('open', 'assigned', 'in-progress', 'completed', 'cancelled') NOT NULL DEFAULT 'open',
    technician_name VARCHAR(255),
    supervisor_name VARCHAR(255),
    due_date DATE NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_date DATETIME,
    description TEXT NOT NULL,
    fault_description TEXT,
    work_carried_out TEXT,
    page_count INT,
    next_service_date DATE,
    estimated_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    actual_cost DECIMAL(10, 2),
    cancel_reason TEXT,
    updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_type (type),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 6: CONSUMABLE PARTS (for Work Orders)
-- ============================================================================
CREATE TABLE IF NOT EXISTS consumable_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    work_order_id VARCHAR(50) NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 7: MAINTENANCE SCHEDULES
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id VARCHAR(50) PRIMARY KEY,
    equipment_id VARCHAR(50) NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    serial_no VARCHAR(255) NOT NULL,
    customer_id VARCHAR(50),
    customer_name VARCHAR(255),
    type ENUM('service', 'repair', 'preventive', 'emergency') NOT NULL,
    service_type ENUM('scheduled', 'unscheduled') NOT NULL,
    description TEXT NOT NULL,
    fault_description TEXT,
    scheduled_date DATE NOT NULL,
    status ENUM('scheduled', 'in-progress', 'completed', 'overdue', 'cancelled') NOT NULL DEFAULT 'scheduled',
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    technician_id VARCHAR(50),
    technician_name VARCHAR(255),
    page_count INT,
    estimated_duration INT,
    actual_duration INT,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_date DATETIME,
    work_carried_out TEXT,
    notes TEXT,
    updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES assets(id) ON DELETE CASCADE,
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 8: MAINTENANCE PARTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    maintenance_id VARCHAR(50) NOT NULL,
    part_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maintenance_id) REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
    INDEX idx_maintenance_id (maintenance_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 9: MAINTENANCE TEMPLATES
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('service', 'repair', 'preventive', 'emergency') NOT NULL,
    estimated_duration INT NOT NULL,
    checklist TEXT NOT NULL,
    notes TEXT,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 10: LEASES
-- ============================================================================
CREATE TABLE IF NOT EXISTS leases (
    id VARCHAR(50) PRIMARY KEY,
    equipment_name VARCHAR(255) NOT NULL,
    serial_no VARCHAR(255) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_amount DECIMAL(10, 2) NOT NULL,
    payment_frequency ENUM('monthly', 'quarterly', 'annually') NOT NULL DEFAULT 'monthly',
    status ENUM('active', 'pending', 'expired', 'terminated') NOT NULL DEFAULT 'pending',
    payment_status ENUM('current', 'overdue', 'pending') NOT NULL DEFAULT 'pending',
    next_payment_date DATE NOT NULL,
    total_paid DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    remaining_payments INT NOT NULL DEFAULT 0,
    contract_terms TEXT,
    notes TEXT,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_next_payment_date (next_payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 11: LEASE PAYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS lease_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lease_id VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(100),
    reference_number VARCHAR(100),
    notes TEXT,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE,
    INDEX idx_lease_id (lease_id),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 12: REPORTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    generated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    format ENUM('PDF', 'Excel', 'CSV') NOT NULL,
    file_size VARCHAR(50),
    file_path VARCHAR(500),
    status ENUM('completed', 'processing', 'failed') NOT NULL DEFAULT 'processing',
    generated_by VARCHAR(50),
    parameters TEXT,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_generated_date (generated_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 13: SYSTEM SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    updated_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERT DEFAULT ADMIN USER
-- ============================================================================
-- Updated default admin credentials to admin45@emmis.com / qwertyhudra45678911
-- Password: qwertyhudra45678911 (hashed with bcrypt)
INSERT INTO users (id, email, password_hash, name, role, status, created_date) 
VALUES (
    'USR001',
    'admin45@emmis.com',
    '$2a$10$eIXZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'System Administrator',
    'admin',
    'active',
    NOW()
) ON DUPLICATE KEY UPDATE id=id;

-- ============================================================================
-- INSERT DEFAULT SYSTEM SETTINGS
-- ============================================================================
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('app_name', 'EMMIS', 'Application Name'),
('app_version', '1.0.0', 'Application Version'),
('currency', 'KES', 'Default Currency'),
('date_format', 'YYYY-MM-DD', 'Default Date Format'),
('timezone', 'Africa/Nairobi', 'Default Timezone')
ON DUPLICATE KEY UPDATE setting_key=setting_key;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================
