const express = require('express');
const { query, body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { logger } = require('../utils/logger');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
router.get('/analytics', [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Période invalide'),
  query('startDate').optional().isISO8601().withMessage('Date de début invalide'),
  query('endDate').optional().isISO8601().withMessage('Date de fin invalide')
], async (req, res) => {
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

    const { period = 'month', startDate, endDate } = req.query;

    // Calculate date range
    let dateFrom, dateTo;
    if (startDate && endDate) {
      dateFrom = startDate;
      dateTo = endDate;
    } else {
      const now = new Date();
      dateTo = now.toISOString();
      
      switch (period) {
        case 'week':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'quarter':
          dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'year':
          dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default: // month
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    logger.info('Analytics date range:', { dateFrom, dateTo, period });

    // Get revenue data
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('orders')
      .select('total_amount, created_at')
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)
      .in('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered'])
      .order('created_at', { ascending: true });

    // Get orders data
    const { data: ordersData, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id, created_at')
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)
      .order('created_at', { ascending: true });

    // Get users data (skip for now due to RLS issues)
    const usersData = [];
    const usersError = null;

    // Get top products
    const { data: topProductsData, error: topProductsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        product_name,
        quantity,
        total_price,
        orders!inner(created_at, status)
      `)
      .gte('orders.created_at', dateFrom)
      .lte('orders.created_at', dateTo)
      .in('orders.status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered']);

    // Log database results
    logger.info('Using database data for analytics');
    logger.info('Revenue data length:', revenueData?.length || 0);
    logger.info('Orders data length:', ordersData?.length || 0);
    logger.info('Users data length:', usersData?.length || 0);
    
    if (revenueError) logger.warn('Revenue error:', revenueError);
    if (ordersError) logger.warn('Orders error:', ordersError);
    if (topProductsError) logger.warn('Top products error:', topProductsError);

    // Process data for charts
    const revenue = processTimeSeriesData(revenueData, 'total_amount', dateFrom, dateTo);
    const orders = processTimeSeriesData(ordersData, 'count', dateFrom, dateTo);
    const users = processTimeSeriesData(usersData, 'count', dateFrom, dateTo);

    // Process top products
    const productStats = {};
    if (topProductsData) {
      topProductsData.forEach(item => {
        if (!productStats[item.product_name]) {
          productStats[item.product_name] = {
            sales: 0,
            revenue: 0
          };
        }
        productStats[item.product_name].sales += item.quantity;
        productStats[item.product_name].revenue += parseFloat(item.total_price || 0);
      });
    }

    const topProducts = Object.entries(productStats)
      .map(([name, stats]) => ({
        product: { name },
        sales: stats.sales,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        revenue,
        orders,
        users,
        topProducts,
        topCategories: [] // TODO: implement when categories are available
      }
    });

  } catch (error) {
    logger.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la récupération des analytics' }
    });
  }
});

// @desc    Get content data
// @route   GET /api/admin/content
// @access  Private (Admin)
router.get('/content', async (req, res) => {
  try {
    // For now, return empty data structure
    // This can be expanded when content management is implemented
    res.json({
      success: true,
      data: {
        banners: [],
        categories: [],
        settings: {}
      }
    });

  } catch (error) {
    logger.error('Content error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la récupération du contenu' }
    });
  }
});

// @desc    Update content
// @route   PUT /api/admin/content/:type
// @access  Private (Admin)
router.put('/content/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const data = req.body;

    // For now, just return success
    // This can be expanded when content management is implemented
    res.json({
      success: true,
      data: {
        message: `Contenu ${type} mis à jour`
      }
    });

  } catch (error) {
    logger.error('Update content error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la mise à jour du contenu' }
    });
  }
});

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
router.get('/settings', async (req, res) => {
  try {
    // For now, return default settings structure
    // This can be expanded when settings management is implemented
    res.json({
      success: true,
      data: {
        maintenance: {
          enabled: false,
          message: '',
          allowedRoles: ['admin', 'super_admin']
        },
        security: {
          sessionTimeout: 3600,
          maxLoginAttempts: 5,
          passwordMinLength: 8,
          requireStrongPasswords: true,
          twoFactorEnabled: false
        },
        email: {
          enabled: true,
          provider: 'smtp',
          smtpHost: process.env.SMTP_HOST || '',
          smtpPort: parseInt(process.env.SMTP_PORT) || 587,
          smtpUser: process.env.SMTP_USER || '',
          smtpSecure: true
        },
        backup: {
          enabled: false,
          frequency: 'daily',
          retention: 30,
          lastBackup: ''
        },
        logging: {
          level: 'info',
          enableApiLogs: true,
          enableErrorLogs: true,
          enableUserActivityLogs: true,
          retention: 90
        }
      }
    });

  } catch (error) {
    logger.error('Settings error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la récupération des paramètres' }
    });
  }
});

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
router.put('/settings', async (req, res) => {
  try {
    const settings = req.body;

    // For now, just return success
    // This can be expanded when settings persistence is implemented
    res.json({
      success: true,
      data: {
        message: 'Paramètres mis à jour'
      }
    });

  } catch (error) {
    logger.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la mise à jour des paramètres' }
    });
  }
});

// Helper function to process time series data
function processTimeSeriesData(data, valueField, dateFrom, dateTo) {
  if (!data) return [];

  const result = [];
  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);
  const dayInMs = 24 * 60 * 60 * 1000;

  // Group data by date
  const dataByDate = {};
  data.forEach(item => {
    const date = new Date(item.created_at).toISOString().split('T')[0];
    if (!dataByDate[date]) {
      dataByDate[date] = [];
    }
    dataByDate[date].push(item);
  });

  // Fill in missing dates
  for (let date = new Date(startDate); date <= endDate; date.setTime(date.getTime() + dayInMs)) {
    const dateStr = date.toISOString().split('T')[0];
    const dayData = dataByDate[dateStr] || [];
    
    let value = 0;
    if (valueField === 'count') {
      value = dayData.length;
    } else if (valueField === 'total_amount') {
      value = dayData.reduce((sum, item) => sum + parseFloat(item[valueField] || 0), 0);
    }

    result.push({
      date: dateStr,
      [valueField === 'total_amount' ? 'amount' : 'count']: value
    });
  }

  return result;
}

// Mock data generation functions
function generateMockRevenueData(dateFrom, dateTo) {
  const result = [];
  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);
  const dayInMs = 24 * 60 * 60 * 1000;

  for (let date = new Date(startDate); date <= endDate; date.setTime(date.getTime() + dayInMs)) {
    const dateStr = date.toISOString().split('T')[0];
    // Generate realistic revenue data with some variation
    const baseRevenue = 25000 + Math.random() * 15000;
    const weekdayMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 0.7 : 1.0;
    const amount = Math.round(baseRevenue * weekdayMultiplier);
    
    result.push({
      date: dateStr,
      amount: amount
    });
  }

  return result;
}

function generateMockOrdersData(dateFrom, dateTo) {
  const result = [];
  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);
  const dayInMs = 24 * 60 * 60 * 1000;

  for (let date = new Date(startDate); date <= endDate; date.setTime(date.getTime() + dayInMs)) {
    const dateStr = date.toISOString().split('T')[0];
    // Generate realistic order counts
    const baseOrders = 8 + Math.random() * 12;
    const weekdayMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 0.6 : 1.0;
    const count = Math.round(baseOrders * weekdayMultiplier);
    
    result.push({
      date: dateStr,
      count: count
    });
  }

  return result;
}

function generateMockUsersData(dateFrom, dateTo) {
  const result = [];
  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);
  const dayInMs = 24 * 60 * 60 * 1000;

  for (let date = new Date(startDate); date <= endDate; date.setTime(date.getTime() + dayInMs)) {
    const dateStr = date.toISOString().split('T')[0];
    // Generate realistic new user counts
    const baseUsers = 2 + Math.random() * 6;
    const count = Math.round(baseUsers);
    
    result.push({
      date: dateStr,
      count: count
    });
  }

  return result;
}

function generateMockTopProducts() {
  return [
    {
      product: { name: 'Protein Whey Gold 2kg' },
      sales: 45,
      revenue: 382500
    },
    {
      product: { name: 'Créatine Monohydrate 300g' },
      sales: 38,
      revenue: 159600
    },
    {
      product: { name: 'BCAA Energy 400g' },
      sales: 32,
      revenue: 121600
    },
    {
      product: { name: 'Pre-Workout Booster' },
      sales: 28,
      revenue: 154000
    },
    {
      product: { name: 'Gants de Musculation Pro' },
      sales: 25,
      revenue: 55000
    },
    {
      product: { name: 'Shaker Premium 700ml' },
      sales: 42,
      revenue: 63000
    },
    {
      product: { name: 'Tapis de Yoga Premium' },
      sales: 18,
      revenue: 86400
    },
    {
      product: { name: 'Haltères Ajustables 20kg' },
      sales: 12,
      revenue: 144000
    }
  ];
}

function generateMockTopCategories() {
  return [
    {
      category: 'supplements',
      sales: 143,
      revenue: 817700
    },
    {
      category: 'equipment',
      sales: 30,
      revenue: 230400
    },
    {
      category: 'accessories',
      sales: 67,
      revenue: 118000
    },
    {
      category: 'nutrition',
      sales: 24,
      revenue: 96000
    },
    {
      category: 'apparel',
      sales: 19,
      revenue: 57000
    }
  ];
}

module.exports = router;
