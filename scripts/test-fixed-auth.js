require('dotenv').config();

async function testWithCorrectToken() {
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
    console.log('👤 User role:', loginResult.data?.user?.role);
    
    // Use the correct token path
    const token = loginResult.data?.tokens?.accessToken;
    
    if (!token) {
      console.log('❌ No access token found in response');
      return;
    }

    // Debug the token payload
    const tokenParts = token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('🔍 Token payload:', JSON.stringify(payload, null, 2));

    // Now test product creation
    console.log('📦 Creating test product...');
    const createResponse = await fetch('http://localhost:3001/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Product Fixed',
        description: 'A test product with fixed auth',
        shortDescription: 'Test product fixed',
        sku: 'FIXED-TEST-001',
        category: '4a9f3b9c-491a-4a2a-9b9d-adc90f2bab24', // Protéines category
        brand: 'c1e19bad-7355-430a-b032-bdf67d627de7', // Optimum Nutrition brand
        basePrice: 200,
        salePrice: 180,
        stockQuantity: 30,
        stockStatus: 'in_stock',
        status: 'active',
        isFeatured: false,
        weight: 600,
        images: ['/images/test-fixed.jpg'],
        seoTitle: 'Test Product Fixed',
        seoDescription: 'A test product with fixed authentication'
      })
    });

    const createResult = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ Product creation successful!');
      console.log('📋 Product Details:');
      console.log('   ID:', createResult.product?.id);
      console.log('   Name:', createResult.product?.name);
      console.log('   SKU:', createResult.product?.sku);
    } else {
      console.log('❌ Product creation failed:');
      console.log('Status:', createResponse.status);
      console.log('Error:', createResult);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testWithCorrectToken();
