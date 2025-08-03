const express = require('express');
const { body, param, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/supabase');
const { cache } = require('../config/redis');
const { logger } = require('../utils/logger');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      phone: req.user.phone,
      dateOfBirth: req.user.date_of_birth,
      gender: req.user.gender,
      emailVerified: req.user.email_verified,
      phoneVerified: req.user.phone_verified,
      createdAt: req.user.created_at,
      lastLogin: req.user.last_login
    };

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('phone')
    .optional()
    .isMobilePhone('ar-DZ')
    .withMessage('Numéro de téléphone invalide'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date de naissance invalide'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Genre invalide')
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
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender
    } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Aucune donnée à mettre à jour' }
      });
    }

    updateData.updated_at = new Date().toISOString();

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select('id, email, first_name, last_name, phone, date_of_birth, gender, updated_at')
      .single();

    if (error) {
      logger.error('User profile update error:', error);
      return res.status(500).json({
        success: false,
        error: { 
          message: 'Erreur lors de la mise à jour du profil',
          debug: error.message || error.toString()
        }
      });
    }

    // Clear user cache
    await cache.del(`user:${req.user.id}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          dateOfBirth: user.date_of_birth,
          gender: user.gender,
          marketingConsent: user.marketing_consent,
          updatedAt: user.updated_at
        }
      },
      message: 'Profil mis à jour avec succès'
    });

  } catch (error) {
    logger.error('Update user profile error:', error);
    next(error);
  }
});

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
router.put('/password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mot de passe actuel requis'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
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

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: { message: 'Mot de passe actuel incorrect' }
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id);

    if (error) {
      logger.error('Password update error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la mise à jour du mot de passe' }
      });
    }

    // Clear user cache
    await cache.del(`user:${req.user.id}`);

    res.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
});

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
router.get('/addresses', protect, async (req, res, next) => {
  try {
    const { data: addresses, error } = await supabaseAdmin
      .from('user_addresses')
      .select('*')
      .eq('user_id', req.user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Addresses fetch error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération des adresses' }
      });
    }

    const processedAddresses = addresses.map(address => ({
      id: address.id,
      type: address.type,
      firstName: address.first_name,
      lastName: address.last_name,
      company: address.company,
      addressLine1: address.address_line_1,
      addressLine2: address.address_line_2,
      city: address.city,
      stateProvince: address.state_province,
      postalCode: address.postal_code,
      country: address.country,
      phone: address.phone,
      isDefault: address.is_default,
      createdAt: address.created_at
    }));

    res.json({
      success: true,
      data: { addresses: processedAddresses }
    });

  } catch (error) {
    logger.error('Get addresses error:', error);
    next(error);
  }
});

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
router.post('/addresses', [
  body('type').isIn(['shipping', 'billing']).withMessage('Type d\'adresse invalide'),
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('Prénom invalide'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Nom invalide'),
  body('addressLine1').trim().isLength({ min: 5, max: 255 }).withMessage('Adresse invalide'),
  body('city').trim().isLength({ min: 2, max: 100 }).withMessage('Ville invalide'),
  body('stateProvince').trim().isLength({ min: 2, max: 100 }).withMessage('Wilaya invalide'),
  body('country').isLength({ min: 2, max: 2 }).withMessage('Code pays invalide'),
  body('phone').optional().isMobilePhone('ar-DZ').withMessage('Téléphone invalide')
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
      type,
      firstName,
      lastName,
      company,
      addressLine1,
      addressLine2,
      city,
      stateProvince,
      postalCode,
      country = 'DZ',
      phone,
      isDefault = false
    } = req.body;

    // If this is set as default, update other addresses
    if (isDefault) {
      await supabaseAdmin
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', req.user.id)
        .eq('type', type);
    }

    const { data: address, error } = await supabaseAdmin
      .from('user_addresses')
      .insert([{
        user_id: req.user.id,
        type,
        first_name: firstName,
        last_name: lastName,
        company,
        address_line_1: addressLine1,
        address_line_2: addressLine2,
        city,
        state_province: stateProvince,
        postal_code: postalCode,
        country,
        phone,
        is_default: isDefault
      }])
      .select('*')
      .single();

    if (error) {
      logger.error('Address creation error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de l\'ajout de l\'adresse' }
      });
    }

    res.status(201).json({
      success: true,
      data: {
        address: {
          id: address.id,
          type: address.type,
          firstName: address.first_name,
          lastName: address.last_name,
          company: address.company,
          addressLine1: address.address_line_1,
          addressLine2: address.address_line_2,
          city: address.city,
          stateProvince: address.state_province,
          postalCode: address.postal_code,
          country: address.country,
          phone: address.phone,
          isDefault: address.is_default,
          createdAt: address.created_at
        }
      },
      message: 'Adresse ajoutée avec succès'
    });

  } catch (error) {
    logger.error('Add address error:', error);
    next(error);
  }
});

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
router.put('/addresses/:id', [
  param('id').isUUID().withMessage('ID adresse invalide'),
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Prénom invalide'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Nom invalide'),
  body('addressLine1').optional().trim().isLength({ min: 5, max: 255 }).withMessage('Adresse invalide'),
  body('city').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Ville invalide'),
  body('stateProvince').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Wilaya invalide'),
  body('phone').optional().isMobilePhone('ar-DZ').withMessage('Téléphone invalide')
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

    const { id } = req.params;
    const {
      firstName,
      lastName,
      company,
      addressLine1,
      addressLine2,
      city,
      stateProvince,
      postalCode,
      phone,
      isDefault
    } = req.body;

    // Check if address belongs to user
    const { data: existingAddress, error: checkError } = await supabaseAdmin
      .from('user_addresses')
      .select('id, type')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError || !existingAddress) {
      return res.status(404).json({
        success: false,
        error: { message: 'Adresse non trouvée' }
      });
    }

    const updateData = {};
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (company !== undefined) updateData.company = company;
    if (addressLine1 !== undefined) updateData.address_line_1 = addressLine1;
    if (addressLine2 !== undefined) updateData.address_line_2 = addressLine2;
    if (city !== undefined) updateData.city = city;
    if (stateProvince !== undefined) updateData.state_province = stateProvince;
    if (postalCode !== undefined) updateData.postal_code = postalCode;
    if (phone !== undefined) updateData.phone = phone;
    if (isDefault !== undefined) updateData.is_default = isDefault;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Aucune donnée à mettre à jour' }
      });
    }

    // If setting as default, update other addresses
    if (isDefault) {
      await supabaseAdmin
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', req.user.id)
        .eq('type', existingAddress.type)
        .neq('id', id);
    }

    updateData.updated_at = new Date().toISOString();

    const { data: address, error } = await supabaseAdmin
      .from('user_addresses')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      logger.error('Address update error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la mise à jour de l\'adresse' }
      });
    }

    res.json({
      success: true,
      data: {
        address: {
          id: address.id,
          type: address.type,
          firstName: address.first_name,
          lastName: address.last_name,
          company: address.company,
          addressLine1: address.address_line_1,
          addressLine2: address.address_line_2,
          city: address.city,
          stateProvince: address.state_province,
          postalCode: address.postal_code,
          country: address.country,
          phone: address.phone,
          isDefault: address.is_default,
          updatedAt: address.updated_at
        }
      },
      message: 'Adresse mise à jour avec succès'
    });

  } catch (error) {
    logger.error('Update address error:', error);
    next(error);
  }
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
router.delete('/addresses/:id', [
  param('id').isUUID().withMessage('ID adresse invalide')
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

    // Check if address belongs to user
    const { data: address, error: checkError } = await supabaseAdmin
      .from('user_addresses')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError || !address) {
      return res.status(404).json({
        success: false,
        error: { message: 'Adresse non trouvée' }
      });
    }

    const { error } = await supabaseAdmin
      .from('user_addresses')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Address delete error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la suppression de l\'adresse' }
      });
    }

    res.json({
      success: true,
      message: 'Adresse supprimée avec succès'
    });

  } catch (error) {
    logger.error('Delete address error:', error);
    next(error);
  }
});

module.exports = router;
