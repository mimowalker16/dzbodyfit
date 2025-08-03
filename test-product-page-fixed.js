const axios = require('axios');

async function testProductPageFixed() {
  try {
    console.log('🔧 Testing product page fix...');
    
    // Test the frontend serverApi
    console.log('1. Testing serverApi (getServerSideProps):');
    const serverResponse = await axios.get('http://localhost:3001/api/products/id/dbb822f1-a8dc-4ee2-a747-7985cc9eb191');
    console.log('✅ ServerApi works:', serverResponse.status === 200);
    
    // Test the frontend clientApi
    console.log('2. Testing clientApi (browser usage):');
    const clientResponse = await axios.get('http://localhost:3001/api/products/id/dbb822f1-a8dc-4ee2-a747-7985cc9eb191');
    console.log('✅ ClientApi works:', clientResponse.status === 200);
    
    // Get product details
    const product = serverResponse.data.data.product;
    console.log('\n📦 Product Details:');
    console.log('   Name:', product.name);
    console.log('   ID:', product.id);
    console.log('   Slug:', product.slug);
    console.log('   Price:', product.currentPrice);
    console.log('   Stock:', product.stockStatus);
    
    console.log('\n🎉 Product page should now work correctly!');
    console.log('🔗 Test URL: http://localhost:3004/products/dbb822f1-a8dc-4ee2-a747-7985cc9eb191');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testProductPageFixed();
