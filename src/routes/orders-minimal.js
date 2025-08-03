const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { protect } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Simple order creation endpoint that works with whatever schema we have
router.post('/minimal', protect, async (req, res) => {
  try {
    console.log('=== MINIMAL ORDER CREATION ===');
    console.log('User ID:', req.user?.id);
    console.log('User Email:', req.user?.email);
    console.log('Request body:', req.body);
    
    // First, let's see what the actual orders table structure is
    console.log('Testing orders table structure...');
    
    // Try to get the table structure by attempting a simple select
    const { data: existingOrders, error: selectError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('Orders table select error:', selectError);
      return res.status(500).json({
        success: false,
        error: { message: 'Cannot access orders table', debug: selectError.message }
      });
    }
    
    console.log('Existing orders structure sample:', existingOrders);
    
    // Get user's cart
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('user_id', req.user.id);
      
    if (cartError) {
      console.log('Cart error:', cartError);
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot access cart', debug: cartError.message }
      });
    }
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cart is empty' }
      });
    }
    
    console.log('Cart items:', cartItems);
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    console.log('Total calculated:', total);
    
    // Try the most basic order insertion possible
    const orderNumber = `RGP${Date.now()}`;
    console.log('Order number:', orderNumber);
    
    // Try different insertion strategies
    const insertStrategies = [
      // Strategy 1: Correct schema with required fields
      {
        name: 'Correct schema',
        data: {
          order_number: orderNumber,
          user_id: req.user.id,
          customer_email: req.user.email,
          customer_phone: req.user.phone,
          status: 'pending',
          payment_status: 'pending',
          subtotal: total,
          tax_amount: 0,
          shipping_amount: 0,
          discount_amount: 0,
          total_amount: total,
          payment_method: 'cash_on_delivery',
          shipping_method: 'standard',
          shipping_address: {
            firstName: req.user.first_name,
            lastName: req.user.last_name,
            email: req.user.email,
            phone: req.user.phone
          },
          billing_address: {
            firstName: req.user.first_name,
            lastName: req.user.last_name,
            email: req.user.email,
            phone: req.user.phone
          }
        }
      },
      // Strategy 2: Minimal required fields only
      {
        name: 'Minimal required fields',
        data: {
          order_number: orderNumber + '-MIN',
          user_id: req.user.id,
          customer_email: req.user.email,
          subtotal: total,
          total_amount: total,
          shipping_address: {
            email: req.user.email
          }
        }
      }
    ];
    
    let orderCreated = false;
    let finalOrder = null;
    
    for (const strategy of insertStrategies) {
      try {
        console.log(`Trying strategy: ${strategy.name}`);
        console.log('Insert data:', strategy.data);
        
        const { data: order, error: insertError } = await supabaseAdmin
          .from('orders')
          .insert([strategy.data])
          .select('*')
          .single();
          
        if (insertError) {
          console.log(`Strategy "${strategy.name}" failed:`, insertError.message);
          continue;
        }
        
        console.log(`✅ Strategy "${strategy.name}" succeeded!`);
        console.log('Created order:', order);
        finalOrder = order;
        orderCreated = true;
        break;
        
      } catch (strategyError) {
        console.log(`Strategy "${strategy.name}" exception:`, strategyError.message);
        continue;
      }
    }
    
    if (!orderCreated) {
      return res.status(500).json({
        success: false,
        error: { message: 'All order creation strategies failed' }
      });
    }
    
    // Clear cart
    await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id);
      
    console.log('✅ Cart cleared');
    console.log('=== ORDER CREATION COMPLETE ===');
    
    res.status(201).json({
      success: true,
      data: {
        order: {
          id: finalOrder.id,
          orderNumber: finalOrder.order_number,
          status: finalOrder.status,
          totalAmount: finalOrder.total_amount
        }
      },
      message: 'Order created successfully'
    });
    
  } catch (error) {
    console.error('Minimal order creation error:', error);
    logger.error('Minimal order error:', error);
    res.status(500).json({
      success: false,
      error: { 
        message: 'Order creation failed',
        debug: error.message
      }
    });
  }
});

module.exports = router;
