-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sizes table
CREATE TABLE IF NOT EXISTS sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create flavors table
CREATE TABLE IF NOT EXISTS flavors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create flavor_settings table for min/max selection
CREATE TABLE IF NOT EXISTS flavor_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  min_flavors INTEGER DEFAULT 1,
  max_flavors INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create addons table
CREATE TABLE IF NOT EXISTS addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create addon_settings table for min/max selection
CREATE TABLE IF NOT EXISTS addon_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  min_addons INTEGER DEFAULT 0,
  max_addons INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('pickup', 'delivery')),
  address_street TEXT,
  address_number TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_complement TEXT,
  address_reference TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  payment_method TEXT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  size_name TEXT,
  size_price DECIMAL(10,2),
  quantity INTEGER DEFAULT 1,
  item_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_item_flavors table
CREATE TABLE IF NOT EXISTS order_item_flavors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  flavor_name TEXT NOT NULL
);

-- Create order_item_addons table
CREATE TABLE IF NOT EXISTS order_item_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  addon_name TEXT NOT NULL,
  addon_price DECIMAL(10,2) NOT NULL
);

-- Create store_settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT DEFAULT 'Açaí Br',
  whatsapp_number TEXT DEFAULT '557799406526',
  delivery_fee DECIMAL(10,2) DEFAULT 6.00,
  is_open BOOLEAN DEFAULT true,
  opening_time TIME DEFAULT '08:00',
  closing_time TIME DEFAULT '22:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default store settings
INSERT INTO store_settings (store_name, whatsapp_number, delivery_fee) 
VALUES ('Açaí Br', '557799406526', 6.00)
ON CONFLICT DO NOTHING;
