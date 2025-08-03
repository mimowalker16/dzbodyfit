const axios = require('axios');

async function checkProductSlugs() {
  try {
    console.log('🔍 Checking product slugs in API response...');
    
    const response = await axios.get('http://localhost:3001/api/products?page=1&limit=3');
    
    if (response.data.success && response.data.data.items) {
      const products = response.data.data.items;
      console.log(`📦 Found ${products.length} products:`);
      
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. Product Details:`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Name: ${product.name}`);
        console.log(`   Slug: ${product.slug || 'NO SLUG'}`);
        console.log(`   SKU: ${product.sku}`);
      });
      
      // Test accessing by slug if it exists
      const firstProduct = products[0];
      if (firstProduct.slug) {
        console.log(`\n🎯 Testing access by slug: ${firstProduct.slug}`);
        try {
          const slugResponse = await axios.get(`http://localhost:3001/api/products/${firstProduct.slug}`);
          console.log('✅ Slug access works!');
          console.log('📋 Product details via slug:', slugResponse.data.data.product.name);
        } catch (error) {
          console.error('❌ Slug access failed:', error.response?.data || error.message);
        }
      }
      
    } else {
      console.log('❌ Invalid API response structure');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProductSlugs();
