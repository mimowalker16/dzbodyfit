const http = require('http');

console.log('🔍 Debugging product name and price mismatch...');

// First, let's check the products API
const checkProducts = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/products?limit=5',
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
          console.log('Products API response status:', res.statusCode);
          console.log('Raw response length:', data.length);
          
          if (data.length === 0) {
            console.log('❌ Empty response from products API');
            resolve({ error: 'Empty response' });
            return;
          }
          
          const productsResponse = JSON.parse(data);
          console.log('Products API response structure:', Object.keys(productsResponse));
          resolve(productsResponse);
        } catch (error) {
          console.error('❌ Error parsing products response:', error);
          console.log('Raw response:', data.substring(0, 200) + '...');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

// Then check the cart API
const checkCart = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
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
          console.log('Cart API response status:', res.statusCode);
          console.log('Raw response length:', data.length);
          
          if (data.length === 0) {
            console.log('❌ Empty response from cart API');
            resolve({ error: 'Empty response' });
            return;
          }
          
          const cartResponse = JSON.parse(data);
          console.log('Cart API response structure:', Object.keys(cartResponse));
          resolve(cartResponse);
        } catch (error) {
          console.error('❌ Error parsing cart response:', error);
          console.log('Raw response:', data.substring(0, 200) + '...');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

async function main() {
  try {
    console.log('\n=== CHECKING PRODUCTS API ===');
    const productsData = await checkProducts();
    
    if (productsData.error) {
      console.log('❌ Products API error:', productsData.error);
    } else if (productsData.data && productsData.data.products) {
      console.log(`Found ${productsData.data.products.length} products:`);
      productsData.data.products.slice(0, 3).forEach((product, index) => {
        console.log(`Product ${index + 1}:`);
        console.log('  ID:', product.id);
        console.log('  Name:', product.name);
        console.log('  SKU:', product.sku);
        console.log('  Price:', product.price);
        console.log('  Base Price:', product.basePrice);
        console.log('  Sale Price:', product.salePrice);
        console.log('  ---');
      });
    } else {
      console.log('❌ Unexpected products response structure');
      console.log('Full response:', JSON.stringify(productsData, null, 2));
    }

    console.log('\n=== CHECKING CART API ===');
    const cartData = await checkCart();
    
    if (cartData.error) {
      console.log('❌ Cart API error:', cartData.error);
    } else if (cartData.data && cartData.data.cart && cartData.data.cart.items) {
      console.log(`Found ${cartData.data.cart.items.length} cart items:`);
      cartData.data.cart.items.forEach((item, index) => {
        console.log(`Cart Item ${index + 1}:`);
        console.log('  ID:', item.id);
        console.log('  Product ID:', item.productId);
        console.log('  Stored Unit Price:', item.unitPrice);
        console.log('  Total Price:', item.totalPrice || item.subtotal);
        
        if (item.product) {
          console.log('  Attached Product:');
          console.log('    Name:', item.product.name);
          console.log('    SKU:', item.product.sku);
          console.log('    Current Price:', item.product.currentPrice);
          console.log('    Base Price:', item.product.basePrice);
          console.log('    Sale Price:', item.product.salePrice);
          
          // Check for mismatch
          if (item.unitPrice !== item.product.currentPrice) {
            console.log('  🚨 PRICE MISMATCH DETECTED!');
            console.log(`    Cart stored: ${item.unitPrice}`);
            console.log(`    Product current: ${item.product.currentPrice}`);
          }
        } else {
          console.log('  ❌ NO PRODUCT DATA ATTACHED');
        }
        console.log('  ---');
      });
    } else {
      console.log('❌ Empty cart or unexpected cart response structure');
      console.log('Cart response keys:', Object.keys(cartData));
      if (cartData.data) {
        console.log('Cart data keys:', Object.keys(cartData.data));
        if (cartData.data.cart) {
          console.log('Cart object keys:', Object.keys(cartData.data.cart));
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
