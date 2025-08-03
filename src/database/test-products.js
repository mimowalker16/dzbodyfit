require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');

async function testProducts() {
  try {
    console.log('🔍 Testing products in database...');
    
    // Test products
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        name_ar,
        slug,
        sku,
        base_price,
        sale_price,
        stock_quantity,
        stock_status,
        featured,
        status,
        brands(name),
        categories(name, name_ar)
      `)
      .limit(10);
      
    if (productsError) {
      console.error('❌ Products error:', productsError);
    } else {
      console.log(`✅ Products found: ${products.length}`);
      products.forEach((product, index) => {
        console.log(`\n📦 Product ${index + 1}:`);
        console.log(`   Name: ${product.name} (${product.name_ar})`);
        console.log(`   SKU: ${product.sku}`);
        console.log(`   Price: ${product.base_price} DZD ${product.sale_price ? `(Sale: ${product.sale_price} DZD)` : ''}`);
        console.log(`   Stock: ${product.stock_quantity} (${product.stock_status})`);
        console.log(`   Brand: ${product.brands?.name}`);
        console.log(`   Category: ${product.categories?.name} (${product.categories?.name_ar})`);
        console.log(`   Featured: ${product.featured ? '⭐' : '○'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProducts();
