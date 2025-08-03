require('dotenv').config();
const { supabaseAdmin } = require('../src/config/supabase');

async function analyzeCartItems() {
  console.log('🔍 Analyzing cart_items table structure...');
  
  try {
    // Try to insert a test record to understand the schema
    const testItem = {
      user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      product_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      quantity: 1,
      unit_price: 1000
    };
    
    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .insert([testItem])
      .select('*');
    
    if (error) {
      console.log('❌ Cart items insert error (expected):', error);
      // This will tell us about the schema
    } else {
      console.log('✅ Test insert successful (unexpected):', data);
      // Clean up
      await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('id', data[0].id);
    }
    
    // Try to select from cart_items to see the structure
    const { data: schema, error: selectError } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ Select error:', selectError);
    } else {
      console.log('✅ Cart items table accessible, sample data:', schema);
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

analyzeCartItems();
