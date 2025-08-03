const http = require('http');

console.log('🔍 Debugging cart data...');

// Make a request to the cart API
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/cart',
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
      const cartResponse = JSON.parse(data);
      console.log('=== CART API RESPONSE ===');
      console.log(JSON.stringify(cartResponse, null, 2));
      
      if (cartResponse.data && cartResponse.data.cart && cartResponse.data.cart.items) {
        console.log('\n=== CART ITEMS ANALYSIS ===');
        cartResponse.data.cart.items.forEach((item, index) => {
          console.log(`\nItem ${index + 1}:`);
          console.log('  ID:', item.id);
          console.log('  Product ID:', item.productId);
          console.log('  Quantity:', item.quantity);
          console.log('  Unit Price:', item.unitPrice);
          console.log('  Total Price:', item.totalPrice);
          
          if (item.product) {
            console.log('  Product Data:');
            console.log('    Name:', item.product.name);
            console.log('    Base Price:', item.product.basePrice);
            console.log('    Sale Price:', item.product.salePrice);
            console.log('    Current Price:', item.product.currentPrice);
            console.log('    SKU:', item.product.sku);
          } else {
            console.log('  ❌ NO PRODUCT DATA ATTACHED');
          }
        });
      } else {
        console.log('❌ No cart items found or empty cart');
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
