-- Complete Açaí BR Schema
-- Run this script to create all necessary tables

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product sizes table
CREATE TABLE IF NOT EXISTS product_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flavors table
CREATE TABLE IF NOT EXISTS flavors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product flavor config table
CREATE TABLE IF NOT EXISTS product_flavor_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_flavors INTEGER NOT NULL DEFAULT 1,
  max_flavors INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addons table (global addons)
CREATE TABLE IF NOT EXISTS addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product addons junction table
CREATE TABLE IF NOT EXISTS product_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
  max_quantity INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  customer_cpf VARCHAR(20),
  delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('pickup', 'delivery')),
  address_street VARCHAR(255),
  address_number VARCHAR(50),
  address_neighborhood VARCHAR(100),
  address_city VARCHAR(100),
  address_complement VARCHAR(255),
  address_reference TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  payment_method VARCHAR(50) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  size_name VARCHAR(100),
  size_price DECIMAL(10, 2),
  flavors TEXT[],
  quantity INTEGER NOT NULL DEFAULT 1,
  item_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order item addons table
CREATE TABLE IF NOT EXISTS order_item_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  addon_name VARCHAR(100) NOT NULL,
  addon_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_fee DECIMAL(10, 2) DEFAULT 6.00,
  whatsapp_number VARCHAR(50) DEFAULT '557799406526',
  store_name VARCHAR(255) DEFAULT 'Açaí BR',
  admin_password VARCHAR(255) DEFAULT 'admin123',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if not exists
INSERT INTO store_settings (delivery_fee, whatsapp_number, store_name, admin_password)
SELECT 6.00, '557799406526', 'Açaí BR', 'admin123'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);

-- Insert sample product (Açaí Tradicional)
INSERT INTO products (name, description, image_url) 
VALUES ('Açaí Tradicional', 'Açaí puro e cremoso da Amazônia', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400')
ON CONFLICT DO NOTHING;

-- Get the product ID for the sample product
DO $$
DECLARE
  acai_id UUID;
BEGIN
  SELECT id INTO acai_id FROM products WHERE name = 'Açaí Tradicional' LIMIT 1;
  
  IF acai_id IS NOT NULL THEN
    -- Insert sizes
    INSERT INTO product_sizes (product_id, name, price) VALUES
      (acai_id, '300ml', 12.00),
      (acai_id, '500ml', 18.00),
      (acai_id, '700ml', 24.00)
    ON CONFLICT DO NOTHING;
    
    -- Insert flavors
    INSERT INTO flavors (product_id, name) VALUES
      (acai_id, 'Açaí Puro'),
      (acai_id, 'Açaí com Morango'),
      (acai_id, 'Açaí com Banana'),
      (acai_id, 'Açaí com Cupuaçu')
    ON CONFLICT DO NOTHING;
    
    -- Insert flavor config
    INSERT INTO product_flavor_config (product_id, min_flavors, max_flavors) VALUES
      (acai_id, 1, 2)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insert sample addons
INSERT INTO addons (name, price) VALUES
  ('Granola', 3.00),
  ('Leite Condensado', 2.50),
  ('Leite em Pó', 2.00),
  ('Banana', 2.00),
  ('Morango', 3.00),
  ('Paçoca', 2.50),
  ('Nutella', 5.00),
  ('Mel', 2.00)
ON CONFLICT DO NOTHING;

-- Link addons to the sample product
DO $$
DECLARE
  acai_id UUID;
  addon_rec RECORD;
BEGIN
  SELECT id INTO acai_id FROM products WHERE name = 'Açaí Tradicional' LIMIT 1;
  
  IF acai_id IS NOT NULL THEN
    FOR addon_rec IN SELECT id FROM addons LOOP
      INSERT INTO product_addons (product_id, addon_id, max_quantity) VALUES
        (acai_id, addon_rec.id, 3)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_flavors_product_id ON flavors(product_id);
CREATE INDEX IF NOT EXISTS idx_product_addons_product_id ON product_addons(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
