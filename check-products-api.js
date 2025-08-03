const axios = require('axios');

async function checkProductsAPI() {
  try {
    console.log('🔍 Checking products via API...');
    
    // Get products list
    const response = await axios.get('http://localhost:3001/api/products?page=1&limit=10');
    console.log('✅ API Response status:', response.status);
    
    if (response.data.success && response.data.data.items) {
      const products = response.data.data.items;
      console.log(`📦 Found ${products.length} products:`);
      
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ID: ${product.id}`);
        console.log(`     Name: ${product.name}`);
        console.log(`     SKU: ${product.sku || 'N/A'}`);
        console.log('');
      });
      
      // Test with the first valid product ID
      if (products.length > 0) {
        const firstProductId = products[0].id;
        console.log(`🎯 Testing first product: ${firstProductId}`);
        
        try {
          const productResponse = await axios.get(`http://localhost:3001/api/products/${firstProductId}`);
          console.log('✅ Product details API works!');
          console.log('📋 Product details:', JSON.stringify(productResponse.data, null, 2));
        } catch (error) {
          console.error('❌ Product details API failed:', error.response?.data || error.message);
        }
      }
      
      // Check the specific failing product
      const specificId = 'dbb822f1-a8dc-4ee2-a747-7985cc9eb191';
      console.log(`🎯 Checking failing product: ${specificId}`);
      
      const productExists = products.find(p => p.id === specificId);
      if (productExists) {
        console.log('✅ Product exists in list but API call failed');
      } else {
        console.log('❌ Product not found in products list');
        console.log('🔍 Checking if ID pattern matches any products...');
        
        const partialMatches = products.filter(p => 
          p.id.includes('dbb822f1') || 
          p.id.includes('a8dc-4ee2') || 
          p.id.includes('7985cc9eb191')
        );
        
        if (partialMatches.length > 0) {
          console.log('🔍 Found partial matches:');
          partialMatches.forEach(p => console.log(`  - ${p.id}: ${p.name}`));
        } else {
          console.log('❌ No partial matches found');
        }
      }
      
    } else {
      console.log('❌ Invalid API response structure');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

checkProductsAPI();
