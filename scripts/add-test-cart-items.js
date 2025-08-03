const http = require('http');

console.log('🛒 Adding item to cart to reproduce the name/price issue...');

const addToCart = (productId, quantity = 1) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      productId: productId,
      quantity: quantity
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/cart/items',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-session-id': 'test-session-' + Math.random().toString(36).substr(2, 9)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          console.log('Add to cart response status:', res.statusCode);
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

async function main() {
  try {
    // Add first product to cart
    console.log('\n=== ADDING CRÉATINE MONOHYDRATE TO CART ===');
    const result1 = await addToCart('ff8548b8-8ba2-42cc-9119-e3cdd64b4ad1', 2);
    console.log('Add result:', JSON.stringify(result1, null, 2));

    // Add second product to cart
    console.log('\n=== ADDING BCAA ENERGY TO CART ===');
    const result2 = await addToCart('65aebac3-5ba9-4b27-b7d0-434742860736', 1);
    console.log('Add result:', JSON.stringify(result2, null, 2));

    console.log('\n✅ Items added to cart. Now check the cart page to see if names/prices are correct!');
    console.log('Visit: http://localhost:3004/cart');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
