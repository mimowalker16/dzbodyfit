require('dotenv').config();

async function testProductCreationFull() {
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
    const token = loginResult.data?.tokens?.accessToken;

    // Now test product creation
    console.log('📦 Creating test product...');
    const createResponse = await fetch('http://localhost:3001/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Complete Test Product',
        description: 'A complete test product to verify everything works',
        shortDescription: 'Complete test product',
        sku: 'COMPLETE-TEST-002',
        category: '4a9f3b9c-491a-4a2a-9b9d-adc90f2bab24', // Protéines category
        brand: 'c1e19bad-7355-430a-b032-bdf67d627de7', // Optimum Nutrition brand
        basePrice: 250,
        salePrice: 220,
        stockQuantity: 40,
        stockStatus: 'in_stock',
        status: 'active',
        isFeatured: true,
        weight: 800,
        images: ['/images/complete-test.jpg'],
        seoTitle: 'Complete Test Product',
        seoDescription: 'A complete test product to verify everything works perfectly'
      })
    });

    const createResult = await createResponse.json();
    
    console.log('Full response:', JSON.stringify(createResult, null, 2));
    
    if (createResponse.ok) {
      console.log('✅ Product creation successful!');
    } else {
      console.log('❌ Product creation failed');
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testProductCreationFull();
