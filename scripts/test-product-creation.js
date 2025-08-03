require('dotenv').config();

async function testProductCreation() {
  try {
    const response = await fetch('http://localhost:3001/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_JWT_TOKEN || 'dummy-token'}`
      },
      body: JSON.stringify({
        name: 'Test Product',
        description: 'A test product for validation',
        shortDescription: 'Test product',
        sku: 'TEST-001',
        category: '1',
        brand: '1',
        basePrice: 100,
        salePrice: 80,
        stockQuantity: 50,
        stockStatus: 'in_stock',
        status: 'active',
        isFeatured: false,
        weight: 500,
        images: ['/images/test.jpg'],
        seoTitle: 'Test Product',
        seoDescription: 'A test product for validation'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Product creation successful!');
      console.log('Product ID:', result.id);
    } else {
      console.log('❌ Product creation failed:');
      console.log('Status:', response.status);
      console.log('Error:', result);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testProductCreation();
