require('dotenv').config();

async function testAdminAuth() {
  try {
    // First, log in to get a valid token
    console.log('🔐 Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@ri.gym.pro',
        password: 'admin123'
      })
    });

    const loginResult = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResult);
      return;
    }

    console.log('✅ Login successful!');
    console.log('👤 User role:', loginResult.user?.role);
    const token = loginResult.token;

    // Test admin products GET (should work)
    console.log('📋 Testing admin products list...');
    const getResponse = await fetch('http://localhost:3001/api/admin/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const getResult = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ Admin products GET successful!');
      console.log('   Products count:', getResult.pagination?.total || 0);
    } else {
      console.log('❌ Admin products GET failed:');
      console.log('Status:', getResponse.status);
      console.log('Error:', getResult);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testAdminAuth();
