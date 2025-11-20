-- Fix demo users for login
DELETE FROM users WHERE id IN ('USR001', 'USR002', 'USR003');

INSERT INTO `users` (
  `id`, 
  `email`, 
  `password_hash`, 
  `name`, 
  `role`, 
  `avatar`, 
  `phone`, 
  `department`, 
  `status`, 
  `last_login`, 
  `specialization`, 
  `experience`, 
  `supervisor_id`, 
  `supervisor_name`, 
  `hire_date`, 
  `created_date`, 
  `updated_date`, 
  `deleted_at`
) VALUES
('USR001', 'admin45@emmis.com', '$2a$10$nyaFDBxkGIeGWZSpaf8h8eZZQMlRUa/SaKjZeLSJK.JU5LyjSI2zi', 'System Administrator', 'admin', NULL, '+254700123456', 'IT Department', 'active', '2025-01-15 08:30:00.000', 'System Administration', 8, NULL, NULL, '2020-03-15', '2025-01-01 00:00:00.000', '2025-01-15 08:30:00.000', NULL),
('USR002', 'supervisor@emmis.com', '$2a$10$nyaFDBxkGIeGWZSpaf8h8eZZQMlRUa/SaKjZeLSJK.JU5LyjSI2zi', 'John Supervisor', 'supervisor', NULL, '+254712345678', 'Operations', 'active', NULL, NULL, 0, NULL, NULL, '2020-01-01', '2025-10-27 14:34:26.721', '2025-10-27 14:34:26.721', NULL),
('USR003', 'technician@emmis.com', '$2a$10$nyaFDBxkGIeGWZSpaf8h8eZZQMlRUa/SaKjZeLSJK.JU5LyjSI2zi', 'Mike Technician', 'technician', NULL, '+254787654321', 'Field Service', 'active', NULL, 'Equipment Maintenance', 2, 'USR002', 'John Supervisor', '2023-01-15', '2025-10-27 14:34:26.721', '2025-10-27 14:34:26.721', NULL);