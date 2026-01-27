-- Tabela de Produtos (Açaís)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Tamanhos dos Produtos
CREATE TABLE IF NOT EXISTS product_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size_ml INT,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Sabores de Açaí
CREATE TABLE IF NOT EXISTS flavors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de vinculação Produto-Sabores (quais sabores cada produto aceita)
CREATE TABLE IF NOT EXISTS product_flavors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  flavor_id UUID REFERENCES flavors(id) ON DELETE CASCADE,
  min_quantity INT DEFAULT 1,
  max_quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, flavor_id)
);

-- Tabela de Categorias de Adicionais
CREATE TABLE IF NOT EXISTS addon_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  min_quantity INT DEFAULT 0,
  max_quantity INT DEFAULT 10,
  is_required BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Adicionais
CREATE TABLE IF NOT EXISTS addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES addon_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de vinculação Produto-Categorias de Adicionais
CREATE TABLE IF NOT EXISTS product_addon_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  addon_category_id UUID REFERENCES addon_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, addon_category_id)
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_cpf TEXT,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('pickup', 'delivery')),
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zipcode TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'pix')),
  change_amount DECIMAL(10,2),
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  size_id UUID REFERENCES product_sizes(id),
  size_name TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Sabores escolhidos no item do pedido
CREATE TABLE IF NOT EXISTS order_item_flavors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  flavor_id UUID REFERENCES flavors(id),
  flavor_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Adicionais escolhidos no item do pedido
CREATE TABLE IF NOT EXISTS order_item_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES addons(id),
  addon_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas (permite acesso público para leitura)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_addon_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_addons ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura pública dos produtos
CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read product_sizes" ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Allow public read flavors" ON flavors FOR SELECT USING (true);
CREATE POLICY "Allow public read product_flavors" ON product_flavors FOR SELECT USING (true);
CREATE POLICY "Allow public read addon_categories" ON addon_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read addons" ON addons FOR SELECT USING (true);
CREATE POLICY "Allow public read product_addon_categories" ON product_addon_categories FOR SELECT USING (true);

-- Políticas para permitir inserção pública de pedidos
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public update orders" ON orders FOR UPDATE USING (true);

CREATE POLICY "Allow public insert order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read order_items" ON order_items FOR SELECT USING (true);

CREATE POLICY "Allow public insert order_item_flavors" ON order_item_flavors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read order_item_flavors" ON order_item_flavors FOR SELECT USING (true);

CREATE POLICY "Allow public insert order_item_addons" ON order_item_addons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read order_item_addons" ON order_item_addons FOR SELECT USING (true);

-- Políticas para admin (permitir tudo - será protegido por senha no frontend)
CREATE POLICY "Allow public insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON products FOR DELETE USING (true);

CREATE POLICY "Allow public insert product_sizes" ON product_sizes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update product_sizes" ON product_sizes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete product_sizes" ON product_sizes FOR DELETE USING (true);

CREATE POLICY "Allow public insert flavors" ON flavors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update flavors" ON flavors FOR UPDATE USING (true);
CREATE POLICY "Allow public delete flavors" ON flavors FOR DELETE USING (true);

CREATE POLICY "Allow public insert product_flavors" ON product_flavors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update product_flavors" ON product_flavors FOR UPDATE USING (true);
CREATE POLICY "Allow public delete product_flavors" ON product_flavors FOR DELETE USING (true);

CREATE POLICY "Allow public insert addon_categories" ON addon_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update addon_categories" ON addon_categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete addon_categories" ON addon_categories FOR DELETE USING (true);

CREATE POLICY "Allow public insert addons" ON addons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update addons" ON addons FOR UPDATE USING (true);
CREATE POLICY "Allow public delete addons" ON addons FOR DELETE USING (true);

CREATE POLICY "Allow public insert product_addon_categories" ON product_addon_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update product_addon_categories" ON product_addon_categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete product_addon_categories" ON product_addon_categories FOR DELETE USING (true);
