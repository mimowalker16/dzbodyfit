const axios = require('axios');

async function diagnoseProductMismatch() {
  try {
    console.log('🔍 Diagnosing product page column mismatch...');
    
    // Get list of products first
    console.log('1. Getting product list...');
    const listResponse = await axios.get('http://localhost:3001/api/products?page=1&limit=5');
    
    if (listResponse.data.success && listResponse.data.data.items) {
      const products = listResponse.data.data.items;
      console.log(`📦 Found ${products.length} products in list:`);
      
      // Test each product
      for (let i = 0; i < Math.min(3, products.length); i++) {
        const product = products[i];
        console.log(`\n${i + 1}. Testing product: ${product.name}`);
        console.log(`   List ID: ${product.id}`);
        console.log(`   List Slug: ${product.slug || 'NO SLUG'}`);
        
        // Test the ID endpoint
        try {
          const detailResponse = await axios.get(`http://localhost:3001/api/products/id/${product.id}`);
          const detailProduct = detailResponse.data.data.product;
          
          console.log(`   Detail ID: ${detailProduct.id}`);
          console.log(`   Detail Name: ${detailProduct.name}`);
          console.log(`   Detail Slug: ${detailProduct.slug || 'NO SLUG'}`);
          
          // Check if data matches
          if (product.id === detailProduct.id && product.name === detailProduct.name) {
            console.log('   ✅ Data matches correctly');
          } else {
            console.log('   ❌ Data mismatch detected!');
            console.log(`     List: ${product.id} - ${product.name}`);
            console.log(`     Detail: ${detailProduct.id} - ${detailProduct.name}`);
          }
          
        } catch (error) {
          console.log(`   ❌ Failed to fetch details: ${error.response?.status} ${error.response?.statusText}`);
        }
      }
      
      // Test opening different product pages in frontend
      console.log('\n🌐 Frontend URLs to test:');
      products.slice(0, 3).forEach((product, i) => {
        console.log(`${i + 1}. http://localhost:3004/products/${product.id} (${product.name})`);
      });
      
    } else {
      console.log('❌ Invalid product list response');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

diagnoseProductMismatch();
