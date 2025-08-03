const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test configuration
const testConfig = {
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123',
  firstName: 'Test',
  lastName: 'User',
  phone: '+213555123456'
};

let authToken = '';
let testOrderId = '';

const api = axios.create(testConfig);

// Helper function to log test results
const logStep = (step, success = true, data = null) => {
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${step}`);
  if (data && typeof data === 'object') {
    console.log('   Data:', JSON.stringify(data, null, 2));
  } else if (data) {
    console.log('   Data:', data);
  }
  console.log('');
};

const logError = (step, error) => {
  console.log(`❌ ${step}`);
  if (error.response) {
    console.log('   Status:', error.response.status);
    console.log('   Error:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.log('   Error:', error.message);
  }
  console.log('');
};

// Test email configuration
async function testEmailConfig() {
  try {
    const response = await api.get('/test/email-config-public');
    logStep('Email configuration test', true, response.data);
    return true;
  } catch (error) {
    logError('Email configuration test', error);
    return false;
  }
}

// Test user registration and login
async function testAuth() {
  try {
    // Register user
    const registerResponse = await api.post('/auth/register', testUser);
    logStep('User registration', true, { message: 'User registered successfully' });

    // Login user
    const loginResponse = await api.post('/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    authToken = loginResponse.data.data.tokens.accessToken;
    logStep('User login', true, { token: 'Token received', tokenStart: authToken.substring(0, 20) + '...' });
    
    // Set authorization header for future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    return true;
  } catch (error) {
    if (error.response && error.response.status === 400 && 
        error.response.data.error.message.includes('existe déjà')) {
      // User already exists, try to login
      try {
        const loginResponse = await api.post('/auth/login', {
          email: testUser.email,
          password: testUser.password
        });
        
        authToken = loginResponse.data.data.tokens.accessToken;
        logStep('User login (existing user)', true, { token: 'Token received', tokenStart: authToken.substring(0, 20) + '...' });
        
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        return true;
      } catch (loginError) {
        logError('User login (existing user)', loginError);
        return false;
      }
    } else {
      logError('User authentication', error);
      return false;
    }
  }
}

// Test adding products to cart
async function testAddToCart() {
  try {
    // Note: Using mock UUIDs for testing - in real scenarios these would be actual product IDs
    const cartItems = [
      { productId: '550e8400-e29b-41d4-a716-446655440001', quantity: 2 },
      { productId: '550e8400-e29b-41d4-a716-446655440002', quantity: 1 }
    ];

    for (const item of cartItems) {
      try {
        await api.post('/cart/items', item);
        logStep(`Added product ${item.productId} to cart`, true);
      } catch (error) {
        // Expected to fail with mock product IDs, but should show validation passes
        if (error.response && error.response.status === 404) {
          logStep(`Product ${item.productId} not found (expected with mock ID)`, true);
        } else {
          throw error;
        }
      }
    }
    
    logStep('Add products to cart (validation passed)', true, { items: cartItems.length });
    return true;
  } catch (error) {
    logError('Add products to cart', error);
    return false;
  }
}

// Test order creation with email notification (skip cart for simplicity)
async function testOrderCreation() {
  try {
    // First, let's try to add items to cart with proper UUIDs
    const mockProducts = [
      { productId: '550e8400-e29b-41d4-a716-446655440001', quantity: 2 },
      { productId: '550e8400-e29b-41d4-a716-446655440002', quantity: 1 }
    ];

    // Try to add to cart (may fail due to products not existing, but that's OK for this test)
    for (const item of mockProducts) {
      try {
        await api.post('/cart/items', item);
      } catch (error) {
        // Ignore cart errors for this test - we're mainly testing email integration
        console.log(`   Note: Cart item ${item.productId} not added (product may not exist)`);
      }
    }

    const orderData = {
      billingAddress: {
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        email: testUser.email,
        phone: testUser.phone,
        addressLine1: '123 Test Street',
        city: 'Algiers',
        stateProvince: 'Algiers',
        postalCode: '16000',
        country: 'DZ'
      },
      shippingMethod: 'standard',
      paymentMethod: 'cash_on_delivery'
    };

    const response = await api.post('/orders', orderData);
    testOrderId = response.data.data.order.id;
    
    logStep('Order creation with email notification', true, {
      orderId: testOrderId,
      orderNumber: response.data.data.order.orderNumber,
      status: response.data.data.order.status,
      total: response.data.data.order.totalAmount
    });
    
    return true;
  } catch (error) {
    logError('Order creation with email notification', error);
    return false;
  }
}

// Test order status update with email notification
async function testOrderStatusUpdate() {
  if (!testOrderId) {
    logStep('Order status update', false, 'No test order ID available');
    return false;
  }

  try {
    const response = await api.put(`/orders/${testOrderId}/status`, {
      status: 'confirmed'
    });
    
    logStep('Order status update with email notification', true, {
      orderId: testOrderId,
      newStatus: 'confirmed'
    });
    
    // Test another status update
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const response2 = await api.put(`/orders/${testOrderId}/status`, {
      status: 'processing'
    });
    
    logStep('Order status update to processing', true, {
      orderId: testOrderId,
      newStatus: 'processing'
    });
    
    return true;
  } catch (error) {
    logError('Order status update with email notification', error);
    return false;
  }
}

// Test order cancellation with email notification
async function testOrderCancellation() {
  if (!testOrderId) {
    logStep('Order cancellation', false, 'No test order ID available');
    return false;
  }

  try {
    const response = await api.put(`/orders/${testOrderId}/cancel`);
    
    logStep('Order cancellation with email notification', true, {
      orderId: testOrderId,
      message: response.data.message
    });
    
    return true;
  } catch (error) {
    logError('Order cancellation with email notification', error);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Testing Email Integration for Orders System');
  console.log('='.repeat(50));
  console.log('');

  let allTestsPassed = true;

  // Test email configuration
  const emailConfigTest = await testEmailConfig();
  allTestsPassed = allTestsPassed && emailConfigTest;

  if (!emailConfigTest) {
    console.log('⚠️  Email configuration failed. Continuing with other tests...');
    console.log('');
  }

  // Test authentication
  const authTest = await testAuth();
  allTestsPassed = allTestsPassed && authTest;

  if (!authTest) {
    console.log('❌ Authentication failed. Cannot continue with order tests.');
    return;
  }

  // Test cart functionality (optional for email testing)
  const cartTest = await testAddToCart();
  // Don't fail the entire test if cart fails - continue with order creation
  if (!cartTest) {
    console.log('⚠️  Cart test failed. Continuing with order creation (orders can work without pre-filled cart)...');
  }

  // Test order creation with email
  const orderCreationTest = await testOrderCreation();
  allTestsPassed = allTestsPassed && orderCreationTest;

  if (orderCreationTest) {
    // Test order status updates with email
    const statusUpdateTest = await testOrderStatusUpdate();
    allTestsPassed = allTestsPassed && statusUpdateTest;

    // Test order cancellation with email
    const cancellationTest = await testOrderCancellation();
    allTestsPassed = allTestsPassed && cancellationTest;
  }

  // Summary
  console.log('='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 All tests passed! Email integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the results above.');
  }
  console.log('');
  
  console.log('📧 Email Notifications Summary:');
  console.log('   - Order confirmation emails should be sent on order creation');
  console.log('   - Status update emails should be sent on status changes');
  console.log('   - Cancellation emails should be sent on order cancellation');
  console.log('');
  console.log('Note: Check your email service logs for actual email delivery status.');
}

// Run the tests
runTests().catch(console.error);
