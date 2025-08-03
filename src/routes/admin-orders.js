const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { logger } = require('../utils/logger');
const { protect, adminOnly } = require('../middleware/auth');
const emailService = require('../utils/emailService');

const router = express.Router();

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Admin
router.get('/orders', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite invalide'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Statut invalide'),
  query('search').optional().isString().withMessage('Recherche invalide')
], protect, adminOnly, async (req, res, next) => {
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
      limit = 20,
      status,
      search
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
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
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }

    const { data: orders, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Admin orders fetch error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération des commandes' }
      });
    }

    logger.info(`Found ${orders?.length || 0} orders for admin panel`);

    const processedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      userId: order.user_id,
      status: order.status,
      paymentStatus: order.payment_status,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      totalAmount: order.total_amount,
      itemCount: order.order_items.length,
      items: order.order_items.map(item => ({
        id: item.id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price
      })) || [], // Transform items to camelCase
      trackingNumber: order.tracking_number,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      shippedAt: order.shipped_at,
      deliveredAt: order.delivered_at
    }));

    res.json({
      success: true,
      data: {
        items: processedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Admin get orders error:', error);
    next(error);
  }
});

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Admin
router.put('/orders/:id/status', [
  param('id').isUUID().withMessage('ID commande invalide'),
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Statut invalide'),
  body('trackingNumber').optional().isString().withMessage('Numéro de suivi invalide'),
  body('notes').optional().isString().withMessage('Notes invalides')
], protect, adminOnly, async (req, res, next) => {
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
    const { status, trackingNumber, notes } = req.body;

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return res.status(404).json({
        success: false,
        error: { message: 'Commande non trouvée' }
      });
    }

    // Prepare update data
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    // Add tracking number if provided
    if (trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }

    // Add admin notes if provided
    if (notes) {
      updateData.customer_notes = notes;
    }

    // Add timestamps for specific statuses
    if (status === 'shipped' && currentOrder.status !== 'shipped') {
      updateData.shipped_at = new Date().toISOString();
    } else if (status === 'delivered' && currentOrder.status !== 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    // Update order
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      logger.error('Admin order status update error:', updateError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la mise à jour du statut' }
      });
    }

    // If cancelling, restore stock
    if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
      await restoreOrderStock(currentOrder.order_items);
    }

    // Send status update email notification
    try {
      const emailData = {
        customer: {
          email: currentOrder.customer_email,
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
      logger.info(`Order status update email sent for order ${currentOrder.order_number} (admin update)`);
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
    logger.error('Admin update order status error:', error);
    next(error);
  }
});

// @desc    Bulk update order statuses (Admin)
// @route   PUT /api/admin/orders/bulk-status
// @access  Admin
router.put('/orders/bulk-status', [
  body('orderIds').isArray({ min: 1 }).withMessage('Liste des commandes requise'),
  body('orderIds.*').isUUID().withMessage('ID commande invalide'),
  body('status').isIn(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Statut invalide'),
  body('trackingNumbers').optional().isArray().withMessage('Numéros de suivi invalides')
], protect, adminOnly, async (req, res, next) => {
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

    const { orderIds, status, trackingNumbers } = req.body;
    const updatedOrders = [];
    const failedOrders = [];

    for (let i = 0; i < orderIds.length; i++) {
      const orderId = orderIds[i];
      const trackingNumber = trackingNumbers?.[i];

      try {
        // Get current order
        const { data: currentOrder, error: fetchError } = await supabaseAdmin
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single();

        if (fetchError || !currentOrder) {
          failedOrders.push({ orderId, reason: 'Commande non trouvée' });
          continue;
        }

        // Prepare update data
        const updateData = {
          status,
          updated_at: new Date().toISOString()
        };

        if (trackingNumber) {
          updateData.tracking_number = trackingNumber;
        }

        if (status === 'shipped' && currentOrder.status !== 'shipped') {
          updateData.shipped_at = new Date().toISOString();
        } else if (status === 'delivered' && currentOrder.status !== 'delivered') {
          updateData.delivered_at = new Date().toISOString();
        }

        // Update order
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update(updateData)
          .eq('id', orderId);

        if (updateError) {
          failedOrders.push({ orderId, reason: 'Erreur de mise à jour' });
          continue;
        }

        // If cancelling, restore stock
        if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
          await restoreOrderStock(currentOrder.order_items);
        }

        // Send status update email notification (async, don't wait)
        try {
          const emailData = {
            customer: {
              email: currentOrder.customer_email,
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

          // Send email asynchronously to avoid blocking bulk update
          emailService.sendOrderStatusUpdate(emailData).catch(emailError => {
            logger.error(`Failed to send bulk status update email for order ${currentOrder.order_number}:`, emailError);
          });
        } catch (emailError) {
          logger.error(`Email preparation error for order ${currentOrder.order_number}:`, emailError);
        }

        updatedOrders.push({ orderId, status, trackingNumber });

      } catch (error) {
        failedOrders.push({ orderId, reason: error.message });
      }
    }

    res.json({
      success: true,
      message: `${updatedOrders.length} commandes mises à jour`,
      data: {
        updated: updatedOrders,
        failed: failedOrders,
        summary: {
          total: orderIds.length,
          successful: updatedOrders.length,
          failed: failedOrders.length
        }
      }
    });

  } catch (error) {
    logger.error('Bulk order status update error:', error);
    next(error);
  }
});

// @desc    Get order statistics (Admin)
// @route   GET /api/admin/orders/stats
// @access  Admin
router.get('/orders/stats', protect, adminOnly, async (req, res, next) => {
  try {
    // Get order counts by status
    const { data: statusStats, error: statusError } = await supabaseAdmin
      .from('orders')
      .select('status')
      .then(result => {
        if (result.error) return result;
        
        const stats = result.data.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {});
        
        return { data: stats, error: null };
      });

    if (statusError) {
      logger.error('Order stats error:', statusError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération des statistiques' }
      });
    }

    // Get revenue stats
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('orders')
      .select('total_amount, created_at, status')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    if (revenueError) {
      logger.error('Revenue stats error:', revenueError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération des revenus' }
      });
    }

    const totalRevenue = revenueData
      .filter(order => ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status))
      .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

    res.json({
      success: true,
      data: {
        statusStats,
        revenue: {
          last30Days: totalRevenue,
          totalOrders: revenueData.length
        },
        summary: {
          totalOrders: Object.values(statusStats).reduce((sum, count) => sum + count, 0),
          pendingOrders: statusStats.pending || 0,
          activeOrders: (statusStats.confirmed || 0) + (statusStats.processing || 0) + (statusStats.shipped || 0)
        }
      }
    });

  } catch (error) {
    logger.error('Get order stats error:', error);
    next(error);
  }
});

// @desc    Update delivery tracking (Admin)
// @route   PUT /api/admin/orders/:id/tracking
// @access  Admin
router.put('/orders/:id/tracking', [
  param('id').isUUID().withMessage('ID commande invalide'),
  body('trackingNumber').isString().notEmpty().withMessage('Numéro de suivi requis'),
  body('carrier').optional().isString().withMessage('Transporteur invalide'),
  body('estimatedDelivery').optional().isISO8601().withMessage('Date de livraison estimée invalide')
], protect, adminOnly, async (req, res, next) => {
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
    const { trackingNumber, carrier, estimatedDelivery } = req.body;

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return res.status(404).json({
        success: false,
        error: { message: 'Commande non trouvée' }
      });
    }

    // Update tracking information
    const updateData = {
      tracking_number: trackingNumber,
      updated_at: new Date().toISOString()
    };

    if (carrier) {
      updateData.shipping_carrier = carrier;
    }

    if (estimatedDelivery) {
      updateData.estimated_delivery = estimatedDelivery;
    }

    // If order is not yet shipped, update to shipped status
    if (currentOrder.status === 'processing' || currentOrder.status === 'confirmed') {
      updateData.status = 'shipped';
      updateData.shipped_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      logger.error('Tracking update error:', updateError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la mise à jour du suivi' }
      });
    }

    // Send tracking notification email
    try {
      const emailData = {
        customer: {
          email: currentOrder.customer_email,
          firstName: currentOrder.billing_address?.firstName || 'Client',
          lastName: currentOrder.billing_address?.lastName || ''
        },
        order: {
          orderNumber: currentOrder.order_number,
          trackingNumber: trackingNumber
        },
        oldStatus: currentOrder.status,
        newStatus: updateData.status || currentOrder.status
      };

      await emailService.sendOrderStatusUpdate(emailData);
      logger.info(`Tracking update email sent for order ${currentOrder.order_number}`);
    } catch (emailError) {
      logger.error('Failed to send tracking update email:', emailError);
    }

    res.json({
      success: true,
      message: 'Informations de suivi mises à jour',
      data: {
        orderId: id,
        trackingNumber,
        carrier: carrier || null,
        estimatedDelivery: estimatedDelivery || null
      }
    });

  } catch (error) {
    logger.error('Update tracking error:', error);
    next(error);
  }
});

// @desc    Get delivery tracking info (Admin)
// @route   GET /api/admin/orders/:id/tracking
// @access  Admin
router.get('/orders/:id/tracking', [
  param('id').isUUID().withMessage('ID commande invalide')
], protect, adminOnly, async (req, res, next) => {
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
        status,
        tracking_number,
        shipping_carrier,
        estimated_delivery,
        shipped_at,
        delivered_at,
        customer_email,
        shipping_address
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Commande non trouvée' }
      });
    }

    res.json({
      success: true,
      data: {
        tracking: {
          orderId: order.id,
          orderNumber: order.order_number,
          status: order.status,
          trackingNumber: order.tracking_number,
          carrier: order.shipping_carrier,
          estimatedDelivery: order.estimated_delivery,
          shippedAt: order.shipped_at,
          deliveredAt: order.delivered_at,
          shippingAddress: order.shipping_address
        }
      }
    });

  } catch (error) {
    logger.error('Get tracking info error:', error);
    next(error);
  }
});

// Helper function (shared with orders.js)
async function restoreOrderStock(orderItems) {
  try {
    for (const item of orderItems) {
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (!productError && product) {
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
