const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { logger } = require('./utils/logger');
const { connectRedis } = require('./config/redis');
const { supabase } = require('./config/supabase');
const { initializeStorage } = require('./config/storage');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const brandsRoutes = require('./routes/brands');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const ordersMinimalRoutes = require('./routes/orders-minimal');
const adminOrderRoutes = require('./routes/admin-orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const adminExtendedRoutes = require('./routes/admin-extended');
const wishlistRoutes = require('./routes/wishlist');
const testRoutes = require('./routes/test');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard',
    message: 'Too many requests, please try again later'
  }
});

// Middleware
app.use(limiter);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://ri.gym.pro', 'https://www.ri.gym.pro']
    : true, // Allow all origins in development
  credentials: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Body parsing middleware - conditionally applied
app.use((req, res, next) => {
  // Skip JSON/URL parsing for multipart/form-data requests (let multer handle them)
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    console.log('Skipping body parsing for multipart request to:', req.url);
    return next();
  }
  
  // Apply JSON parsing for non-multipart requests
  express.json({ limit: '10mb' })(req, res, (err) => {
    if (err) return next(err);
    
    // Apply URL-encoded parsing
    express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    timezone: process.env.DEFAULT_TIMEZONE || 'Africa/Algiers'
  });
});

// API Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ri.gym.pro API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    timezone: process.env.DEFAULT_TIMEZONE || 'Africa/Algiers',
    services: {
      redis: !!global.redisClient,
      database: true
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orders', ordersMinimalRoutes);
app.use('/api/admin', adminOrderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminExtendedRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/test', testRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Initialize connections and start server
async function startServer() {
  try {
    // Test Supabase connection
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      if (error) {
        logger.warn('Supabase connection test failed:', error.message);
      } else {
        logger.info('✅ Supabase connected successfully');
      }
    } catch (err) {
      logger.warn('Supabase connection test failed, but continuing...');
    }

    // Connect to Redis (optional in development)
    try {
      await connectRedis();
    } catch (error) {
      logger.warn('⚠️ Redis connection failed, continuing without cache:', error.message);
    }

    // Initialize storage
    try {
      const storageInitialized = await initializeStorage();
      if (storageInitialized) {
        logger.info('✅ Storage initialized successfully');
      } else {
        logger.warn('⚠️ Storage initialization failed, product images may not work');
      }
    } catch (error) {
      logger.warn('⚠️ Storage initialization error:', error.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 ri.gym.pro API server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📍 Timezone: ${process.env.DEFAULT_TIMEZONE || 'Africa/Algiers'}`);
      logger.info(`💰 Currency: ${process.env.DEFAULT_CURRENCY || 'DZD'}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

module.exports = app;
