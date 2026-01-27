-- Add category column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'tradicional';

-- Add index for category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category) WHERE active = true;

-- Update any existing products to have a default category if needed
UPDATE products SET category = 'tradicional' WHERE category IS NULL;
