const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const { logger } = require('../utils/logger');
const { upload } = require('../config/upload');

const router = express.Router();

// @desc    Health check endpoint
// @route   GET /api/test/health
// @access  Public
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ri.gym.pro API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// @desc    Test email configuration (public for testing)
// @route   GET /api/test/email-config-public
// @access  Public
router.get('/email-config-public', async (req, res) => {
  try {
    const config = {
      hasSmtpHost: !!process.env.SMTP_HOST,
      hasSmtpUser: !!process.env.SMTP_USER,
      hasSmtpPass: !!process.env.SMTP_PASS,
      hasFromEmail: !!process.env.FROM_EMAIL
    };

    // Test connection
    const connectionTest = await emailService.testConnection();

    res.json({
      success: true,
      data: {
        config,
        connectionTest: connectionTest ? 'Connected' : 'Failed',
        message: connectionTest ? 
          'Email service is configured and ready' : 
          'Email service configuration needs attention'
      }
    });

  } catch (error) {
    logger.error('Email config test error:', error);
    res.json({
      success: false,
      error: { message: 'Email service not configured or connection failed' }
    });
  }
});

// @desc    Test email configuration
// @route   GET /api/test/email-config
// @access  Admin
router.get('/email-config', protect, adminOnly, async (req, res) => {
  try {
    const config = {
      host: process.env.SMTP_HOST || 'Not configured',
      port: process.env.SMTP_PORT || 'Not configured',
      user: process.env.SMTP_USER || 'Not configured',
      fromEmail: process.env.FROM_EMAIL || 'Not configured',
      hasPassword: !!process.env.SMTP_PASS
    };

    // Test connection
    const connectionTest = await emailService.testConnection();

    res.json({
      success: true,
      data: {
        config,
        connectionTest: connectionTest ? 'Connected' : 'Failed',
        message: connectionTest ? 
          'Email service is configured and ready' : 
          'Email service configuration needs attention'
      }
    });

  } catch (error) {
    logger.error('Email config test error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors du test de configuration email' }
    });
  }
});

// @desc    Send test email
// @route   POST /api/test/send-email
// @access  Admin
router.post('/send-email', protect, adminOnly, async (req, res) => {
  try {
    const { to, subject = 'Test Email', message = 'This is a test email from ri.gym.pro' } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email destinataire requis' }
      });
    }

    // Create a test order data structure
    const testOrderData = {
      customer: {
        email: to,
        firstName: 'Test',
        lastName: 'User'
      },
      order: {
        orderNumber: 'TEST-' + Date.now(),
        status: 'confirmed',
        paymentMethod: 'cash_on_delivery',
        subtotal: 5000,
        shippingAmount: 400,
        totalAmount: 5400,
        createdAt: new Date().toISOString(),
        shippingAddress: {
          firstName: 'Test',
          lastName: 'User',
          addressLine1: '123 Test Street',
          city: 'Alger',
          stateProvince: 'Alger',
          phone: '+213555123456'
        }
      },
      items: [
        {
          productName: 'Test Product',
          quantity: 2,
          unitPrice: 2500,
          totalPrice: 5000
        }
      ]
    };

    await emailService.sendOrderConfirmation(testOrderData);

    res.json({
      success: true,
      message: `Email de test envoyé à ${to}`
    });

  } catch (error) {
    logger.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de l\'envoi de l\'email de test' }
    });
  }
});

// @desc    Send test email (public for testing)
// @route   POST /api/test/send-test-email
// @access  Public
router.post('/send-test-email', async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email address required' }
      });
    }

    // Create test order data for email
    const testOrderData = {
      customer: {
        email: to,
        firstName: 'Test',
        lastName: 'User'
      },
      order: {
        orderNumber: 'TEST-' + Date.now(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        totalAmount: 5000, // 50.00 DZD
        subtotal: 4500,
        shippingAmount: 500,
        paymentMethod: 'cash_on_delivery',
        shippingAddress: {
          firstName: 'Test',
          lastName: 'User',
          addressLine1: '123 Test Street',
          city: 'Algiers',
          stateProvince: 'Algiers',
          phone: '+213555123456'
        }
      },
      items: [
        {
          productName: 'Test Product - Protein Powder',
          quantity: 1,
          unitPrice: 4500,
          totalPrice: 4500
        }
      ]
    };

    // Send test order confirmation email
    await emailService.sendOrderConfirmation(testOrderData);

    res.json({
      success: true,
      message: `Test email sent successfully to ${to}`,
      data: {
        recipient: to,
        subject: 'Order Confirmation Test',
        orderNumber: testOrderData.order.orderNumber
      }
    });

  } catch (error) {
    logger.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to send test email: ' + error.message }
    });
  }
});

module.exports = router;
