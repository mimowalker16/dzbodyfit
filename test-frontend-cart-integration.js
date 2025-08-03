const { execSync } = require('child_process');

// Test frontend cart integration with backend API
console.log('Testing frontend cart integration...\n');

// Check if development server is running
try {
  const frontendResponse = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3004', { timeout: 5000 }).toString().trim();
  console.log('Frontend server status:', frontendResponse === '200' ? 'Running ✅' : 'Not accessible ❌');
} catch (error) {
  console.log('Frontend server status: Not accessible ❌');
}

// Check if backend server is running
try {
  const backendResponse = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health', { timeout: 5000 }).toString().trim();
  console.log('Backend server status:', backendResponse === '200' ? 'Running ✅' : 'Not accessible ❌');
} catch (error) {
  console.log('Backend server status: Not accessible ❌');
}

// Test backend cart API to ensure it still has the correct data
console.log('\nTesting backend cart API...');
try {
  // Login to get auth token
  const loginResponse = execSync(`curl -s -X POST http://localhost:3001/api/auth/login ` +
    `-H "Content-Type: application/json" ` +
    `-d "{\\"email\\":\\"admin@ri.gym.pro\\",\\"password\\":\\"admin123\\"}"`, { timeout: 10000 }).toString();
  
  const loginData = JSON.parse(loginResponse);
  if (!loginData.token) {
    throw new Error('Login failed');
  }
  
  console.log('Backend login: Success ✅');
  const token = loginData.token;
  
  // Check cart contents
  const cartResponse = execSync(`curl -s -H "Authorization: Bearer ${token}" http://localhost:3001/api/cart`, { timeout: 5000 }).toString();
  const cartData = JSON.parse(cartResponse);
  
  console.log('Backend cart data:');
  console.log('- Items count:', cartData.items?.length || 0);
  console.log('- Total items:', cartData.totals?.itemCount || 0);
  console.log('- Subtotal:', cartData.totals?.subtotal || 0, 'DZD');
  
  if (cartData.items && cartData.items.length > 0) {
    console.log('- First item unit price:', cartData.items[0].unitPrice || 0, 'DZD');
    if (cartData.items[0].unitPrice === 4500) {
      console.log('✅ Backend cart has correct pricing (4500 DZD)');
    } else {
      console.log('❌ Backend cart pricing is incorrect');
    }
  } else {
    console.log('ℹ️ Backend cart is empty');
  }
  
} catch (error) {
  console.log('Backend cart test failed:', error.message);
}

console.log('\n📝 Next steps:');
console.log('1. Open frontend at http://localhost:3004');
console.log('2. Login with admin@ri.gym.pro / admin123');
console.log('3. Check cart page to verify 4500 DZD pricing displays correctly');
console.log('4. Clear browser localStorage if old 0 DZD cart data persists');
