-- Insert sample contract templates
INSERT INTO contract_templates (id, name, description, type, size, version, author, tags, elements, folder_path, status) VALUES
('TMP001', 'Standard Equipment Lease Agreement', 'Standard lease agreement template for equipment rentals', 'PDF', '245 KB', '1.0', 'System', 'lease,equipment,standard', '[]', 'templates/TMP001', 'active'),
('TMP002', 'Short-term Lease Contract', 'Template for short-term equipment leases (less than 6 months)', 'CUSTOM', '180 KB', '1.0', 'System', 'lease,short-term', '[]', 'templates/TMP002', 'active'),
('TMP003', 'Long-term Lease Agreement', 'Comprehensive template for long-term equipment leases', 'PDF', '320 KB', '1.0', 'System', 'lease,long-term', '[]', 'templates/TMP003', 'active'),
('TMP004', 'Maintenance Service Agreement', 'Service level agreement template for equipment maintenance', 'CUSTOM', '195 KB', '1.0', 'System', 'maintenance,service', '[]', 'templates/TMP004', 'active');
