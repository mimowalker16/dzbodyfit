const { supabaseAdmin } = require('../src/config/supabase');

async function checkOrdersData() {
  try {
    console.log('🔍 Checking orders data...');
    
    // Check orders count
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*');
    
    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return;
    }
    
    console.log(`📋 Total orders: ${orders?.length || 0}`);
    
    if (orders && orders.length > 0) {
      console.log('📊 Recent orders:');
      orders.slice(0, 5).forEach(order => {
        console.log(`  - Order #${order.id}: ${order.total_amount} DZD (${order.status}) - ${new Date(order.created_at).toLocaleDateString()}`);
      });
      
      // Check order items for product data
      const { data: orderItems, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .limit(10);
        
      console.log(`📦 Total order items: ${orderItems?.length || 0}`);
      
      if (orderItems && orderItems.length > 0) {
        console.log('🛍️ Sample order items:');
        orderItems.slice(0, 5).forEach(item => {
          console.log(`  - ${item.product_name}: ${item.quantity}x ${item.price} DZD`);
        });
      }
    } else {
      console.log('⚠️ No orders found in database. Creating sample data...');
      await createSampleOrders();
    }
    
    // Check users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, created_at')
      .limit(10);
      
    console.log(`👥 Total users: ${users?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function createSampleOrders() {
  try {
    console.log('🏗️ Creating sample orders...');
    
    // Get some users first
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(5);
      
    if (!users || users.length === 0) {
      console.log('⚠️ No users found. Cannot create orders.');
      return;
    }
    
    // Sample products data
    const sampleProducts = [
      { name: 'Protein Whey Gold', price: 8500, category: 'supplements' },
      { name: 'Créatine Monohydrate', price: 4200, category: 'supplements' },
      { name: 'BCAA Energy', price: 3800, category: 'supplements' },
      { name: 'Pre-Workout Booster', price: 5500, category: 'supplements' },
      { name: 'Gants de Musculation', price: 2200, category: 'accessories' },
      { name: 'Shaker Premium', price: 1500, category: 'accessories' },
      { name: 'Tapis de Yoga', price: 4800, category: 'equipment' },
      { name: 'Haltères 10kg', price: 12000, category: 'equipment' }
    ];
    
    // Create orders for the last 30 days
    const orders = [];
    const orderItems = [];
    
    for (let i = 0; i < 25; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      
      // Random number of items per order (1-4)
      const itemCount = Math.floor(Math.random() * 4) + 1;
      let totalAmount = 0;
      
      const orderId = `order_${Date.now()}_${i}`;
      
      for (let j = 0; j < itemCount; j++) {
        const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemTotal = product.price * quantity;
        totalAmount += itemTotal;
        
        orderItems.push({
          order_id: orderId,
          product_name: product.name,
          quantity: quantity,
          price: product.price,
          total_price: itemTotal
        });
      }
      
      orders.push({
        id: orderId,
        user_id: user.id,
        total_amount: totalAmount,
        status: ['confirmed', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
        payment_method: 'cash_on_delivery',
        created_at: orderDate.toISOString(),
        updated_at: orderDate.toISOString()
      });
    }
    
    // Insert orders
    const { error: ordersError } = await supabaseAdmin
      .from('orders')
      .insert(orders);
      
    if (ordersError) {
      console.error('❌ Error creating orders:', ordersError);
      return;
    }
    
    // Insert order items
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError);
      return;
    }
    
    console.log(`✅ Created ${orders.length} sample orders with ${orderItems.length} items`);
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

checkOrdersData().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
