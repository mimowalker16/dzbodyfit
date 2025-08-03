require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkOrders() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('🔍 Checking orders in database...');
    
    // Check orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .limit(5);
    
    if (ordersError) {
      console.log('❌ Orders error:', ordersError);
    } else {
      console.log(`📋 Found ${orders?.length || 0} orders`);
      if (orders && orders.length > 0) {
        console.log('Sample orders:');
        orders.forEach(order => {
          console.log(`  - Order ${order.id}: ${order.total_amount} DZD (${order.status}) - ${new Date(order.created_at).toLocaleDateString()}`);
        });
      }
    }
    
    // Check order items
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .limit(5);
    
    if (itemsError) {
      console.log('❌ Order items error:', itemsError);
    } else {
      console.log(`📦 Found ${orderItems?.length || 0} order items`);
      if (orderItems && orderItems.length > 0) {
        console.log('Sample order items:');
        orderItems.forEach(item => {
          console.log(`  - ${item.product_name}: ${item.quantity}x ${item.price} DZD`);
        });
      }
    }
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkOrders();
