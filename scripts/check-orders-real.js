const { supabaseAdmin } = require('../src/config/supabase');

async function checkOrders() {
  try {
    console.log('🔍 Checking orders in database...');
    
    // Check orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .limit(10);
    
    if (ordersError) {
      console.error('❌ Error checking orders:', ordersError);
      return;
    }
    
    console.log(`📋 Orders found: ${orders?.length || 0}`);
    
    if (orders && orders.length > 0) {
      console.log('📊 Recent orders:');
      orders.forEach(order => {
        console.log(`  - Order #${order.id}: ${order.total_amount} DZD (${order.status}) - ${new Date(order.created_at).toLocaleDateString()}`);
      });
    }
    
    // Check order items
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .limit(5);
    
    if (itemsError) {
      console.error('❌ Error checking order items:', itemsError);
      return;
    }
    
    console.log(`📦 Order items found: ${orderItems?.length || 0}`);
    
    if (orderItems && orderItems.length > 0) {
      console.log('🛍️ Sample order items:');
      orderItems.forEach(item => {
        console.log(`  - ${item.product_name}: ${item.quantity}x ${item.price} DZD`);
      });
    }
    
    // Check users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, created_at')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error checking users:', usersError);
      return;
    }
    
    console.log(`👥 Users found: ${users?.length || 0}`);
    
    // Test specific analytics query
    const now = new Date();
    const dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const dateTo = now.toISOString();
    
    console.log(`📅 Date range: ${dateFrom} to ${dateTo}`);
    
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('orders')
      .select('total_amount, created_at')
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered'])
      .order('created_at', { ascending: true });
    
    if (revenueError) {
      console.error('❌ Revenue query error:', revenueError);
    } else {
      console.log(`💰 Revenue data points: ${revenueData?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOrders();
