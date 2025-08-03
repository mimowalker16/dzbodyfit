const express = require('express');
const { supabaseAdmin } = require('../src/config/supabase');

async function testOrdersDirectly() {
  try {
    console.log('Testing orders API directly...');
    
    // Get orders with items
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        status,
        payment_status,
        customer_email,
        customer_phone,
        total_amount,
        created_at,
        updated_at,
        shipped_at,
        delivered_at,
        tracking_number,
        order_items(
          id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Supabase error:', error);
      return;
    }

    console.log(`Found ${orders?.length || 0} orders`);
    
    if (orders && orders.length > 0) {
      const firstOrder = orders[0];
      console.log('\nFirst Order Structure:');
      console.log('- ID:', firstOrder.id);
      console.log('- Order Number:', firstOrder.order_number);
      console.log('- Status:', firstOrder.status);
      console.log('- Customer Email:', firstOrder.customer_email);
      console.log('- Total Amount:', firstOrder.total_amount);
      console.log('- Order Items Type:', typeof firstOrder.order_items);
      console.log('- Order Items Length:', firstOrder.order_items?.length || 'undefined');
      
      if (firstOrder.order_items && firstOrder.order_items.length > 0) {
        console.log('\nFirst Item:');
        console.log('- Product Name:', firstOrder.order_items[0].product_name);
        console.log('- Quantity:', firstOrder.order_items[0].quantity);
        console.log('- Unit Price:', firstOrder.order_items[0].unit_price);
      }
      
      // Test the processed order structure
      const processedOrder = {
        id: firstOrder.id,
        orderNumber: firstOrder.order_number,
        userId: firstOrder.user_id,
        status: firstOrder.status,
        paymentStatus: firstOrder.payment_status,
        customerEmail: firstOrder.customer_email,
        customerPhone: firstOrder.customer_phone,
        totalAmount: firstOrder.total_amount,
        itemCount: firstOrder.order_items.length,
        items: firstOrder.order_items || [], // This is the fix
        trackingNumber: firstOrder.tracking_number,
        createdAt: firstOrder.created_at,
        updatedAt: firstOrder.updated_at,
        shippedAt: firstOrder.shipped_at,
        deliveredAt: firstOrder.delivered_at
      };
      
      console.log('\nProcessed Order:');
      console.log('- Has items property:', 'items' in processedOrder);
      console.log('- Items type:', typeof processedOrder.items);
      console.log('- Items length:', processedOrder.items.length);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testOrdersDirectly();
