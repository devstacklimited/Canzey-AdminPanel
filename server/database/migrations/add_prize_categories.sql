-- Migration: Add Categories to Prizes and Campaigns
-- Adds category support to both product_prizes and campaigns tables

-- 1. Add category column to campaigns table
ALTER TABLE campaigns 
ADD COLUMN category ENUM('exclusive', 'cash', 'electronics', 'featured', 'new', 'premium') DEFAULT 'featured';

-- 2. Add index for category filtering on campaigns
ALTER TABLE campaigns ADD INDEX idx_category (category);

-- 3. Add category column to product_prizes table
ALTER TABLE product_prizes 
ADD COLUMN category ENUM('exclusive', 'cash', 'electronics', 'featured', 'new', 'premium') DEFAULT 'featured';

-- 4. Add index for category filtering on product_prizes
ALTER TABLE product_prizes ADD INDEX idx_category (category);

-- 5. Update existing records to 'featured' as default
UPDATE campaigns SET category = 'featured' WHERE category IS NULL;
UPDATE product_prizes SET category = 'featured' WHERE category IS NULL;

-- Done! Now both campaigns and product_prizes can be categorized.
