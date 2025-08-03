#!/usr/bin/env node

const { default: fetch } = require('node-fetch');

console.log('🧪 Testing Complete Cart Flow with base_price');
console.log('==================================================');

async function testCompleteCartFlow() {
  try {
    // 1. Test admin login
    console.log('1. Authenticating admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@ri.gym.pro', 
        password: 'admin123' 
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const token = loginData.data.token;
    console.log('✅ Admin authenticated');
    
    // 2. Get first product
    console.log('\n2. Fetching product data...');
    const productsResponse = await fetch('http://localhost:3001/api/products?limit=1');
    const productsData = await productsResponse.json();
    
    const product = productsData.data.items[0];
    console.log(`✅ Product: ${product.name}`);
    console.log(`   Base Price: ${product.basePrice} DZD`);
    console.log(`   Current Price: ${product.currentPrice} DZD`);
    
    // 3. Clear and add to cart
    console.log('\n3. Managing cart...');
    await fetch('http://localhost:3001/api/cart/clear', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const addResponse = await fetch('http://localhost:3001/api/cart/items', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        productId: product.id, 
        quantity: 1 
      })
    });
    
    const addResult = await addResponse.json();
    if (addResult.success) {
      console.log('✅ Item added to cart');
      console.log(`   Unit Price: ${addResult.data.item.unitPrice} DZD`);
      console.log(`   Expected (base_price): ${product.basePrice} DZD`);
      
      if (addResult.data.item.unitPrice === product.basePrice) {
        console.log('✅ PERFECT: Cart unit price matches base_price!');
      } else {
        console.log('❌ ISSUE: Cart unit price does not match base_price');
      }
    } else {
      console.log('❌ Failed to add to cart:', addResult.error);
      return;
    }
    
    // 4. Verify cart totals
    console.log('\n4. Verifying cart state...');
    const cartResponse = await fetch('http://localhost:3001/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const cartData = await cartResponse.json();
    const cart = cartData.data.cart;
    
    console.log(`✅ Cart loaded - ${cart.items.length} items`);
    console.log(`   Subtotal: ${cart.totals.subtotal} DZD`);
    
    if (cart.totals.subtotal === product.basePrice) {
      console.log('✅ PERFECT: Cart subtotal equals base_price for 1 item!');
    } else {
      console.log('❌ ISSUE: Cart subtotal does not match base_price');
    }
    
    // 5. Test frontend cart page
    console.log('\n5. Testing frontend cart page...');
    const frontendResponse = await fetch('http://localhost:3004/cart', {
      headers: { 'Cookie': `token=${token}` }
    });
    
    const html = await frontendResponse.text();
    const dataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    
    if (dataMatch) {
      const pageData = JSON.parse(dataMatch[1]);
      const serverCart = pageData.props.pageProps.serverCart;
      
      console.log(`✅ Frontend cart loaded`);
      console.log(`   Items: ${serverCart.items.length}`);
      console.log(`   Subtotal: ${serverCart.subtotal} DZD`);
      
      if (serverCart.items.length > 0) {
        const frontendItem = serverCart.items[0];
        console.log(`   Item Unit Price: ${frontendItem.unitPrice} DZD`);
        
        if (frontendItem.unitPrice === product.basePrice) {
          console.log('🎉 SUCCESS: Frontend shows base_price correctly!');
        } else {
          console.log('❌ ISSUE: Frontend unit price does not match base_price');
        }
        
        if (serverCart.subtotal > 0) {
          console.log('🎉 SUCCESS: Frontend cart shows non-zero total!');
        } else {
          console.log('❌ ISSUE: Frontend still shows 0 DZD despite items');
        }
      } else {
        console.log('❌ CRITICAL: Frontend cart is empty despite backend having items');
      }
    }
    
    console.log('\n==================================================');
    console.log('🎯 FINAL ANALYSIS:');
    console.log(`Expected base_price: ${product.basePrice} DZD`);
    console.log(`Backend cart unit price: ${addResult.data?.item?.unitPrice || 'N/A'} DZD`);
    console.log(`Backend cart subtotal: ${cart.totals.subtotal} DZD`);
    console.log(`Frontend cart subtotal: ${pageData?.props?.pageProps?.serverCart?.subtotal || 'N/A'} DZD`);
    
    if (cart.totals.subtotal === product.basePrice && 
        (pageData?.props?.pageProps?.serverCart?.subtotal || 0) > 0) {
      console.log('🎉 RESOLUTION: base_price is working correctly end-to-end!');
    } else {
      console.log('⚠️  ISSUE: There may still be pricing display problems');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testCompleteCartFlow();
