const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { cache } = require('../config/redis');
const { logger } = require('../utils/logger');
const { protect, optionalAuth } = require('../middleware/auth');
const emailService = require('../utils/emailService');

const router = express.Router();

// Helper function to generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `RGP${year}${month}${day}-${random}`;
};

// Helper function to calculate totals
const calculateOrderTotals = (items, shippingAmount = 0, taxRate = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.quantity), 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingAmount + taxAmount;

  return {
    subtotal: Math.round(subtotal),
    taxAmount: Math.round(taxAmount),
    shippingAmount: Math.round(shippingAmount),
    totalAmount: Math.round(total)
  };
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite invalide'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Statut invalide')
], protect, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Paramètres invalides',
          details: errors.array()
        }
      });
    }

    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        created_at,
        shipped_at,
        delivered_at,
        order_items(
          id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Orders fetch error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération des commandes' }
      });
    }

    const processedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      totalAmount: order.total_amount,
      itemCount: order.order_items.length,
      createdAt: order.created_at,
      shippedAt: order.shipped_at,
      deliveredAt: order.delivered_at,
      items: order.order_items.map(item => ({
        id: item.id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price
      }))
    }));

    res.json({
      success: true,
      data: {
        orders: processedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get orders error:', error);
    next(error);
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', [
  param('id').isUUID().withMessage('ID commande invalide')
], protect, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Paramètres invalides',
          details: errors.array()
        }
      });
    }

    const { id } = req.params;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        status,
        payment_status,
        billing_address,
        shipping_address,
        subtotal,
        shipping_amount,
        total_amount,
        payment_method,
        shipping_method,
        created_at,
        updated_at,
        shipped_at,
        delivered_at,
        order_items(
          id,
          product_id,
          variation_id,
          product_name,
          product_sku,
          variation_details,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Commande non trouvée' }
      });
    }

    const processedOrder = {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      customer: {
        email: order.billing_address?.email || null,
        phone: order.billing_address?.phone || null,
        firstName: order.billing_address?.firstName || null,
        lastName: order.billing_address?.lastName || null
      },
      addresses: {
        billing: order.billing_address,
        shipping: order.shipping_address
      },
      totals: {
        subtotal: order.subtotal,
        shippingAmount: order.shipping_amount,
        totalAmount: order.total_amount
      },
      payment: {
        method: order.payment_method
      },
      shipping: {
        method: order.shipping_method
      },
      items: order.order_items.map(item => ({
        id: item.id,
        productId: item.product_id,
        variationId: item.variation_id,
        productName: item.product_name,
        productSku: item.product_sku,
        variationDetails: item.variation_details,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price
      })),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      shippedAt: order.shipped_at,
      deliveredAt: order.delivered_at
    };

    res.json({
      success: true,
      data: { order: processedOrder }
    });

  } catch (error) {
    logger.error('Get order error:', error);
    next(error);
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', [
  body('billingAddress').isObject().withMessage('Adresse de facturation requise'),
  body('billingAddress.firstName').trim().isLength({ min: 2 }).withMessage('Prénom requis'),
  body('billingAddress.lastName').trim().isLength({ min: 2 }).withMessage('Nom requis'),
  body('billingAddress.addressLine1').trim().isLength({ min: 5 }).withMessage('Adresse requise'),
  body('billingAddress.city').trim().isLength({ min: 2 }).withMessage('Ville requise'),
  body('billingAddress.stateProvince').trim().isLength({ min: 2 }).withMessage('Wilaya requise'),
  body('billingAddress.phone').isMobilePhone('ar-DZ').withMessage('Téléphone invalide'),
  body('shippingAddress').optional().isObject(),
  body('paymentMethod').isIn(['cash_on_delivery', 'bank_transfer', 'stripe']).withMessage('Méthode de paiement invalide'),
  body('shippingMethod').optional().isIn(['standard', 'express']).withMessage('Méthode de livraison invalide')
], protect, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Données invalides',
          details: errors.array()
        }
      });
    }

    const {
      billingAddress,
      shippingAddress,
      paymentMethod,
      shippingMethod = 'standard',
      couponCode
    } = req.body;

    // Get user's cart items
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('user_id', req.user.id);

    if (cartError || !cartItems || !cartItems.length) {
      return res.status(400).json({
        success: false,
        error: { message: 'Panier vide' }
      });
    }

    // Get product details for each cart item
    const productIds = cartItems.map(item => item.product_id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError) {
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération des produits' }
      });
    }

    // Validate cart items and stock
    const validationErrors = [];
    const orderItems = [];

    for (const item of cartItems) {
      const product = products.find(p => p.id === item.product_id);
      
      if (!product) {
        validationErrors.push(`Produit introuvable`);
        continue;
      }

      // Check if product is still active
      if (product.status !== 'active') {
        validationErrors.push(`Produit ${product.name} n'est plus disponible`);
        continue;
      }

      // Check stock
      if (product.stock_status === 'out_of_stock' || product.stock_quantity < item.quantity) {
        validationErrors.push(`Stock insuffisant pour ${product.name} (${product.stock_quantity} disponible)`);
        continue;
      }

      orderItems.push({
        productId: item.product_id,
        variantId: item.variant_id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.unit_price * item.quantity,
        product: product // Keep product reference for stock update
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Erreurs de validation',
          details: validationErrors
        }
      });
    }

    // Calculate shipping cost (simplified)
    const shippingAmount = shippingMethod === 'express' ? 800 : 400; // DZD

    // Apply coupon if provided - simplified for now
    let discountAmount = 0;
    // TODO: Implement coupon system later

    // Calculate totals
    const totals = calculateOrderTotals(orderItems, shippingAmount);
    totals.discountAmount = discountAmount;
    totals.totalAmount -= discountAmount;

    // Create order
    const orderNumber = generateOrderNumber();
    
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        order_number: orderNumber,
        user_id: req.user.id,
        customer_email: req.user.email,
        customer_phone: billingAddress.phone,
        billing_address: billingAddress,
        shipping_address: shippingAddress || billingAddress,
        status: 'pending',
        payment_status: 'pending',
        subtotal: totals.subtotal,
        tax_amount: 0,
        shipping_amount: totals.shippingAmount,
        discount_amount: 0,
        total_amount: totals.totalAmount,
        payment_method: paymentMethod,
        shipping_method: shippingMethod || 'standard'
      }])
      .select('id, order_number, status, payment_status, total_amount')
      .single();

    if (orderError) {
      logger.error('Order creation error:', orderError);
      return res.status(500).json({
        success: false,
        error: { 
          message: 'Erreur lors de la création de la commande',
          debug: orderError.message
        }
      });
    }

    // Create order items
    const orderItemsData = orderItems.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.productName,
      product_sku: item.productSku,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      logger.error('Order items creation error:', itemsError);
      // Rollback order
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la création des articles de commande' }
      });
    }

    // Update stock quantities
    for (const item of orderItems) {
      const product = item.product;
      
      // Update product stock
      await supabaseAdmin
        .from('products')
        .update({
          stock_quantity: product.stock_quantity - item.quantity
        })
        .eq('id', product.id);
    }

    // Clear user's cart
    await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id);

    // Clear cache
    await cache.del(`cart:user:${req.user.id}`);

    // Send order confirmation email
    try {
      const emailData = {
        customer: {
          email: req.user.email,
          firstName: billingAddress.firstName || 'Client',
          lastName: billingAddress.lastName || ''
        },
        order: {
          orderNumber: order.order_number,
          status: order.status,
          paymentMethod: paymentMethod,
          subtotal: totals.subtotal,
          shippingAmount: totals.shippingAmount,
          totalAmount: totals.totalAmount,
          createdAt: new Date().toISOString(),
          shippingAddress: shippingAddress || billingAddress
        },
        items: orderItems.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      };

      await emailService.sendOrderConfirmation(emailData);
      logger.info(`Order confirmation email sent for order ${order.order_number}`);
    } catch (emailError) {
      logger.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      data: {
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          paymentStatus: order.payment_status,
          totalAmount: order.total_amount,
          paymentMethod: order.payment_method
        }
      },
      message: 'Commande créée avec succès'
    });

  } catch (error) {
    logger.error('Create order error:', error);
    next(error);
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', [
  param('id').isUUID().withMessage('ID commande invalide')
], protect, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Paramètres invalides',
          details: errors.array()
        }
      });
    }

    const { id } = req.params;

    // Get order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Commande non trouvée' }
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cette commande ne peut pas être annulée' }
      });
    }

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Order cancel error:', updateError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de l\'annulation' }
      });
    }

    // Restore stock quantities
    if (order.order_items) {
      await restoreOrderStock(order.order_items);
    }

    // Send cancellation email
    try {
      const emailData = {
        customer: {
          email: req.user.email,
          firstName: order.billing_address?.firstName || 'Client',
          lastName: order.billing_address?.lastName || ''
        },
        order: {
          orderNumber: order.order_number,
          totalAmount: order.total_amount
        },
        reason: 'Annulation demandée par le client'
      };

      await emailService.sendOrderCancellation(emailData);
      logger.info(`Order cancellation email sent for order ${order.order_number}`);
    } catch (emailError) {
      logger.error('Failed to send order cancellation email:', emailError);
      // Don't fail the cancellation if email fails
    }

    res.json({
      success: true,
      message: 'Commande annulée avec succès'
    });

  } catch (error) {
    logger.error('Cancel order error:', error);
    next(error);
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
router.put('/:id/status', [
  param('id').isUUID().withMessage('ID commande invalide'),
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Statut invalide'),
  body('trackingNumber').optional().isString().withMessage('Numéro de suivi invalide')
], protect, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Paramètres invalides',
          details: errors.array()
        }
      });
    }

    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !currentOrder) {
      return res.status(404).json({
        success: false,
        error: { message: 'Commande non trouvée' }
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[currentOrder.status].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: `Impossible de passer de "${currentOrder.status}" à "${status}"` }
      });
    }

    // Prepare update data
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    // Add timestamps for specific statuses
    if (status === 'shipped') {
      updateData.shipped_at = new Date().toISOString();
      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    // Update order
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      logger.error('Order status update error:', updateError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la mise à jour du statut' }
      });
    }

    // If cancelling, restore stock
    if (status === 'cancelled') {
      await restoreOrderStock(currentOrder.order_items);
    }

    // Send status update email notification
    try {
      const emailData = {
        customer: {
          email: req.user.email,
          firstName: currentOrder.billing_address?.firstName || 'Client',
          lastName: currentOrder.billing_address?.lastName || ''
        },
        order: {
          orderNumber: currentOrder.order_number,
          trackingNumber: trackingNumber || currentOrder.tracking_number
        },
        oldStatus: currentOrder.status,
        newStatus: status
      };

      await emailService.sendOrderStatusUpdate(emailData);
      logger.info(`Order status update email sent for order ${currentOrder.order_number}`);
    } catch (emailError) {
      logger.error('Failed to send order status update email:', emailError);
      // Don't fail the status update if email fails
    }

    res.json({
      success: true,
      message: `Statut de la commande mis à jour: ${status}`,
      data: {
        orderId: id,
        newStatus: status,
        trackingNumber: trackingNumber || null
      }
    });

  } catch (error) {
    logger.error('Update order status error:', error);
    next(error);
  }
});

// Helper function to restore stock when order is cancelled
async function restoreOrderStock(orderItems) {
  try {
    for (const item of orderItems) {
      // Get current product stock
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (!productError && product) {
        // Restore stock quantity
        await supabaseAdmin
          .from('products')
          .update({
            stock_quantity: product.stock_quantity + item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.product_id);

        logger.info(`Stock restored for product ${item.product_id}: +${item.quantity}`);
      }
    }
  } catch (error) {
    logger.error('Stock restoration error:', error);
  }
}

module.exports = router;
