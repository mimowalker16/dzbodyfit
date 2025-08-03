const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { cache } = require('../config/redis');
const { logger } = require('../utils/logger');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Helper function to get or create cart
const getOrCreateCart = async (userId, sessionId) => {
  if (userId) {
    // For authenticated users
    let { data: cart, error } = await supabaseAdmin
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !cart) {
      // Create new cart
      const { data: newCart, error: createError } = await supabaseAdmin
        .from('cart')
        .insert([{
          user_id: userId,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }])
        .select('*')
        .single();

      if (createError) {
        throw new Error('Erreur lors de la création du panier');
      }
      cart = newCart;
    }

    return cart;
  } else if (sessionId) {
    // For guest users
    let { data: cart, error } = await supabaseAdmin
      .from('cart')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error || !cart) {
      // Create new cart
      const { data: newCart, error: createError } = await supabaseAdmin
        .from('cart')
        .insert([{
          session_id: sessionId,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }])
        .select('*')
        .single();

      if (createError) {
        throw new Error('Erreur lors de la création du panier');
      }
      cart = newCart;
    }

    return cart;
  }

  throw new Error('ID utilisateur ou session requis');
};

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    itemCount,
    currency: 'DZD'
  };
};

// @desc    Get cart contents
// @route   GET /api/cart
// @access  Public (with session) / Private
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        data: {
          cart: {
            id: null,
            items: [],
            totals: {
              subtotal: 0,
              itemCount: 0,
              currency: 'DZD'
            }
          }
        }
      });
    }

    // Check cache first
    const cacheKey = `cart:${userId || sessionId}`;
    const cachedCart = await cache.get(cacheKey);
    if (cachedCart) {
      return res.json({
        success: true,
        data: { cart: cachedCart },
        cached: true
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // Get cart items with product details
    const { data: cartItems, error } = await supabaseAdmin
      .from('cart_items')
      .select(`
        id,
        product_id,
        variation_id,
        quantity,
        price,
        created_at,
        products!inner(
          id,
          name,
          slug,
          sku,
          stock_quantity,
          stock_status,
          weight,
          product_media!inner(url, alt_text, is_featured)
        ),
        product_variations(
          id,
          sku,
          stock_quantity,
          stock_status,
          weight,
          product_variation_attributes(
            product_attributes(name, type),
            product_attribute_values(value)
          )
        )
      `)
      .eq('cart_id', cart.id)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Cart items fetch error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération du panier' }
      });
    }

    // Process cart items
    const processedItems = cartItems.map(item => {
      const product = item.products;
      const variation = item.product_variations;
      const featuredImage = product.product_media?.find(media => media.is_featured) 
        || product.product_media?.[0];

      return {
        id: item.id,
        productId: item.product_id,
        variationId: item.variation_id,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: variation?.sku || product.sku,
          stockQuantity: variation?.stock_quantity || product.stock_quantity,
          stockStatus: variation?.stock_status || product.stock_status,
          weight: variation?.weight || product.weight,
          image: featuredImage ? {
            url: featuredImage.url,
            altText: featuredImage.alt_text
          } : null
        },
        variation: variation ? {
          id: variation.id,
          sku: variation.sku,
          attributes: variation.product_variation_attributes?.map(attr => ({
            name: attr.product_attributes.name,
            type: attr.product_attributes.type,
            value: attr.product_attribute_values.value
          })) || []
        } : null,
        total: Math.round(item.price * item.quantity * 100) / 100
      };
    });

    const totals = calculateCartTotals(processedItems);

    const cartData = {
      id: cart.id,
      items: processedItems,
      totals,
      expiresAt: cart.expires_at,
      updatedAt: cart.updated_at
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, cartData, 300);

    res.json({
      success: true,
      data: { cart: cartData }
    });

  } catch (error) {
    logger.error('Get cart error:', error);
    next(error);
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Public (with session) / Private
router.post('/items', [
  body('productId').isUUID().withMessage('ID produit invalide'),
  body('variationId').optional().isUUID().withMessage('ID variation invalide'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantité doit être entre 1 et 10')
], optionalAuth, async (req, res, next) => {
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

    const { productId, variationId, quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || uuidv4();

    // Validate product exists and is available
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, sale_price, stock_quantity, stock_status, manage_stock')
      .eq('id', productId)
      .eq('status', 'active')
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Produit non trouvé' }
      });
    }

    let variation = null;
    let currentPrice = product.sale_price || product.price;
    let availableStock = product.stock_quantity;

    // If variation is specified, validate it
    if (variationId) {
      const { data: variationData, error: variationError } = await supabaseAdmin
        .from('product_variations')
        .select('id, price, sale_price, stock_quantity, stock_status, is_active')
        .eq('id', variationId)
        .eq('product_id', productId)
        .eq('is_active', true)
        .single();

      if (variationError || !variationData) {
        return res.status(404).json({
          success: false,
          error: { message: 'Variation de produit non trouvée' }
        });
      }

      variation = variationData;
      currentPrice = variation.sale_price || variation.price || currentPrice;
      availableStock = variation.stock_quantity;
    }

    // Check stock availability
    if (product.manage_stock && availableStock < quantity) {
      return res.status(400).json({
        success: false,
        error: { message: 'Stock insuffisant' }
      });
    }

    // Get or create cart
    const cart = await getOrCreateCart(userId, sessionId);

    // Check if item already exists in cart
    const { data: existingItem } = await supabaseAdmin
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .eq('variation_id', variationId || null)
      .single();

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;

      // Check stock for new quantity
      if (product.manage_stock && availableStock < newQuantity) {
        return res.status(400).json({
          success: false,
          error: { message: 'Stock insuffisant pour cette quantité' }
        });
      }

      const { data: updatedItem, error: updateError } = await supabaseAdmin
        .from('cart_items')
        .update({
          quantity: newQuantity,
          price: currentPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select('*')
        .single();

      if (updateError) {
        logger.error('Cart item update error:', updateError);
        return res.status(500).json({
          success: false,
          error: { message: 'Erreur lors de la mise à jour du panier' }
        });
      }
    } else {
      // Add new item
      const { data: newItem, error: insertError } = await supabaseAdmin
        .from('cart_items')
        .insert([{
          cart_id: cart.id,
          product_id: productId,
          variation_id: variationId,
          quantity,
          price: currentPrice
        }])
        .select('*')
        .single();

      if (insertError) {
        logger.error('Cart item insert error:', insertError);
        return res.status(500).json({
          success: false,
          error: { message: 'Erreur lors de l\'ajout au panier' }
        });
      }
    }

    // Update cart timestamp
    await supabaseAdmin
      .from('cart')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', cart.id);

    // Clear cache
    await cache.del(`cart:${userId || sessionId}`);

    res.status(201).json({
      success: true,
      message: 'Produit ajouté au panier',
      data: {
        sessionId: !userId ? sessionId : undefined
      }
    });

  } catch (error) {
    logger.error('Add to cart error:', error);
    next(error);
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Public (with session) / Private
router.put('/items/:itemId', [
  param('itemId').isUUID().withMessage('ID article invalide'),
  body('quantity').isInt({ min: 0, max: 10 }).withMessage('Quantité doit être entre 0 et 10')
], optionalAuth, async (req, res, next) => {
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

    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    // Get cart item with ownership verification
    const { data: cartItem, error: itemError } = await supabaseAdmin
      .from('cart_items')
      .select(`
        *,
        cart!inner(id, user_id, session_id),
        products!inner(id, stock_quantity, manage_stock),
        product_variations(id, stock_quantity)
      `)
      .eq('id', itemId)
      .single();

    if (itemError || !cartItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Article du panier non trouvé' }
      });
    }

    // Verify ownership
    const cart = cartItem.cart;
    if ((userId && cart.user_id !== userId) || (!userId && cart.session_id !== sessionId)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Accès non autorisé' }
      });
    }

    // If quantity is 0, delete the item
    if (quantity === 0) {
      const { error: deleteError } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (deleteError) {
        logger.error('Cart item delete error:', deleteError);
        return res.status(500).json({
          success: false,
          error: { message: 'Erreur lors de la suppression de l\'article' }
        });
      }
    } else {
      // Check stock availability
      const product = cartItem.products;
      const variation = cartItem.product_variations;
      const availableStock = variation?.stock_quantity || product.stock_quantity;

      if (product.manage_stock && availableStock < quantity) {
        return res.status(400).json({
          success: false,
          error: { message: 'Stock insuffisant' }
        });
      }

      // Update quantity
      const { error: updateError } = await supabaseAdmin
        .from('cart_items')
        .update({
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (updateError) {
        logger.error('Cart item update error:', updateError);
        return res.status(500).json({
          success: false,
          error: { message: 'Erreur lors de la mise à jour' }
        });
      }
    }

    // Update cart timestamp
    await supabaseAdmin
      .from('cart')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', cart.id);

    // Clear cache
    await cache.del(`cart:${userId || sessionId}`);

    res.json({
      success: true,
      message: quantity === 0 ? 'Article supprimé du panier' : 'Quantité mise à jour'
    });

  } catch (error) {
    logger.error('Update cart item error:', error);
    next(error);
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Public (with session) / Private
router.delete('/items/:itemId', [
  param('itemId').isUUID().withMessage('ID article invalide')
], optionalAuth, async (req, res, next) => {
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

    const { itemId } = req.params;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    // Get cart item with ownership verification
    const { data: cartItem, error: itemError } = await supabaseAdmin
      .from('cart_items')
      .select(`
        id,
        cart!inner(id, user_id, session_id)
      `)
      .eq('id', itemId)
      .single();

    if (itemError || !cartItem) {
      return res.status(404).json({
        success: false,
        error: { message: 'Article du panier non trouvé' }
      });
    }

    // Verify ownership
    const cart = cartItem.cart;
    if ((userId && cart.user_id !== userId) || (!userId && cart.session_id !== sessionId)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Accès non autorisé' }
      });
    }

    // Delete the item
    const { error: deleteError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) {
      logger.error('Cart item delete error:', deleteError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la suppression' }
      });
    }

    // Update cart timestamp
    await supabaseAdmin
      .from('cart')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', cart.id);

    // Clear cache
    await cache.del(`cart:${userId || sessionId}`);

    res.json({
      success: true,
      message: 'Article supprimé du panier'
    });

  } catch (error) {
    logger.error('Remove cart item error:', error);
    next(error);
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Public (with session) / Private
router.delete('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Session ou utilisateur requis' }
      });
    }

    // Get cart
    const { data: cart, error: cartError } = await supabaseAdmin
      .from('cart')
      .select('id')
      .eq(userId ? 'user_id' : 'session_id', userId || sessionId)
      .single();

    if (cartError || !cart) {
      return res.json({
        success: true,
        message: 'Panier déjà vide'
      });
    }

    // Delete all cart items
    const { error: deleteError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (deleteError) {
      logger.error('Cart clear error:', deleteError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la suppression du panier' }
      });
    }

    // Clear cache
    await cache.del(`cart:${userId || sessionId}`);

    res.json({
      success: true,
      message: 'Panier vidé'
    });

  } catch (error) {
    logger.error('Clear cart error:', error);
    next(error);
  }
});

// @desc    Get cart summary (for mini cart)
// @route   GET /api/cart/summary
// @access  Public (with session) / Private
router.get('/summary', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        data: {
          itemCount: 0,
          subtotal: 0,
          currency: 'DZD'
        }
      });
    }

    // Check cache first
    const cacheKey = `cart:summary:${userId || sessionId}`;
    const cachedSummary = await cache.get(cacheKey);
    if (cachedSummary) {
      return res.json({
        success: true,
        data: cachedSummary,
        cached: true
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // Get cart summary
    const { data: items, error } = await supabaseAdmin
      .from('cart_items')
      .select('quantity, price')
      .eq('cart_id', cart.id);

    if (error) {
      logger.error('Cart summary fetch error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération du résumé' }
      });
    }

    const totals = calculateCartTotals(items || []);

    // Cache for 2 minutes
    await cache.set(cacheKey, totals, 120);

    res.json({
      success: true,
      data: totals
    });

  } catch (error) {
    logger.error('Get cart summary error:', error);
    next(error);
  }
});

module.exports = router;
