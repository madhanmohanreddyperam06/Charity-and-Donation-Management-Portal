-- Charity & Donation Management Portal Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Donor', 'NGO', 'Admin') NOT NULL,
    contact_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ngo_id INT NOT NULL,
    donation_type ENUM('food', 'funds', 'clothes', 'education', 'medical', 'shelter', 'toys', 'books', 'electronics', 'other') NOT NULL,
    quantity_or_amount DECIMAL(10,2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    pickup_date_time DATETIME NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    description TEXT,
    images TEXT,
    ngo_name VARCHAR(255),
    ngo_email VARCHAR(255),
    contact_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL,
    donor_id INT NOT NULL,
    contribution_amount DECIMAL(10,2) NOT NULL,
    contribution_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Confirmed', 'Completed') DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (name, email, password, role, contact_info) VALUES
('Admin User', 'admin@example.com', '$2b$10$rQ8QW8QW8QW8QW8QW8QW8O', 'Admin', '555-0100'),
('Helping Hands NGO', 'ngo@example.com', '$2b$10$rQ8QW8QW8QW8QW8QW8QW8O', 'NGO', '555-0123'),
('John Donor', 'donor@example.com', '$2b$10$rQ8QW8QW8QW8QW8QW8QW8O', 'Donor', '555-0145');

-- Insert sample donation
INSERT INTO donations (ngo_id, donation_type, quantity_or_amount, location, pickup_date_time, description, ngo_name, ngo_email, contact_info) VALUES
(2, 'food', 100.00, 'New York', '2024-01-15 10:00:00', 'Food items for homeless shelter', 'Helping Hands NGO', 'ngo@example.com', '555-0123');
