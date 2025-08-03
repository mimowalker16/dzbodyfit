const express = require('express');
const { query, param, body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { logger } = require('../utils/logger');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// @desc    Admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' });

    if (usersError) {
      logger.error('Error fetching users count:', usersError);
    }

    // Get total products
    const { count: totalProducts, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact' })
      .eq('status', 'active');

    if (productsError) {
      logger.error('Error fetching products count:', productsError);
    }

    // Get total orders
    const { count: totalOrders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact' });

    if (ordersError) {
      logger.error('Error fetching orders count:', ordersError);
    }

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

    const totalRevenue = revenueError ? 0 : 
      revenueData.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

    // Get today's stats
    const today = new Date().toISOString().split('T')[0];
    
    const { count: newUsersToday } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .gte('created_at', today);

    const { count: ordersToday } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact' })
      .gte('created_at', today);

    const { data: revenueTodayData } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .gte('created_at', today)
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

    const revenueToday = revenueTodayData ? 
      revenueTodayData.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) : 0;

    // Get low stock products
    const { count: lowStockProducts } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact' })
      .lt('stock_quantity', 10)
      .eq('status', 'active');

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalRevenue: totalRevenue || 0,
        newUsersToday: newUsersToday || 0,
        ordersToday: ordersToday || 0,
        revenueToday: revenueToday || 0,
        lowStockProducts: lowStockProducts || 0
      }
    });

  } catch (error) {
    logger.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la récupération des statistiques' }
    });
  }
});

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private (Admin)
router.get('/orders', async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Admin orders - À implémenter'
    }
  });
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite invalide'),
  query('role').optional().isIn(['customer', 'admin', 'super_admin']).withMessage('Rôle invalide'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Statut invalide'),
  query('search').optional().isString().withMessage('Recherche invalide')
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

    const {
      page = 1,
      limit = 20,
      role,
      status,
      search
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, phone, role, status, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Admin users fetch error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération des utilisateurs' }
      });
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        items: users.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          role: user.role,
          status: user.status,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: totalPages
        }
      }
    });

  } catch (error) {
    logger.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la récupération des utilisateurs' }
    });
  }
});

// @desc    Manage products (admin)
// @route   GET /api/admin/products
// @access  Private (Admin)
router.get('/products', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite invalide'),
  query('category').optional().isString().withMessage('Catégorie invalide'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Statut invalide'),
  query('search').optional().isString().withMessage('Recherche invalide')
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

    const {
      page = 1,
      limit = 20,
      category,
      status,
      search
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: products, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Admin products fetch error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération des produits' }
      });
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        items: products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          basePrice: product.base_price,
          salePrice: product.sale_price,
          sku: product.sku,
          category: product.category,
          brand: product.brand,
          images: product.images || [],
          stockQuantity: product.stock_quantity,
          stockStatus: product.stock_status,
          status: product.status,
          isFeatured: product.featured,
          weight: product.weight,
          dimensions: product.dimensions,
          nutritionalInfo: product.nutritional_info,
          tags: product.tags || [],
          rating: product.rating,
          reviewCount: product.review_count,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: totalPages
        }
      }
    });

  } catch (error) {
    logger.error('Admin products error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la récupération des produits' }
    });
  }
});

// @desc    Get single product (admin)
// @route   GET /api/admin/products/:id
// @access  Private (Admin)
router.get('/products/:id', [
  param('id').isUUID().withMessage('ID de produit invalide')
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

    const { id } = req.params;

    // Get product with all related data (no status filter for admin)
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        brands(id, name, slug, logo_url),
        categories(id, name, name_ar, slug)
      `)
      .eq('id', id)
      .single();

    if (error || !product) {
      logger.error('Admin single product fetch error:', error);
      return res.status(404).json({
        success: false,
        error: {
          message: 'Produit non trouvé'
        }
      });
    }

    // Transform the product data to match frontend expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      basePrice: product.base_price,
      salePrice: product.sale_price,
      stockQuantity: product.stock_quantity,
      category: product.category_id,
      brand: product.brand_id,
      status: product.status,
      isFeatured: product.featured || false,
      images: product.images || [],
      weight: product.weight,
      shortDescription: product.short_description || '',
      metaTitle: product.meta_title || '',
      metaDescription: product.meta_description || '',
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      brands: product.brands,
      categories: product.categories
    };

    res.json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    logger.error('Admin single product error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la récupération du produit' }
    });
  }
});

// @desc    Create new product (admin)
// @route   POST /api/admin/products
// @access  Private (Admin)
router.post('/products', [
  body('name').notEmpty().withMessage('Nom du produit requis'),
  body('sku').notEmpty().withMessage('SKU requis'),
  body('category').notEmpty().withMessage('Catégorie requise'),
  body('basePrice').isFloat({ min: 0 }).withMessage('Prix de base invalide'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Quantité en stock invalide')
], async (req, res) => {
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
      name,
      description,
      shortDescription,
      sku,
      category,
      brand,
      basePrice,
      salePrice,
      stockQuantity,
      stockStatus = 'in_stock',
      status = 'active',
      isFeatured = false,
      weight,
      images = [],
      seoTitle,
      seoDescription
    } = req.body;

    // Check if SKU already exists
    const { data: existingSku } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('sku', sku)
      .single();

    if (existingSku) {
      return res.status(400).json({
        success: false,
        error: { message: 'SKU déjà existant' }
      });
    }

    // Generate slug from name
    const generateSlug = (name) => {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    };

    // Prepare product data for insertion
    const productData = {
      name,
      slug: generateSlug(name),
      description: description || '',
      short_description: shortDescription || '',
      sku,
      category_id: category ? category : null,
      brand_id: brand ? brand : null,
      base_price: Number(basePrice),
      sale_price: salePrice ? Number(salePrice) : null,
      stock_quantity: Number(stockQuantity),
      stock_status: stockStatus,
      status,
      featured: Boolean(isFeatured),
      weight: weight ? Number(weight) : null,
      images: Array.isArray(images) ? images : [],
      meta_title: seoTitle || name,
      meta_description: seoDescription || description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert product
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      logger.error('Product creation error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la création du produit' }
      });
    }

    // Transform response to match frontend expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      shortDescription: product.short_description,
      sku: product.sku,
      basePrice: product.base_price,
      salePrice: product.sale_price,
      basePrice: product.base_price,
      salePrice: product.sale_price,
      stockQuantity: product.stock_quantity,
      stockStatus: product.stock_status,
      category: product.category_id,
      brand: product.brand_id,
      status: product.status,
      isFeatured: product.featured,
      images: product.images,
      weight: product.weight,
      tags: product.tags,
      seoTitle: product.meta_title,
      seoDescription: product.meta_description,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };

    logger.info(`Product created by admin: ${product.id}`, {
      userId: req.user.id,
      productName: product.name
    });

    res.status(201).json({
      success: true,
      data: transformedProduct
    });

  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la création du produit' }
    });
  }
});

// @desc    Update user role (admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
router.put('/users/:id/role', [
  param('id').isUUID().withMessage('ID utilisateur invalide'),
  body('role').isIn(['customer', 'admin', 'super_admin']).withMessage('Rôle invalide')
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

    const { id } = req.params;
    const { role } = req.body;

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('id', id)
      .single();

    if (fetchError || !existingUser) {
      return res.status(404).json({
        success: false,
        error: { message: 'Utilisateur non trouvé' }
      });
    }

    // Update user role
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      logger.error('User role update error:', updateError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la mise à jour du rôle' }
      });
    }

    res.json({
      success: true,
      data: {
        message: `Rôle utilisateur mis à jour vers ${role}`
      }
    });

  } catch (error) {
    logger.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la mise à jour du rôle' }
    });
  }
});

// @desc    Update user status (admin)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
router.put('/users/:id/status', [
  param('id').isUUID().withMessage('ID utilisateur invalide'),
  body('status').isIn(['active', 'inactive']).withMessage('Statut invalide')
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

    const { id } = req.params;
    const { status } = req.body;

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingUser) {
      return res.status(404).json({
        success: false,
        error: { message: 'Utilisateur non trouvé' }
      });
    }

    // Update user status
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      logger.error('User status update error:', updateError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la mise à jour du statut' }
      });
    }

    res.json({
      success: true,
      data: {
        message: `Statut utilisateur mis à jour vers ${status}`
      }
    });

  } catch (error) {
    logger.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la mise à jour du statut' }
    });
  }
});

// @desc    Delete product (admin)
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
router.delete('/products/:id', [
  param('id').isUUID().withMessage('ID de produit invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'ID de produit invalide',
          details: errors.array()
        }
      });
    }

    const { id } = req.params;

    // Get product to delete
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, name')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Produit non trouvé' }
      });
    }

    // Soft delete - set status to inactive
    const { error } = await supabaseAdmin
      .from('products')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      logger.error('Product deletion error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la suppression du produit' }
      });
    }

    logger.info(`Product deleted by admin: ${id}`, { 
      userId: req.user.id,
      productName: product.name 
    });

    res.json({
      success: true,
      data: { message: 'Produit supprimé avec succès' }
    });

  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur lors de la suppression du produit' }
    });
  }
});

// ===== BRANDS MANAGEMENT =====

// @desc    Get all brands for admin
// @route   GET /api/admin/brands
// @access  Private (Admin)
router.get('/brands', async (req, res) => {
  try {
    const { data: brands, error } = await supabaseAdmin
      .from('brands')
      .select('*')
      .order('name');

    if (error) {
      logger.error('Error fetching brands:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération des marques' }
      });
    }

    res.json({
      success: true,
      data: {
        brands: brands || [],
        total: brands?.length || 0
      }
    });
  } catch (error) {
    logger.error('Unexpected error in admin brands route:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur interne' }
    });
  }
});

// @desc    Get single brand
// @route   GET /api/admin/brands/:id
// @access  Private (Admin)
router.get('/brands/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: brand, error } = await supabaseAdmin
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !brand) {
      return res.status(404).json({
        success: false,
        error: { message: 'Marque non trouvée' }
      });
    }

    res.json({
      success: true,
      data: { brand }
    });
  } catch (error) {
    logger.error('Unexpected error in admin brand detail route:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur interne' }
    });
  }
});

// @desc    Create new brand
// @route   POST /api/admin/brands
// @access  Private (Admin)
router.post('/brands', [
  body('name').notEmpty().withMessage('Le nom de la marque est requis'),
  body('slug').notEmpty().withMessage('Le slug est requis'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Données invalides', details: errors.array() }
      });
    }

    const { name, slug, description, websiteUrl, isActive = true } = req.body;

    // Check if slug already exists
    const { data: existingBrand, error: existingError } = await supabaseAdmin
      .from('brands')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingBrand && !existingError) {
      return res.status(400).json({
        success: false,
        error: { message: 'Ce slug existe déjà' }
      });
    }

    const { data: newBrand, error } = await supabaseAdmin
      .from('brands')
      .insert([{
        name,
        slug,
        description: description || null,
        website_url: websiteUrl || null,
        is_active: isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      logger.error('Error creating brand:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la création de la marque' }
      });
    }

    logger.info(`Brand created: ${newBrand.name} (${newBrand.slug})`);

    res.status(201).json({
      success: true,
      data: {
        id: newBrand.id,
        brand: newBrand
      }
    });
  } catch (error) {
    logger.error('Unexpected error creating brand:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur interne' }
    });
  }
});

// @desc    Update brand
// @route   PUT /api/admin/brands/:id
// @access  Private (Admin)
router.put('/brands/:id', [
  param('id').isUUID().withMessage('ID de marque invalide'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Données invalides', details: errors.array() }
      });
    }

    const { id } = req.params;
    const { name, slug, description, websiteUrl, isActive, logoUrl } = req.body;

    // Check if brand exists
    const { data: existingBrand, error: existingError } = await supabaseAdmin
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();

    if (existingError || !existingBrand) {
      return res.status(404).json({
        success: false,
        error: { message: 'Marque non trouvée' }
      });
    }

    // If slug is being changed, check if new slug already exists
    if (slug && slug !== existingBrand.slug) {
      const { data: slugCheck, error: slugError } = await supabaseAdmin
        .from('brands')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (slugCheck && !slugError) {
        return res.status(400).json({
          success: false,
          error: { message: 'Ce slug existe déjà' }
        });
      }
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (websiteUrl !== undefined) updateData.website_url = websiteUrl;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (logoUrl !== undefined) updateData.logo_url = logoUrl;

    const { data: updatedBrand, error } = await supabaseAdmin
      .from('brands')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating brand:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la mise à jour de la marque' }
      });
    }

    logger.info(`Brand updated: ${updatedBrand.name} (${updatedBrand.slug})`);

    res.json({
      success: true,
      data: updatedBrand
    });
  } catch (error) {
    logger.error('Unexpected error updating brand:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur interne' }
    });
  }
});

// @desc    Delete brand
// @route   DELETE /api/admin/brands/:id
// @access  Private (Admin)
router.delete('/brands/:id', [
  param('id').isUUID().withMessage('ID de marque invalide'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Données invalides', details: errors.array() }
      });
    }

    const { id } = req.params;

    // Check if brand exists
    const { data: existingBrand, error: existingError } = await supabaseAdmin
      .from('brands')
      .select('name')
      .eq('id', id)
      .single();

    if (existingError || !existingBrand) {
      return res.status(404).json({
        success: false,
        error: { message: 'Marque non trouvée' }
      });
    }

    // Check if brand has products
    const { count: productCount, error: productError } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact' })
      .eq('brand_id', id);

    if (productError) {
      logger.error('Error checking brand products:', productError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la vérification des produits' }
      });
    }

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: { message: `Impossible de supprimer la marque car elle contient ${productCount} produit(s)` }
      });
    }

    const { error } = await supabaseAdmin
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting brand:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la suppression de la marque' }
      });
    }

    logger.info(`Brand deleted: ${existingBrand.name}`);

    res.json({
      success: true,
      message: 'Marque supprimée avec succès'
    });
  } catch (error) {
    logger.error('Unexpected error deleting brand:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur interne' }
    });
  }
});

// @desc    Upload brand logo
// @route   POST /api/admin/brands/:id/logo
// @access  Private (Admin)
router.post('/brands/:id/logo', [
  param('id').isUUID().withMessage('ID de marque invalide'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Données invalides', details: errors.array() }
      });
    }

    const { id } = req.params;

    // Check if brand exists
    const { data: existingBrand, error: existingError } = await supabaseAdmin
      .from('brands')
      .select('name, slug')
      .eq('id', id)
      .single();

    if (existingError || !existingBrand) {
      return res.status(404).json({
        success: false,
        error: { message: 'Marque non trouvée' }
      });
    }

    // For now, we'll just return a placeholder URL
    // In a real implementation, you'd handle file upload to Supabase storage
    const logoUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/brand-logos/${existingBrand.slug}-logo.jpg`;

    // Update brand with logo URL
    const { data: updatedBrand, error: updateError } = await supabaseAdmin
      .from('brands')
      .update({ 
        logo_url: logoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Error updating brand logo:', updateError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la mise à jour du logo' }
      });
    }

    logger.info(`Brand logo updated: ${existingBrand.name}`);

    res.json({
      success: true,
      data: {
        logoUrl: logoUrl,
        brand: updatedBrand
      }
    });
  } catch (error) {
    logger.error('Unexpected error uploading brand logo:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur interne' }
    });
  }
});

// @desc    Delete brand logo
// @route   DELETE /api/admin/brands/:id/logo
// @access  Private (Admin)
router.delete('/brands/:id/logo', [
  param('id').isUUID().withMessage('ID de marque invalide'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Données invalides', details: errors.array() }
      });
    }

    const { id } = req.params;

    // Check if brand exists
    const { data: existingBrand, error: existingError } = await supabaseAdmin
      .from('brands')
      .select('name')
      .eq('id', id)
      .single();

    if (existingError || !existingBrand) {
      return res.status(404).json({
        success: false,
        error: { message: 'Marque non trouvée' }
      });
    }

    // Remove logo URL from brand
    const { error: updateError } = await supabaseAdmin
      .from('brands')
      .update({ 
        logo_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Error removing brand logo:', updateError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la suppression du logo' }
      });
    }

    logger.info(`Brand logo deleted: ${existingBrand.name}`);

    res.json({
      success: true,
      message: 'Logo supprimé avec succès'
    });
  } catch (error) {
    logger.error('Unexpected error deleting brand logo:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur interne' }
    });
  }
});

module.exports = router;
