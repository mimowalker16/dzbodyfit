require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function inspectOrdersStructure() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('🔍 Inspecting orders table structure...');
    
    // Get one order with all fields
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .limit(1);
    
    if (ordersError) {
      console.log('❌ Orders error:', ordersError);
      return;
    }
    
    if (orders && orders.length > 0) {
      console.log('📋 Order structure:');
      console.log(JSON.stringify(orders[0], null, 2));
    }
    
    // Get one order item with all fields
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .limit(1);
    
    if (itemsError) {
      console.log('❌ Order items error:', itemsError);
      return;
    }
    
    if (orderItems && orderItems.length > 0) {
      console.log('\n📦 Order item structure:');
      console.log(JSON.stringify(orderItems[0], null, 2));
    }
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

inspectOrdersStructure();
