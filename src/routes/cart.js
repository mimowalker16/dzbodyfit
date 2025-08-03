const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { cache } = require('../config/redis');
const { logger } = require('../utils/logger');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Helper function to get session-based cart key
const getCartCacheKey = (userId, sessionId) => {
  return userId ? `cart:user:${userId}` : `cart:session:${sessionId}`;
};

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal: Math.round(subtotal),
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
    const sessionId = req.headers['x-session-id'] || req.headers['x-session-token'];

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        data: {
          cart: {
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
    const cacheKey = getCartCacheKey(userId, sessionId);
    const cachedCart = await cache.get(cacheKey);
    if (cachedCart) {
      return res.json({
        success: true,
        data: { cart: cachedCart },
        cached: true
      });
    }

    let cartItems = [];

    if (userId) {
      // Get cart items for authenticated user
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .select(`
          id,
          product_id,
          variant_id,
          quantity,
          unit_price,
          created_at,
          products!inner(
            id,
            name,
            name_ar,
            slug,
            sku,
            base_price,
            sale_price,
            stock_quantity,
            stock_status,
            weight,
            images
          )
        `)
        .eq('user_id', userId);

      if (error) {
        logger.error('Cart fetch error:', error);
        return res.status(500).json({
          success: false,
          error: { message: 'Erreur lors de la récupération du panier' }
        });
      }

      cartItems = data || [];
    } else {
      // For session-based carts, get from cache only
      cartItems = [];
    }

    // Process cart items
    const processedItems = cartItems.map(item => ({
      id: item.id,
      productId: item.product_id,
      variantId: item.variant_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      product: {
        id: item.products.id,
        name: item.products.name,
        nameAr: item.products.name_ar,
        slug: item.products.slug,
        sku: item.products.sku,
        basePrice: item.products.base_price,
        salePrice: item.products.sale_price,
        currentPrice: item.products.sale_price || item.products.base_price,
        stockQuantity: item.products.stock_quantity,
        stockStatus: item.products.stock_status,
        weight: item.products.weight,
        images: item.products.images || []
      },
      subtotal: item.unit_price * item.quantity,
      createdAt: item.created_at
    }));

    const cart = {
      items: processedItems,
      totals: calculateCartTotals(cartItems)
    };

    // Cache the cart for 5 minutes
    await cache.set(cacheKey, cart, 300);

    res.json({
      success: true,
      data: { cart }
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
  body('productId').isUUID().withMessage('ID de produit invalide'),
  body('variantId').optional().isUUID().withMessage('ID de variante invalide'),
  body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantité invalide (1-100)')
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

    const { productId, variantId, quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.headers['x-session-token'];

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Session ou authentification requise' }
      });
    }

    // Get product details to validate and get current price
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name, base_price, sale_price, stock_quantity, stock_status, status')
      .eq('id', productId)
      .eq('status', 'active')
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Produit non trouvé' }
      });
    }

    // Check stock availability
    if (product.stock_status === 'out_of_stock' || product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        error: { message: 'Stock insuffisant' }
      });
    }

    const currentPrice = product.sale_price || product.base_price;

    if (userId) {
      // For authenticated users, store in database
      // Check if item already exists in cart
      const { data: existingItem } = await supabaseAdmin
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('variant_id', variantId || null)
        .single();

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity;
        
        if (product.stock_quantity < newQuantity) {
          return res.status(400).json({
            success: false,
            error: { message: 'Quantité totale dépasse le stock disponible' }
          });
        }

        const { data: updatedItem, error: updateError } = await supabaseAdmin
          .from('cart_items')
          .update({
            quantity: newQuantity,
            unit_price: currentPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select('*')
          .single();

        if (updateError) {
          logger.error('Cart update error:', updateError);
          return res.status(500).json({
            success: false,
            error: { message: 'Erreur lors de la mise à jour du panier' }
          });
        }

        // Clear cache
        await cache.del(getCartCacheKey(userId, null));

        res.json({
          success: true,
          data: {
            message: 'Quantité mise à jour dans le panier',
            item: {
              id: updatedItem.id,
              quantity: updatedItem.quantity,
              unitPrice: updatedItem.unit_price
            }
          }
        });
      } else {
        // Add new item
        const { data: newItem, error: insertError } = await supabaseAdmin
          .from('cart_items')
          .insert([{
            user_id: userId,
            product_id: productId,
            variant_id: variantId || null,
            quantity,
            unit_price: currentPrice
          }])
          .select('*')
          .single();

        if (insertError) {
          logger.error('Cart add error:', insertError);
          return res.status(500).json({
            success: false,
            error: { message: 'Erreur lors de l\'ajout au panier' }
          });
        }

        // Clear cache
        await cache.del(getCartCacheKey(userId, null));

        res.status(201).json({
          success: true,
          data: {
            message: 'Produit ajouté au panier',
            item: {
              id: newItem.id,
              quantity: newItem.quantity,
              unitPrice: newItem.unit_price
            }
          }
        });
      }
    } else {
      // For session-based carts, store in cache only
      const cacheKey = getCartCacheKey(null, sessionId);
      let sessionCart = await cache.get(cacheKey) || { items: [], totals: { subtotal: 0, itemCount: 0, currency: 'DZD' } };
      
      // Find existing item in session cart
      const existingItemIndex = sessionCart.items.findIndex(item => 
        item.productId === productId && item.variantId === (variantId || null)
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        sessionCart.items[existingItemIndex].quantity += quantity;
        sessionCart.items[existingItemIndex].unitPrice = currentPrice;
        sessionCart.items[existingItemIndex].subtotal = sessionCart.items[existingItemIndex].quantity * currentPrice;
      } else {
        // Add new item
        const newItem = {
          id: uuidv4(),
          productId,
          variantId: variantId || null,
          quantity,
          unitPrice: currentPrice,
          product: {
            id: product.id,
            name: product.name,
            basePrice: product.base_price,
            salePrice: product.sale_price,
            currentPrice
          },
          subtotal: quantity * currentPrice,
          createdAt: new Date().toISOString()
        };
        sessionCart.items.push(newItem);
      }

      // Recalculate totals
      sessionCart.totals = calculateCartTotals(sessionCart.items);

      // Store in cache for 24 hours
      await cache.set(cacheKey, sessionCart, 86400);

      res.status(201).json({
        success: true,
        data: {
          message: 'Produit ajouté au panier',
          item: sessionCart.items[existingItemIndex >= 0 ? existingItemIndex : sessionCart.items.length - 1]
        }
      });
    }

  } catch (error) {
    logger.error('Add to cart error:', error);
    next(error);
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:id
// @access  Public (with session) / Private
router.put('/items/:id', [
  param('id').isUUID().withMessage('ID d\'item invalide'),
  body('quantity').isInt({ min: 0, max: 100 }).withMessage('Quantité invalide (0-100)')
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

    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.headers['x-session-token'];

    if (quantity === 0) {
      // Remove item if quantity is 0
      return router.handle({ method: 'DELETE', url: `/items/${id}`, ...req }, res, next);
    }

    if (userId) {
      // For authenticated users
      const { data: cartItem, error: fetchError } = await supabaseAdmin
        .from('cart_items')
        .select('*, products(stock_quantity, stock_status)')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError || !cartItem) {
        return res.status(404).json({
          success: false,
          error: { message: 'Item de panier non trouvé' }
        });
      }

      // Check stock
      if (cartItem.products.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          error: { message: 'Quantité demandée dépasse le stock disponible' }
        });
      }

      // Update quantity
      const { data: updatedItem, error: updateError } = await supabaseAdmin
        .from('cart_items')
        .update({
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        logger.error('Cart update error:', updateError);
        return res.status(500).json({
          success: false,
          error: { message: 'Erreur lors de la mise à jour' }
        });
      }

      // Clear cache
      await cache.del(getCartCacheKey(userId, null));

      res.json({
        success: true,
        data: {
          message: 'Quantité mise à jour',
          item: updatedItem
        }
      });
    } else {
      // For session-based carts
      const cacheKey = getCartCacheKey(null, sessionId);
      let sessionCart = await cache.get(cacheKey);
      
      if (!sessionCart) {
        return res.status(404).json({
          success: false,
          error: { message: 'Panier non trouvé' }
        });
      }

      const itemIndex = sessionCart.items.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          error: { message: 'Item de panier non trouvé' }
        });
      }

      // Update quantity
      sessionCart.items[itemIndex].quantity = quantity;
      sessionCart.items[itemIndex].subtotal = quantity * sessionCart.items[itemIndex].unitPrice;

      // Recalculate totals
      sessionCart.totals = calculateCartTotals(sessionCart.items);

      await cache.set(cacheKey, sessionCart, 86400);

      res.json({
        success: true,
        data: {
          message: 'Quantité mise à jour',
          item: sessionCart.items[itemIndex]
        }
      });
    }

  } catch (error) {
    logger.error('Update cart item error:', error);
    next(error);
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:id
// @access  Public (with session) / Private
router.delete('/items/:id', [
  param('id').isUUID().withMessage('ID d\'item invalide')
], optionalAuth, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'ID d\'item invalide',
          details: errors.array()
        }
      });
    }

    const { id } = req.params;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.headers['x-session-token'];

    if (userId) {
      // For authenticated users
      const { error } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        logger.error('Cart item delete error:', error);
        return res.status(500).json({
          success: false,
          error: { message: 'Erreur lors de la suppression' }
        });
      }

      // Clear cache
      await cache.del(getCartCacheKey(userId, null));

      res.json({
        success: true,
        data: { message: 'Item supprimé du panier' }
      });
    } else {
      // For session-based carts
      const cacheKey = getCartCacheKey(null, sessionId);
      let sessionCart = await cache.get(cacheKey);
      
      if (!sessionCart) {
        return res.status(404).json({
          success: false,
          error: { message: 'Panier non trouvé' }
        });
      }

      const itemIndex = sessionCart.items.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          error: { message: 'Item de panier non trouvé' }
        });
      }

      // Remove item
      sessionCart.items.splice(itemIndex, 1);

      // Recalculate totals
      sessionCart.totals = calculateCartTotals(sessionCart.items);

      await cache.set(cacheKey, sessionCart, 86400);

      res.json({
        success: true,
        data: { message: 'Item supprimé du panier' }
      });
    }

  } catch (error) {
    logger.error('Remove cart item error:', error);
    next(error);
  }
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Public (with session) / Private
router.delete('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] || req.headers['x-session-token'];

    if (userId) {
      // For authenticated users
      const { error } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) {
        logger.error('Cart clear error:', error);
        return res.status(500).json({
          success: false,
          error: { message: 'Erreur lors de la suppression du panier' }
        });
      }

      // Clear cache
      await cache.del(getCartCacheKey(userId, null));
    } else if (sessionId) {
      // For session-based carts
      await cache.del(getCartCacheKey(null, sessionId));
    }

    res.json({
      success: true,
      data: { message: 'Panier vidé avec succès' }
    });

  } catch (error) {
    logger.error('Clear cart error:', error);
    next(error);
  }
});

module.exports = router;
