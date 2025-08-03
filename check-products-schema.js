const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkProductsSchema() {
  try {
    console.log('🔍 Checking products schema and data...');
    
    // Get a few products to see the structure
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }
    
    console.log('📦 Found', data.length, 'products:');
    if (data.length > 0) {
      console.log('📋 Product structure (first product):');
      console.log(JSON.stringify(data[0], null, 2));
      
      console.log('📋 All product IDs:');
      data.forEach((product, index) => {
        console.log(`  ${index + 1}. ID: ${product.id}`);
        console.log(`     Name: ${product.name}`);
        console.log('');
      });
    }
    
    // Check the specific product from the URL
    const specificId = 'dbb822f1-a8dc-4ee2-a747-7985cc9eb191';
    console.log(`🎯 Checking specific product: ${specificId}`);
    const { data: specificProduct, error: specificError } = await supabase
      .from('products')
      .select('*')
      .eq('id', specificId);
      
    if (specificError) {
      console.error('❌ Error fetching specific product:', specificError);
    } else if (specificProduct.length === 0) {
      console.log('❌ Product not found with ID:', specificId);
      
      // Try to find products with similar IDs
      console.log('🔍 Looking for similar IDs...');
      const { data: allProducts } = await supabase.from('products').select('id, name');
      const similarIds = allProducts.filter(p => 
        p.id.includes('dbb822f1') || 
        p.id.includes('a8dc-4ee2') || 
        p.id.includes('7985cc9eb191')
      );
      
      if (similarIds.length > 0) {
        console.log('🔍 Found similar IDs:');
        similarIds.forEach(p => console.log(`  - ${p.id}: ${p.name}`));
      } else {
        console.log('❌ No similar IDs found');
      }
    } else {
      console.log('✅ Found specific product:', specificProduct[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProductsSchema();
