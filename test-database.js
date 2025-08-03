const { supabaseAdmin } = require('./src/config/supabase');

async function testDatabase() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Database connection error:', testError);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Test if users table exists and has the right structure
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, phone, role, status, created_at')
      .limit(1);
    
    if (error) {
      console.error('Users table error:', error);
      console.log('This might indicate the users table doesn\'t exist or has wrong structure');
    } else {
      console.log('✅ Users table accessible');
      console.log('Sample user data structure:', data);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDatabase();
