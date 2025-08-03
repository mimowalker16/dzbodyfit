const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3004';

async function testCartPricing() {
  console.log('🧪 Testing Cart Pricing with base_price changes...\n');
  
  try {
    // Test 1: Login with provided credentials
    console.log('1️⃣ Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@ri.gym.pro',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful!');
      console.log('   User:', loginResponse.data.data.user?.firstName || 'Admin');
      console.log('   Token:', loginResponse.data.data.tokens?.accessToken ? 'Received' : 'Missing');
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const authToken = loginResponse.data.data.tokens.accessToken;
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // Test 2: Get a product to verify pricing
    console.log('\n2️⃣ Testing Product Pricing...');
    const productResponse = await axios.get(`${BASE_URL}/api/products/id/ff8548b8-8ba2-42cc-9119-e3cdd64b4ad1`);
    
    if (productResponse.data.success) {
      const product = productResponse.data.data.product;
      console.log('✅ Product fetched successfully!');
      console.log('   Name:', product.name);
      console.log('   Base Price:', product.basePrice, 'DZD');
      console.log('   Sale Price:', product.salePrice || 'None');
      console.log('   🎯 Expected finalPrice in frontend: ', product.basePrice, 'DZD');
    } else {
      console.log('❌ Product fetch failed');
      return;
    }
    
    // Test 3: Clear existing cart
    console.log('\n3️⃣ Clearing existing cart...');
    try {
      await axios.delete(`${BASE_URL}/api/cart`, { headers });
      console.log('✅ Cart cleared successfully!');
    } catch (error) {
      console.log('ℹ️ Cart clear: ', error.response?.data?.message || 'No existing cart');
    }
    
    // Test 4: Add product to cart
    console.log('\n4️⃣ Adding product to cart...');
    const addToCartResponse = await axios.post(`${BASE_URL}/api/cart/items`, {
      productId: 'ff8548b8-8ba2-42cc-9119-e3cdd64b4ad1',
      quantity: 1
    }, { headers });
    
    if (addToCartResponse.data.success) {
      console.log('✅ Product added to cart successfully!');
    } else {
      console.log('❌ Add to cart failed:', addToCartResponse.data.message);
    }
    
    // Test 5: Check cart contents
    console.log('\n5️⃣ Checking cart contents...');
    const cartResponse = await axios.get(`${BASE_URL}/api/cart`, { headers });
    
    if (cartResponse.data.success) {
      const cart = cartResponse.data.data;
      console.log('✅ Cart fetched successfully!');
      console.log('   Items count:', cart.items?.length || 0);
      
      if (cart.items && cart.items.length > 0) {
        cart.items.forEach((item, index) => {
          console.log(`   Item ${index + 1}:`);
          console.log(`     - Name: ${item.product?.name || 'Unknown'}`);
          console.log(`     - Price: ${item.product?.price || item.price || 'Missing'} DZD`);
          console.log(`     - Quantity: ${item.quantity}`);
          console.log(`     - Subtotal: ${(item.product?.price || item.price || 0) * item.quantity} DZD`);
        });
        
        console.log(`   💰 Total: ${cart.total || 'Missing'} DZD`);
        
        // Check if the pricing is correct
        const firstItem = cart.items[0];
        const itemPrice = firstItem.product?.price || firstItem.price;
        
        if (itemPrice === 4500) {
          console.log('\n🎉 SUCCESS! Base price (4500 DZD) is correctly displayed in cart!');
        } else if (itemPrice === 0) {
          console.log('\n❌ ISSUE: Price is still 0 DZD - cart items may need refresh');
        } else {
          console.log(`\n⚠️ UNEXPECTED: Price is ${itemPrice} DZD instead of expected 4500 DZD`);
        }
      } else {
        console.log('   ℹ️ Cart is empty');
      }
    } else {
      console.log('❌ Cart fetch failed');
    }
    
    console.log('\n🔍 Next Steps:');
    console.log('1. Open browser to: http://localhost:3004/cart');
    console.log('2. Login with: admin@ri.gym.pro / admin123 (or mouayadmerrakchi@gmail.com after password reset)');
    console.log('3. Check if cart shows 4500 DZD instead of 0 DZD');
    console.log('4. If still 0 DZD, the frontend cart context needs updating');
    
  } catch (error) {
    console.error('💥 Test failed:', error.response?.data?.message || error.message);
  }
}

testCartPricing();
