-- Test queries for ri.gym.pro database
-- Run these in Supabase SQL Editor to verify the setup

-- Test 1: Check if tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Test 2: Check if custom types were created
SELECT typname, typtype 
FROM pg_type 
WHERE typname IN ('user_role', 'product_status', 'order_status', 'payment_method')
ORDER BY typname;

-- Test 3: Insert a test category
INSERT INTO categories (name, slug, description) 
VALUES ('Protein Supplements', 'protein-supplements', 'High-quality protein powders and supplements');

-- Test 4: Insert a test brand
INSERT INTO brands (name, slug, description) 
VALUES ('Test Brand', 'test-brand', 'A test supplement brand');

-- Test 5: Select test data
SELECT * FROM categories WHERE slug = 'protein-supplements';
SELECT * FROM brands WHERE slug = 'test-brand';

-- Test 6: Clean up test data
DELETE FROM categories WHERE slug = 'protein-supplements';
DELETE FROM brands WHERE slug = 'test-brand';
