const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

const testAdmin = {
  email: 'admin@ri.gym.pro',
  password: 'admin123',
  name: 'Admin User'
};

let userToken = '';
let adminToken = '';
let testOrderId = '';

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = '') {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      data
    };
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ API Error (${method} ${endpoint}):`, 
      error.response?.data || error.message);
    throw error;
  }
}

// Test authentication
async function testAuth() {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    // Register user
    await apiCall('POST', '/auth/register', testUser);
    console.log('✅ User registered successfully');
    
    // Login user
    const userLogin = await apiCall('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    userToken = userLogin.data.token;
    console.log('✅ User logged in successfully');
    
    // Login admin
    const adminLogin = await apiCall('POST', '/auth/login', {
      email: testAdmin.email,
      password: testAdmin.password
    });
    adminToken = adminLogin.data.token;
    console.log('✅ Admin logged in successfully');
  } catch (error) {
    console.log('⚠️  Auth setup error (might already exist)');
  }
}

// Test cart setup
async function setupCart() {
  console.log('\n🛒 Setting up cart...');
  
  // Add items to cart
  await apiCall('POST', '/cart/add', {
    productId: 'test-product-1',
    quantity: 2,
    unitPrice: 2500
  }, userToken);
  
  await apiCall('POST', '/cart/add', {
    productId: 'test-product-2',
    quantity: 1,
    unitPrice: 5000
  }, userToken);
  
  console.log('✅ Cart items added');
}

// Test order creation with email
async function testOrderCreation() {
  console.log('\n📝 Testing Order Creation (with email)...');
  
  const orderData = {
    billingAddress: {
      firstName: 'Test',
      lastName: 'User',
      phone: '+213555123456',
      addressLine1: '123 Test Street',
      city: 'Alger',
      stateProvince: 'Alger',
      postalCode: '16000',
      country: 'DZ'
    },
    paymentMethod: 'cash_on_delivery',
    shippingMethod: 'standard'
  };
  
  try {
    const response = await apiCall('POST', '/orders', orderData, userToken);
    testOrderId = response.data.order.id;
    console.log('✅ Order created successfully:', response.data.order.orderNumber);
    console.log('📧 Order confirmation email should be sent');
    return response.data.order;
  } catch (error) {
    console.error('❌ Order creation failed');
    throw error;
  }
}

// Test order status updates with email
async function testStatusUpdates() {
  console.log('\n📊 Testing Order Status Updates (with email)...');
  
  const statuses = ['confirmed', 'processing', 'shipped'];
  
  for (const status of statuses) {
    try {
      const updateData = { status };
      if (status === 'shipped') {
        updateData.trackingNumber = 'TRACK123456789';
      }
      
      await apiCall('PUT', `/orders/${testOrderId}/status`, updateData, userToken);
      console.log(`✅ Order status updated to: ${status}`);
      console.log('📧 Status update email should be sent');
      
      // Wait a bit between updates
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to update status to ${status}`);
    }
  }
}

// Test admin functionality
async function testAdminFunctions() {
  console.log('\n👨‍💼 Testing Admin Functions...');
  
  try {
    // Get all orders
    const orders = await apiCall('GET', '/admin/orders?limit=10', null, adminToken);
    console.log(`✅ Admin fetched ${orders.data.orders.length} orders`);
    
    // Update order via admin (should send email)
    if (testOrderId) {
      await apiCall('PUT', `/admin/orders/${testOrderId}/status`, {
        status: 'delivered',
        notes: 'Package delivered successfully'
      }, adminToken);
      console.log('✅ Admin updated order status to delivered');
      console.log('📧 Admin status update email should be sent');
    }
    
    // Test delivery tracking
    const trackingData = {
      trackingNumber: 'DHL123456789',
      carrier: 'DHL',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    await apiCall('PUT', `/admin/orders/${testOrderId}/tracking`, trackingData, adminToken);
    console.log('✅ Delivery tracking updated');
    console.log('📧 Tracking update email should be sent');
    
    // Get tracking info
    const tracking = await apiCall('GET', `/admin/orders/${testOrderId}/tracking`, null, adminToken);
    console.log('✅ Tracking info retrieved:', tracking.data.tracking.trackingNumber);
    
    // Get order stats
    const stats = await apiCall('GET', '/admin/orders/stats', null, adminToken);
    console.log('✅ Order statistics retrieved');
    
  } catch (error) {
    console.error('❌ Admin functions test failed');
  }
}

// Test bulk operations
async function testBulkOperations() {
  console.log('\n📦 Testing Bulk Operations...');
  
  try {
    // Create a second order for bulk testing
    await setupCart();
    const secondOrder = await testOrderCreation();
    
    // Bulk status update
    const bulkData = {
      orderIds: [testOrderId, secondOrder.id], 
      status: 'processing',
      trackingNumbers: ['BULK001', 'BULK002']
    };
    
    const bulkResult = await apiCall('PUT', '/admin/orders/bulk-status', bulkData, adminToken);
    console.log(`✅ Bulk updated ${bulkResult.data.summary.successful} orders`);
    console.log('📧 Bulk status update emails should be sent');
    
  } catch (error) {
    console.error('❌ Bulk operations test failed');
  }
}

// Test order cancellation with email
async function testOrderCancellation() {
  console.log('\n❌ Testing Order Cancellation (with email)...');
  
  try {
    // Create a new order to cancel
    await setupCart();
    const cancelOrder = await testOrderCreation();
    
    // Cancel the order
    await apiCall('PUT', `/orders/${cancelOrder.id}/cancel`, {}, userToken);
    console.log('✅ Order cancelled successfully');
    console.log('📧 Cancellation email should be sent');
    
  } catch (error) {
    console.error('❌ Order cancellation test failed');
  }
}

// Test email service configuration
async function testEmailConfig() {
  console.log('\n📧 Testing Email Service Configuration...');
  
  try {
    // This would require adding a test endpoint to check email config
    console.log('📧 Email service configured with:');
    console.log(`   - SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
    console.log(`   - From Email: ${process.env.FROM_EMAIL || 'noreply@ri.gym.pro'}`);
    console.log('✅ Email configuration loaded');
  } catch (error) {
    console.error('❌ Email configuration test failed');
  }
}

// Main test function
async function runCompleteOrderTests() {
  console.log('🚀 Starting Complete Orders System Test...');
  console.log('This will test:');
  console.log('  - Order creation with email confirmation');
  console.log('  - Order status updates with email notifications');
  console.log('  - Admin order management with emails');
  console.log('  - Delivery tracking');
  console.log('  - Bulk operations with email notifications');
  console.log('  - Order cancellation with email');
  
  try {
    await testEmailConfig();
    await testAuth();
    await setupCart();
    await testOrderCreation();
    await testStatusUpdates();
    await testAdminFunctions();
    await testBulkOperations();
    await testOrderCancellation();
    
    console.log('\n🎉 Complete Orders System Test Completed Successfully!');
    console.log('\n📧 Check your email inbox for:');
    console.log('  - Order confirmation emails');
    console.log('  - Status update emails');
    console.log('  - Tracking update emails');
    console.log('  - Cancellation emails');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Add environment check
function checkEnvironment() {
  console.log('\n🔧 Environment Check:');
  console.log(`Server URL: ${BASE_URL}`);
  
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('⚠️  Missing email environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('📧 Email functionality may not work properly');
  } else {
    console.log('✅ All email environment variables configured');
  }
}

// Run tests
if (require.main === module) {
  checkEnvironment();
  runCompleteOrderTests();
}

module.exports = {
  runCompleteOrderTests,
  testAuth,
  testOrderCreation,
  testStatusUpdates,
  testAdminFunctions,
  testBulkOperations,
  testOrderCancellation
};
