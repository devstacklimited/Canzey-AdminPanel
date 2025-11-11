-- ============================================
-- CANZEY ADMIN PANEL - DATABASE SETUP
-- ============================================
-- Works for both local development and production
-- ============================================

USE canzey_dashboard;

-- ============================================
-- USERS TABLE - Enhanced with Approval System
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  approved_by INT NULL,
  approved_at TIMESTAMP NULL
);

-- ============================================
-- ADMIN USER CREATION
-- ============================================
-- Admin user will be created automatically by the Node.js server
-- This ensures proper password hashing with bcrypt
-- Email: admin@canzey.com
-- Password: 123456
-- Role: admin

SELECT '✅ Database setup complete!' AS Status;

-- ============================================
-- SESSIONS TABLE (Optional - for session management)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token(255)),
  INDEX idx_user_id (user_id)
);

-- ============================================
-- PRODUCTS TABLE (For T-Shirt Management)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  stock INT DEFAULT 0,
  image_url VARCHAR(500),
  rating DECIMAL(3, 2) DEFAULT 0.00,
  sales INT DEFAULT 0,
  raffle_tickets INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sku (sku),
  INDEX idx_category (category)
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_avatar VARCHAR(500),
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  tracking_number VARCHAR(100),
  raffle_tickets INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_number (order_number),
  INDEX idx_status (status),
  INDEX idx_customer_email (customer_email)
);

-- ============================================
-- ORDER_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id)
);

-- ============================================
-- RAFFLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS raffles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  prize VARCHAR(255),
  ticket_price DECIMAL(10, 2) NOT NULL,
  total_tickets INT NOT NULL,
  tickets_sold INT DEFAULT 0,
  status ENUM('active', 'ended', 'cancelled') DEFAULT 'active',
  draw_date TIMESTAMP,
  winner_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

-- ============================================
-- RAFFLE_TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS raffle_tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  raffle_id INT NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  ticket_count INT NOT NULL,
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'won', 'lost') DEFAULT 'active',
  FOREIGN KEY (raffle_id) REFERENCES raffles(id) ON DELETE CASCADE,
  INDEX idx_raffle_id (raffle_id),
  INDEX idx_customer_email (customer_email)
);

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Note: Run the Node.js server to create the admin user through the API
-- This ensures the password is properly hashed

SELECT 'Database setup complete!' AS Status;
