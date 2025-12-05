-- Migration: Add Phone OTP Auth Support
-- Run this on your live database to enable phone authentication

-- 1. Make email nullable (phone users don't have email)
ALTER TABLE customers MODIFY COLUMN email VARCHAR(255) UNIQUE NULL;

-- 2. Increase phone_number length for international formats (+964xxxxxxxxxx)
ALTER TABLE customers MODIFY COLUMN phone_number VARCHAR(50);

-- 3. Add 'phone' to auth_method enum
ALTER TABLE customers MODIFY COLUMN auth_method ENUM('local', 'firebase', 'email', 'phone') DEFAULT 'local';

-- 4. Add index on phone_number for faster lookups
ALTER TABLE customers ADD INDEX idx_phone (phone_number);

-- Done! Phone OTP users can now sign in.
