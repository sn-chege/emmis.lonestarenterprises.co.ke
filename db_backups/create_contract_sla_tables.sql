-- Create contract_templates table
CREATE TABLE IF NOT EXISTS contract_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'CUSTOM',
    size VARCHAR(50),
    version VARCHAR(20) DEFAULT '1.0',
    author VARCHAR(255) DEFAULT 'System',
    tags TEXT,
    elements LONGTEXT,
    folder_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    INDEX idx_name (name),
    INDEX idx_type (type),
    INDEX idx_status (status)
);

-- Create sla_templates table
CREATE TABLE IF NOT EXISTS sla_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id VARCHAR(50),
    customer_name VARCHAR(255),
    service_level VARCHAR(50) NOT NULL,
    response_time VARCHAR(100) NOT NULL,
    resolution_time VARCHAR(100) NOT NULL,
    availability VARCHAR(100) NOT NULL,
    penalties TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    terms LONGTEXT,
    folder_path VARCHAR(500),
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    INDEX idx_name (name),
    INDEX idx_service_level (service_level),
    INDEX idx_status (status),
    INDEX idx_customer_id (customer_id)
);