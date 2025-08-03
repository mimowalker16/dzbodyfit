const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function sendTestEmail() {
  console.log('📧 Sending Test Email to Your Gmail');
  console.log('='.repeat(40));
  
  try {
    // Create admin user
    console.log('👤 Creating admin user...');
    
    const adminUser = {
      email: 'admin@ri.gym.pro',
      password: 'AdminPassword123',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+213555654321'
    };

    try {
      await axios.post(`${BASE_URL}/auth/register`, adminUser);
      console.log('✅ Admin user created');
    } catch (error) {
      if (error.response?.data?.error?.message?.includes('existe déjà')) {
        console.log('✅ Admin user already exists');
      } else {
        throw error;
      }
    }

    // Login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });

    const token = loginResponse.data.data.tokens.accessToken;
    console.log('✅ Admin logged in successfully');

    // We need to manually set this user as admin in the database
    // For now, let's try a different approach - send email directly using the email service
    console.log('📤 Attempting to send test email...');
    
    const testEmailData = {
      to: 'mouayadmerrakchi@gmail.com',
      subject: 'Test Email from ri.gym.pro - Email System Working! 🎉',
      message: `
        <h2>🎉 Success! Your Email System is Working!</h2>
        <p>This email confirms that your ri.gym.pro email system is properly configured and working.</p>
        <p><strong>Email Service Status:</strong> ✅ Active</p>
        <p><strong>SMTP Configuration:</strong> ✅ Connected to Gmail</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p>Your Orders (COD) system is ready to send:</p>
        <ul>
          <li>✅ Order confirmation emails</li>
          <li>✅ Status update emails</li>
          <li>✅ Cancellation emails</li>
          <li>✅ Admin notifications</li>
        </ul>
        <p><em>Best regards,<br>ri.gym.pro Email System</em></p>
      `
    };

    try {
      const emailResponse = await axios.post(`${BASE_URL}/test/send-email`, testEmailData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🎉 TEST EMAIL SENT SUCCESSFULLY!');
      console.log('📧 Check your Gmail inbox: mouayadmerrakchi@gmail.com');
      console.log('📬 Email subject: "Test Email from ri.gym.pro - Email System Working! 🎉"');
      console.log('');
      console.log('Response:', emailResponse.data);
      
    } catch (emailError) {
      console.log('❌ Direct email test failed:', emailError.response?.data || emailError.message);
      
      // Let's try a manual email sending approach
      console.log('');
      console.log('🔧 Trying manual email approach...');
      await manualEmailTest();
    }

  } catch (error) {
    console.log('❌ Test setup failed:', error.response?.data || error.message);
    console.log('');
    console.log('🔧 Trying manual email approach...');
    await manualEmailTest();
  }
}

async function manualEmailTest() {
  console.log('📧 Manual Email Test');
  console.log('Let me create a simple test product and order to trigger real emails...');
  
  // Let's create a minimal test that bypasses the cart validation
  console.log('');
  console.log('💡 SIMPLE SOLUTION:');
  console.log('1. I\'ll create a special test endpoint that sends an email directly');
  console.log('2. Or we can add a test product to your database');
  console.log('');
  console.log('Which would you prefer?');
  console.log('A) Create a test endpoint to send email directly to your Gmail');
  console.log('B) Add a test product so we can create a real order');
}

sendTestEmail();
