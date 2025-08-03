require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

async function testCartTable() {
  console.log('🔍 Testing cart table...');
  
  try {
    // Check if cart table exists and has correct structure
    const { data, error } = await supabaseAdmin
      .from('cart')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Cart table error:', error);
      return false;
    }
    
    console.log('✅ Cart table exists and accessible');
    console.log('Cart table data:', data);
    
    // Test cart creation
    const testCart = {
      session_id: 'test-session-' + Date.now(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const { data: newCart, error: createError } = await supabaseAdmin
      .from('cart')
      .insert([testCart])
      .select('*')
      .single();
    
    if (createError) {
      console.error('❌ Cart creation error:', createError);
      return false;
    }
    
    console.log('✅ Cart creation successful:', newCart);
    
    // Clean up test cart
    await supabaseAdmin
      .from('cart')
      .delete()
      .eq('id', newCart.id);
    
    console.log('✅ Test cart cleaned up');
    return true;
    
  } catch (error) {
    console.error('❌ Cart test failed:', error);
    return false;
  }
}

testCartTable().then(success => {
  console.log(success ? '✨ Cart table test completed successfully' : '❌ Cart table test failed');
  process.exit(success ? 0 : 1);
}).catch(console.error);
