const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');
const { cache } = require('../config/redis');
const { logger } = require('../utils/logger');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Utility function to generate JWT tokens
const generateTokens = (userId) => {
  const payload = { id: userId };
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
  
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
  
  return { accessToken, refreshToken };
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('phone')
    .optional()
    .isMobilePhone('ar-DZ')
    .withMessage('Numéro de téléphone invalide (format algérien requis)')
], async (req, res, next) => {
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

    const { email, password, firstName, lastName, phone, marketingConsent = false } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'Un utilisateur avec cet email existe déjà' }
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([{
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone,
        role: 'customer',
        status: 'active'
      }])
      .select('id, email, first_name, last_name, phone, role, status, created_at')
      .single();

    if (error) {
      logger.error('User registration error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la création du compte' }
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Cache user data
    await cache.set(`user:${user.id}`, user, 3600); // 1 hour

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          role: user.role,
          status: user.status,
          createdAt: user.created_at
        },
        tokens: {
          accessToken,
          refreshToken
        }
      },
      message: 'Compte créé avec succès'
    });

  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis')
], async (req, res, next) => {
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

    const { email, password } = req.body;

    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Email ou mot de passe incorrect' }
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: { message: 'Compte désactivé ou suspendu' }
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Email ou mot de passe incorrect' }
      });
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Cache user data
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status
    };
    await cache.set(`user:${user.id}`, userData, 3600); // 1 hour

    res.json({
      success: true,
      data: {
        user: userData,
        tokens: {
          accessToken,
          refreshToken
        }
      },
      message: 'Connexion réussie'
    });

  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      phone: req.user.phone,
      role: req.user.role,
      status: req.user.status,
      emailVerified: req.user.email_verified,
      phoneVerified: req.user.phone_verified,
      marketingConsent: req.user.marketing_consent,
      createdAt: req.user.created_at
    };

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token requis')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Refresh token requis',
          details: errors.array()
        }
      });
    }

    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, phone, role, status, is_active')
      .eq('id', decoded.id)
      .single();

    if (error || !user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token invalide' }
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    res.json({
      success: true,
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });

  } catch (error) {
    logger.error('Refresh token error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Token invalide' }
      });
    }
    next(error);
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // Remove user from cache
    await cache.del(`user:${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la déconnexion' }
    });
  }
});

module.exports = router;
