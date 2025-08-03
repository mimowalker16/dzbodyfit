const express = require('express');
const { param, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { logger } = require('../utils/logger');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    logger.info('Getting wishlist for user:', req.user.id);
    
    // Try with proper join structure based on products table
    const { data: wishlistItems, error } = await supabaseAdmin
      .from('wishlist_items')
      .select(`
        id,
        product_id,
        created_at,
        products (
          id,
          name,
          base_price,
          sale_price,
          stock_quantity,
          stock_status,
          images,
          brands(name),
          categories(name)
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Wishlist fetch error:', error);
      logger.error('Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération de la liste de souhaits' }
      });
    }

    logger.info('Wishlist items found:', wishlistItems ? wishlistItems.length : 0);

    logger.info('Wishlist items found:', wishlistItems ? wishlistItems.length : 0);

    // Transform the data to match frontend expectations
    const processedItems = wishlistItems.map(item => ({
      id: item.id,
      productId: item.product_id,
      name: item.products?.name || 'Product Name',
      price: item.products?.sale_price || item.products?.base_price || 999,
      compareAtPrice: item.products?.sale_price ? item.products?.base_price : null,
      image: item.products?.images && item.products.images.length > 0 
        ? item.products.images[0] 
        : '/images/placeholder-product.jpg',
      inStock: item.products?.stock_status === 'in_stock',
      category: item.products?.categories?.name || item.products?.brands?.name || 'Produit',
      addedAt: item.created_at
    }));

    res.json({
      success: true,
      data: {
        items: processedItems,
        count: processedItems.length
      }
    });

  } catch (error) {
    logger.error('Get wishlist error:', error);
    next(error);
  }
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
router.post('/:productId', [
  param('productId').isUUID().withMessage('ID de produit invalide')
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

    const { productId } = req.params;

    // Check if product exists
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Produit non trouvé' }
      });
    }

    // Check if already in wishlist
    const { data: existingItem, error: checkError } = await supabaseAdmin
      .from('wishlist_items')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      logger.error('Wishlist check error:', checkError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la vérification' }
      });
    }

    if (existingItem) {
      return res.status(409).json({
        success: false,
        error: { message: 'Ce produit est déjà dans votre liste de souhaits' }
      });
    }

    // Add to wishlist
    const { data: newItem, error: insertError } = await supabaseAdmin
      .from('wishlist_items')
      .insert([{
        user_id: req.user.id,
        product_id: productId
      }])
      .select()
      .single();

    if (insertError) {
      logger.error('Wishlist insert error:', insertError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de l\'ajout à la liste de souhaits' }
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: newItem.id,
        message: 'Produit ajouté à la liste de souhaits'
      }
    });

  } catch (error) {
    logger.error('Add to wishlist error:', error);
    next(error);
  }
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete('/:productId', [
  param('productId').isUUID().withMessage('ID de produit invalide')
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

    const { productId } = req.params;

    const { error } = await supabaseAdmin
      .from('wishlist_items')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_id', productId);

    if (error) {
      logger.error('Wishlist delete error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la suppression de la liste de souhaits' }
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Produit supprimé de la liste de souhaits'
      }
    });

  } catch (error) {
    logger.error('Remove from wishlist error:', error);
    next(error);
  }
});

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
router.delete('/', protect, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('wishlist_items')
      .delete()
      .eq('user_id', req.user.id);

    if (error) {
      logger.error('Wishlist clear error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la suppression de la liste de souhaits' }
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Liste de souhaits vidée'
      }
    });

  } catch (error) {
    logger.error('Clear wishlist error:', error);
    next(error);
  }
});

module.exports = router;
