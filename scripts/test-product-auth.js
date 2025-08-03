require('dotenv').config();

async function testProductCreationWithAuth() {
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
    const token = loginResult.token;

    // Now test product creation
    console.log('📦 Creating test product...');
    const createResponse = await fetch('http://localhost:3001/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Product API',
        description: 'A test product created via API',
        shortDescription: 'Test product via API',
        sku: 'API-TEST-001',
        category: 1,
        brand: 1,
        basePrice: 150,
        salePrice: 120,
        stockQuantity: 25,
        stockStatus: 'in_stock',
        status: 'active',
        isFeatured: true,
        weight: 750,
        images: ['/images/test-api.jpg'],
        seoTitle: 'Test Product API',
        seoDescription: 'A test product created via API for validation'
      })
    });

    const createResult = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ Product creation successful!');
      console.log('📋 Product Details:');
      console.log('   ID:', createResult.product?.id);
      console.log('   Name:', createResult.product?.name);
      console.log('   SKU:', createResult.product?.sku);
      console.log('   Base Price:', createResult.product?.base_price);
    } else {
      console.log('❌ Product creation failed:');
      console.log('Status:', createResponse.status);
      console.log('Error:', createResult);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testProductCreationWithAuth();
