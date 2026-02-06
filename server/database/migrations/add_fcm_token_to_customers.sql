-- Add FCM token field to customers table
ALTER TABLE customers 
ADD COLUMN fcm_token VARCHAR(500) NULL,
ADD INDEX idx_fcm_token (fcm_token);
