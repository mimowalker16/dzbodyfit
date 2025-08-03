#!/usr/bin/env node

const { default: fetch } = require('node-fetch');

console.log('🧪 Testing Price Display After base_price Fix');
console.log('==================================================');

async function testPriceDisplay() {
  try {
    // 1. Test backend products API to verify base_price is returned
    console.log('1. Testing backend products API...');
    const productsResponse = await fetch('http://localhost:3001/api/products?limit=3');
    const productsData = await productsResponse.json();
    
    if (productsData.success && productsData.data.items.length > 0) {
      const firstProduct = productsData.data.items[0];
      console.log('✅ Backend API working');
      console.log(`   Product: ${firstProduct.name}`);
      console.log(`   Base Price: ${firstProduct.basePrice} DZD`);
      console.log(`   Sale Price: ${firstProduct.salePrice || 'null'} DZD`);
      console.log(`   Current Price: ${firstProduct.currentPrice} DZD`);
    } else {
      console.log('❌ Backend API failed');
      return;
    }
    
    // 2. Test frontend SSR to verify price transformation
    console.log('\n2. Testing frontend SSR price transformation...');
    const frontendResponse = await fetch('http://localhost:3004/');
    const frontendHtml = await frontendResponse.text();
    
    if (frontendHtml.includes('__NEXT_DATA__')) {
      console.log('✅ Frontend SSR working');
      
      // Extract the __NEXT_DATA__ script content
      const nextDataMatch = frontendHtml.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
      if (nextDataMatch) {
        try {
          const nextData = JSON.parse(nextDataMatch[1]);
          const props = nextData.props.pageProps;
          
          if (props.products && props.products.length > 0) {
            const firstProduct = props.products[0];
            console.log(`   Transformed Product: ${firstProduct.name}`);
            console.log(`   Final Price: ${firstProduct.price} DZD`);
            console.log(`   Original base_price: ${firstProduct.basePrice || 'not present'} DZD`);
            
            // Check if finalPrice matches basePrice from backend
            const backendProduct = productsData.data.items.find(p => p.name === firstProduct.name);
            if (backendProduct && firstProduct.price === backendProduct.basePrice) {
              console.log('✅ Price transformation correct - finalPrice matches backend basePrice');
            } else {
              console.log('❌ Price transformation issue - finalPrice does not match backend basePrice');
            }
          } else {
            console.log('⚠️  No products found in frontend data');
          }
        } catch (e) {
          console.log('❌ Failed to parse frontend data:', e.message);
        }
      } else {
        console.log('⚠️  __NEXT_DATA__ not found in HTML');
      }
    } else {
      console.log('❌ Frontend SSR failed');
    }
    
    // 3. Test cart page to verify empty state shows 0 DZD correctly
    console.log('\n3. Testing cart page pricing display...');
    const cartResponse = await fetch('http://localhost:3004/cart');
    const cartHtml = await cartResponse.text();
    
    if (cartHtml.includes('__NEXT_DATA__')) {
      console.log('✅ Cart page loading');
      
      // Extract cart data
      const cartDataMatch = cartHtml.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
      if (cartDataMatch) {
        try {
          const cartData = JSON.parse(cartDataMatch[1]);
          const serverCart = cartData.props.pageProps.serverCart;
          
          console.log(`   Cart Items: ${serverCart.items.length}`);
          console.log(`   Cart Subtotal: ${serverCart.subtotal} DZD`);
          console.log(`   Cart Total: ${serverCart.total} DZD`);
          
          if (serverCart.items.length === 0 && serverCart.subtotal === 0) {
            console.log('✅ Empty cart correctly shows 0 DZD');
          } else if (serverCart.items.length > 0) {
            console.log('✅ Cart has items with pricing:');
            serverCart.items.forEach((item, index) => {
              console.log(`     Item ${index + 1}: ${item.name} - ${item.unitPrice} DZD x ${item.quantity}`);
            });
          }
        } catch (e) {
          console.log('❌ Failed to parse cart data:', e.message);
        }
      }
    } else {
      console.log('❌ Cart page failed to load');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run the test
testPriceDisplay();
