-- Criar tabela de sabores globais
CREATE TABLE IF NOT EXISTS global_flavors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  orders_count INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de cupons de desconto
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order DECIMAL(10, 2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  max_uses INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna de cupom na tabela de pedidos (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'coupon_code') THEN
    ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_amount') THEN
    ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Habilitar RLS nas novas tabelas
ALTER TABLE global_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir acesso público (anônimo) às tabelas
CREATE POLICY "Allow public read access to global_flavors" ON global_flavors FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert access to global_flavors" ON global_flavors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update access to global_flavors" ON global_flavors FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete access to global_flavors" ON global_flavors FOR DELETE TO anon USING (true);

CREATE POLICY "Allow public read access to customers" ON customers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert access to customers" ON customers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update access to customers" ON customers FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete access to customers" ON customers FOR DELETE TO anon USING (true);

CREATE POLICY "Allow public read access to coupons" ON coupons FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert access to coupons" ON coupons FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update access to coupons" ON coupons FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete access to coupons" ON coupons FOR DELETE TO anon USING (true);

-- Inserir alguns sabores padrão
INSERT INTO global_flavors (name) VALUES 
  ('Morango'),
  ('Banana'),
  ('Kiwi'),
  ('Uva'),
  ('Cupuaçu'),
  ('Maracujá'),
  ('Açaí Puro'),
  ('Leite Condensado'),
  ('Nutella'),
  ('Paçoca')
ON CONFLICT (name) DO NOTHING;
