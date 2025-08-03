require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('🔑 Creating test user...');
    
    const email = 'logintest@example.com';
    const password = 'LoginTest123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('👤 User already exists, updating password...');
      
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('email', email);
      
      if (updateError) {
        console.error('❌ Error updating user:', updateError.message);
        return;
      }
    } else {
      console.log('➕ Creating new user...');
      
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert([{
          email: email,
          password_hash: hashedPassword,
          first_name: 'Login',
          last_name: 'Test',
          role: 'customer',
          status: 'active',
          email_verified: true
        }]);
      
      if (insertError) {
        console.error('❌ Error creating user:', insertError.message);
        return;
      }
    }
    
    console.log('✅ Test user ready!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('');
    console.log('🌐 You can now test login at: http://localhost:3004/auth/login');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

createTestUser();
