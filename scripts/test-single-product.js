const http = require('http');

console.log('🔍 Testing single product price extraction...');

// Test with a simple product fetch
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/products/ff8548b8-8ba2-42cc-9119-e3cdd64b4ad1', // Créatine Monohydrate
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      console.log('Product API response status:', res.statusCode);
      
      if (res.statusCode === 200) {
        const productResponse = JSON.parse(data);
        console.log('\n=== SINGLE PRODUCT RESPONSE ===');
        
        if (productResponse.success && productResponse.data && productResponse.data.product) {
          const product = productResponse.data.product;
          console.log('Product name:', product.name);
          console.log('Base price:', product.basePrice, '(type:', typeof product.basePrice, ')');
          console.log('Sale price:', product.salePrice, '(type:', typeof product.salePrice, ')');
          console.log('Current price:', product.currentPrice, '(type:', typeof product.currentPrice, ')');
          
          console.log('\n=== PRICE ANALYSIS ===');
          console.log('These prices should be displayed as-is in DZD');
          console.log('Example: 4500 should show as 4,500 DZD');
        } else {
          console.log('❌ Unexpected product response structure');
          console.log('Response:', JSON.stringify(productResponse, null, 2));
        }
      } else {
        console.log('❌ Error response:', data);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error);
});

req.end();
