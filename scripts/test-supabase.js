require('dotenv').config();

console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('❌ Missing environment variables');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('🔍 Testing Supabase connection...');
    
    // Test with users table
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      console.log('❌ Supabase error:', error);
    } else {
      console.log('✅ Supabase connection successful');
      console.log('Data received:', data);
    }
    
  } catch (err) {
    console.log('❌ Test error:', err.message);
  }
}

testSupabase();
