const express = require('express');
const { query, param, body, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { cache } = require('../config/redis');
const { logger } = require('../utils/logger');
const { optionalAuth, protect, authorize } = require('../middleware/auth');
const { upload, processUploadedFiles } = require('../config/upload');
const { uploadProductImage, deleteProductImage } = require('../config/storage');

const router = express.Router();

// @desc    Test upload endpoint (without multer for debugging)
// @route   POST /api/products/:id/image-test
// @access  Private (Admin/Manager/Super Admin)
router.post('/:id/image-test', 
  protect, 
  authorize('admin', 'manager', 'super_admin'),
  [
    param('id').isUUID().withMessage('ID de produit invalide')
  ],
  async (req, res, next) => {
    try {
      console.log('Test endpoint reached:', {
        id: req.params.id,
        headers: req.headers,
        body: req.body,
        contentType: req.headers['content-type']
      });
      
      res.json({
        success: true,
        data: {
          message: 'Test endpoint reached successfully',
          receivedData: {
            id: req.params.id,
            contentType: req.headers['content-type'],
            bodyKeys: Object.keys(req.body),
            hasFile: !!req.file
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Upload product image
// @route   POST /api/products/:id/image
// @access  Private (Admin/Manager/Super Admin)
router.post('/:id/image', 
  protect, 
  authorize('admin', 'manager', 'super_admin'),
  upload.single('image'),
  [
    param('id').isUUID().withMessage('ID de produit invalide')
  ],
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Aucune image fournie'
          }
        });
      }

      const { id } = req.params;

      // Get existing product to verify it exists
      const { data: existingProduct, error: fetchError } = await supabaseAdmin
        .from('products')
        .select('id, images')
        .eq('id', id)
        .single();

      if (fetchError || !existingProduct) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Produit non trouvé'
          }
        });
      }

      // Upload image
      const uploadResult = await uploadProductImage(req.file, id);

      if (uploadResult.error) {
        return res.status(500).json({
          success: false,
          error: {
            message: 'Erreur lors du téléchargement de l\'image',
            details: uploadResult.error.message
          }
        });
      }

      // Add new image URL to product's images array
      const images = existingProduct.images || [];
      images.push(uploadResult.url);

      // Update product with new image URL
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ images })
        .eq('id', id);

      if (updateError) {
        return res.status(500).json({
          success: false,
          error: {
            message: 'Erreur lors de la mise à jour du produit',
            details: updateError.message
          }
        });
      }

      res.status(200).json({
        success: true,
        data: {
          url: uploadResult.url
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite doit être entre 1 et 100'),
  query('category').optional().isUUID().withMessage('ID de catégorie invalide'),
  query('brand').optional().isUUID().withMessage('ID de marque invalide'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Prix minimum invalide'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Prix maximum invalide'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Terme de recherche invalide'),
  query('sort').optional().isIn(['name', 'price', 'created_at', 'featured']).withMessage('Tri invalide'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Ordre invalide')
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

    const {
      page = 1,
      limit = 20,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sort = 'created_at',
      order = 'desc',
      featured,
      new: isNew
    } = req.query;

    const offset = (page - 1) * limit;

    // Build cache key
    const cacheKey = `products:${JSON.stringify(req.query)}`;
    
    // Check cache first
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    // Build query
    let query = supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        name_ar,
        slug,
        short_description,
        short_description_ar,
        sku,
        base_price,
        sale_price,
        stock_quantity,
        stock_status,
        featured,
        status,
        images,
        meta_title,
        meta_description,
        created_at,
        brands(id, name, slug),
        categories(id, name, name_ar, slug)
      `)
      .eq('status', 'active');

    // Apply sorting based on sort parameter
    if (sort === 'price') {
      query = query.order('base_price', { ascending: order === 'asc' });
    } else if (sort === 'name') {
      query = query.order('name', { ascending: order === 'asc' });
    } else if (sort === 'featured') {
      query = query.order('featured', { ascending: order === 'asc' });
    } else {
      query = query.order(sort, { ascending: order === 'asc' });
    }

    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }

    if (brand) {
      query = query.eq('brand_id', brand);
    }

    if (minPrice) {
      query = query.gte('base_price', minPrice);
    }

    if (maxPrice) {
      query = query.lte('base_price', maxPrice);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%,short_description.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    // Execute query with pagination
    const { data: products, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Products fetch error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération des produits' }
      });
    }

    // Process products data
    const processedProducts = products.map(product => {
      const currentPrice = product.sale_price || product.base_price;
      const discountPercentage = product.sale_price 
        ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
        : 0;

      return {
        id: product.id,
        name: product.name,
        nameAr: product.name_ar,
        slug: product.slug,
        shortDescription: product.short_description,
        shortDescriptionAr: product.short_description_ar,
        sku: product.sku,
        basePrice: product.base_price,
        salePrice: product.sale_price,
        currentPrice,
        discountPercentage,
        stockQuantity: product.stock_quantity,
        stockStatus: product.stock_status,
        featured: product.featured,
        brand: product.brands,
        category: product.categories,
        images: product.images || [],
        metaTitle: product.meta_title,
        metaDescription: product.meta_description,
        createdAt: product.created_at
      };
    });

    const result = {
      items: processedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };

    // Cache the result for 5 minutes
    await cache.set(cacheKey, result, 300);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Get products error:', error);
    next(error);
  }
});

// @desc    Search products with advanced filters
// @route   GET /api/products/search
// @access  Public
router.get('/search', [
  query('q').optional().isLength({ min: 2, max: 100 }).withMessage('Terme de recherche doit contenir entre 2 et 100 caractères'),
  query('category').optional().isUUID().withMessage('ID de catégorie invalide'),
  query('brand').optional().isUUID().withMessage('ID de marque invalide'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Prix minimum invalide'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Prix maximum invalide'),
  query('inStock').optional().isBoolean().withMessage('Stock disponible doit être vrai ou faux'),
  query('featured').optional().isBoolean().withMessage('Produits vedette doit être vrai ou faux'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite doit être entre 1 et 50'),
  query('sort').optional().isIn(['name', 'price', 'created_at', 'popularity']).withMessage('Tri invalide'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Ordre invalide')
], optionalAuth, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Paramètres de recherche invalides',
          details: errors.array()
        }
      });
    }

    const {
      q: searchTerm,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      featured,
      page = 1,
      limit = 20,
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    // Build cache key
    const cacheKey = `products:search:${JSON.stringify(req.query)}`;
    
    // Check cache first
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    // Build query
    let query = supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        name_ar,
        slug,
        short_description,
        short_description_ar,
        sku,
        base_price,
        sale_price,
        stock_quantity,
        stock_status,
        featured,
        images,
        created_at,
        brands(id, name, slug),
        categories(id, name, name_ar, slug)
      `, { count: 'exact' })
      .eq('status', 'active');

    // Apply search term
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,name_ar.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%,short_description_ar.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
    }

    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }

    if (brand) {
      query = query.eq('brand_id', brand);
    }

    if (minPrice) {
      query = query.gte('base_price', minPrice);
    }

    if (maxPrice) {
      query = query.lte('base_price', maxPrice);
    }

    if (inStock === 'true') {
      query = query.in('stock_status', ['in_stock', 'low_stock']);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    // Apply sorting
    if (sort === 'price') {
      query = query.order('base_price', { ascending: order === 'asc' });
    } else if (sort === 'name') {
      query = query.order('name', { ascending: order === 'asc' });
    } else {
      query = query.order(sort, { ascending: order === 'asc' });
    }

    // Execute query with pagination
    const { data: products, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Products search error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la recherche des produits' }
      });
    }

    // Process products data
    const processedProducts = products.map(product => {
      const currentPrice = product.sale_price || product.base_price;
      const discountPercentage = product.sale_price 
        ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
        : 0;

      return {
        id: product.id,
        name: product.name,
        nameAr: product.name_ar,
        slug: product.slug,
        shortDescription: product.short_description,
        shortDescriptionAr: product.short_description_ar,
        sku: product.sku,
        basePrice: product.base_price,
        salePrice: product.sale_price,
        currentPrice,
        discountPercentage,
        stockQuantity: product.stock_quantity,
        stockStatus: product.stock_status,
        featured: product.featured,
        brand: product.brands,
        category: product.categories,
        images: product.images || [],
        createdAt: product.created_at
      };
    });

    const result = {
      products: processedProducts,
      searchTerm,
      filters: {
        category,
        brand,
        minPrice,
        maxPrice,
        inStock,
        featured
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };

    // Cache the result for 3 minutes (shorter cache for search results)
    await cache.set(cacheKey, result, 180);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Search products error:', error);
    next(error);
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', optionalAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    // Check cache first
    const cacheKey = `products:featured:${limit}`;
    const cachedProducts = await cache.get(cacheKey);
    if (cachedProducts) {
      return res.json({
        success: true,
        data: { products: cachedProducts },
        cached: true
      });
    }

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        name_ar,
        slug,
        short_description,
        short_description_ar,
        sku,
        base_price,
        sale_price,
        stock_status,
        images,
        brands(id, name, slug)
      `)
      .eq('status', 'active')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Featured products fetch error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération des produits en vedette' }
      });
    }

    const processedProducts = products.map(product => {
      return {
        id: product.id,
        name: product.name,
        nameAr: product.name_ar,
        slug: product.slug,
        description: product.short_description,
        shortDescription: product.short_description,
        shortDescriptionAr: product.short_description_ar,
        sku: product.sku,
        price: product.sale_price || product.base_price,
        compareAtPrice: product.sale_price ? product.base_price : null,
        discountPercentage: product.sale_price 
          ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
          : 0,
        stockStatus: product.stock_status,
        stockQuantity: product.stock_status === 'in_stock' ? 10 : product.stock_status === 'low_stock' ? 3 : 0,
        isFeatured: true, // Since this is the featured products endpoint
        category: product.brands?.name || 'Supplément',
        brand: product.brands,
        images: product.images || []
      };
    });

    // Cache for 5 minutes
    await cache.set(cacheKey, processedProducts, 300);

    res.json({
      success: true,
      data: { products: processedProducts }
    });

  } catch (error) {
    logger.error('Get featured products error:', error);
    next(error);
  }
});

// @desc    Get new products (recently added)
// @route   GET /api/products/new
// @access  Public
router.get('/new', optionalAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    // Check cache first
    const cacheKey = `products:new:${limit}`;
    const cachedProducts = await cache.get(cacheKey);
    if (cachedProducts) {
      return res.json({
        success: true,
        data: { products: cachedProducts },
        cached: true
      });
    }

    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        name_ar,
        slug,
        short_description,
        short_description_ar,
        sku,
        base_price,
        sale_price,
        stock_status,
        images,
        created_at,
        brands(id, name, slug)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('New products fetch error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération des nouveaux produits' }
      });
    }

    const processedProducts = products.map(product => {
      return {
        id: product.id,
        name: product.name,
        nameAr: product.name_ar,
        slug: product.slug,
        shortDescription: product.short_description,
        shortDescriptionAr: product.short_description_ar,
        sku: product.sku,
        basePrice: product.base_price,
        salePrice: product.sale_price,
        currentPrice: product.sale_price || product.base_price,
        discountPercentage: product.sale_price 
          ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
          : 0,
        stockStatus: product.stock_status,
        brand: product.brands,
        images: product.images || [],
        createdAt: product.created_at
      };
    });

    // Cache for 5 minutes
    await cache.set(cacheKey, processedProducts, 300);

    res.json({
      success: true,
      data: { products: processedProducts }
    });

  } catch (error) {
    logger.error('Get new products error:', error);
    next(error);
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/id/:id
// @access  Public
router.get('/id/:id', [
  param('id').isUUID().withMessage('ID de produit invalide')
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

    const { id } = req.params;

    // Check cache first
    const cacheKey = `product_id:${id}`;
    const cachedProduct = await cache.get(cacheKey);
    if (cachedProduct) {
      return res.json({
        success: true,
        data: { product: cachedProduct },
        cached: true
      });
    }

    // Get product with all related data
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        brands(id, name, slug, logo_url),
        categories(id, name, name_ar, slug)
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Produit non trouvé' }
      });
    }

    // Process product data
    const processedProduct = {
      id: product.id,
      name: product.name,
      nameAr: product.name_ar,
      slug: product.slug,
      description: product.description,
      descriptionAr: product.description_ar,
      shortDescription: product.short_description,
      shortDescriptionAr: product.short_description_ar,
      sku: product.sku,
      basePrice: product.base_price,
      salePrice: product.sale_price,
      currentPrice: product.sale_price || product.base_price,
      discountPercentage: product.sale_price 
        ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
        : 0,
      stockQuantity: product.stock_quantity,
      stockStatus: product.stock_status,
      featured: product.featured,
      weight: product.weight,
      dimensions: product.dimensions,
      servingSize: product.serving_size,
      servingsPerContainer: product.servings_per_container,
      ingredients: product.ingredients,
      ingredientsAr: product.ingredients_ar,
      nutritionalInfo: product.nutritional_info,
      allergenInfo: product.allergen_info,
      allergenInfoAr: product.allergen_info_ar,
      usageInstructions: product.usage_instructions,
      usageInstructionsAr: product.usage_instructions_ar,
      warnings: product.warnings,
      warningsAr: product.warnings_ar,
      brand: product.brands,
      category: product.categories,
      images: product.images || [],
      seo: {
        metaTitle: product.meta_title,
        metaDescription: product.meta_description
      },
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };

    // Cache the product for 10 minutes
    await cache.set(cacheKey, processedProduct, 600);

    res.json({
      success: true,
      data: { product: processedProduct }
    });

  } catch (error) {
    logger.error('Get product by ID error:', error);
    next(error);
  }
});

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
router.get('/:slug', [
  param('slug').isSlug().withMessage('Slug invalide')
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

    const { slug } = req.params;

    // Check cache first
    const cacheKey = `product:${slug}`;
    const cachedProduct = await cache.get(cacheKey);
    if (cachedProduct) {
      return res.json({
        success: true,
        data: { product: cachedProduct },
        cached: true
      });
    }

    // Get product with all related data
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        brands(id, name, slug, logo_url),
        categories(id, name, name_ar, slug)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Produit non trouvé' }
      });
    }

    // Process product data
    const processedProduct = {
      id: product.id,
      name: product.name,
      nameAr: product.name_ar,
      slug: product.slug,
      description: product.description,
      descriptionAr: product.description_ar,
      shortDescription: product.short_description,
      shortDescriptionAr: product.short_description_ar,
      sku: product.sku,
      basePrice: product.base_price,
      salePrice: product.sale_price,
      currentPrice: product.sale_price || product.base_price,
      discountPercentage: product.sale_price 
        ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
        : 0,
      stockQuantity: product.stock_quantity,
      stockStatus: product.stock_status,
      featured: product.featured,
      weight: product.weight,
      dimensions: product.dimensions,
      servingSize: product.serving_size,
      servingsPerContainer: product.servings_per_container,
      ingredients: product.ingredients,
      ingredientsAr: product.ingredients_ar,
      nutritionalInfo: product.nutritional_info,
      allergenInfo: product.allergen_info,
      allergenInfoAr: product.allergen_info_ar,
      usageInstructions: product.usage_instructions,
      usageInstructionsAr: product.usage_instructions_ar,
      warnings: product.warnings,
      warningsAr: product.warnings_ar,
      brand: product.brands,
      category: product.categories,
      images: product.images || [],
      seo: {
        metaTitle: product.meta_title,
        metaDescription: product.meta_description
      },
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };

    // Cache the product for 10 minutes
    await cache.set(cacheKey, processedProduct, 600);

    res.json({
      success: true,
      data: { product: processedProduct }
    });

  } catch (error) {
    logger.error('Get product error:', error);
    next(error);
  }
});

// Admin routes - require admin/manager role

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin/Manager/Super Admin)
router.post('/', protect, authorize('admin', 'manager', 'super_admin'), [
  body('name').notEmpty().withMessage('Nom du produit requis'),
  body('name_ar').optional().isString(),
  body('sku').notEmpty().withMessage('SKU requis'),
  body('category_id').isUUID().withMessage('ID de catégorie invalide'),
  body('brand_id').isUUID().withMessage('ID de marque invalide'),
  body('base_price').isFloat({ min: 0 }).withMessage('Prix de base invalide'),
  body('sale_price').optional().isFloat({ min: 0 }).withMessage('Prix de vente invalide'),
  body('stock_quantity').isInt({ min: 0 }).withMessage('Quantité de stock invalide'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Poids invalide'),
  body('short_description').optional().isString(),
  body('short_description_ar').optional().isString(),
  body('description').optional().isString(),
  body('description_ar').optional().isString(),
  body('images').optional().isArray().withMessage('Images doit être un tableau'),
  body('featured').optional().isBoolean().withMessage('Produit vedette doit être vrai ou faux'),
  body('meta_title').optional().isString(),
  body('meta_description').optional().isString()
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

    const {
      name,
      name_ar,
      sku,
      category_id,
      brand_id,
      base_price,
      sale_price,
      stock_quantity,
      weight,
      short_description,
      short_description_ar,
      description,
      description_ar,
      images,
      featured = false,
      meta_title,
      meta_description,
      serving_size,
      servings_per_container,
      ingredients,
      ingredients_ar,
      nutritional_info,
      allergen_info,
      allergen_info_ar,
      usage_instructions,
      usage_instructions_ar,
      warnings,
      warnings_ar
    } = req.body;

    // Generate slug from name
    let baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
      .trim();

    // Ensure slug is not empty
    if (!baseSlug) {
      baseSlug = `product-${Date.now()}`;
    }

    // Check for slug uniqueness and add suffix if needed
    let slug = baseSlug;
    let counter = 1;
    let slugExists = true;
    
    while (slugExists) {
      const { data: existingSlug } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (!existingSlug) {
        slugExists = false;
      } else {
        counter++;
        slug = `${baseSlug}-${counter}`;
      }
    }

    // Check if SKU already exists
    const { data: existingSku } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('sku', sku)
      .single();

    if (existingSku) {
      return res.status(400).json({
        success: false,
        error: { message: 'SKU déjà utilisé' }
      });
    }

    // Check if slug already exists
    const { data: existingSlug } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingSlug) {
      return res.status(400).json({
        success: false,
        error: { message: 'Un produit avec ce nom existe déjà' }
      });
    }

    // Determine stock status
    let stock_status = 'out_of_stock';
    if (stock_quantity > 10) {
      stock_status = 'in_stock';
    } else if (stock_quantity > 0) {
      stock_status = 'low_stock';
    }

    // Create product
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert([{
        name,
        name_ar,
        slug,
        sku,
        category_id,
        brand_id,
        base_price,
        sale_price,
        stock_quantity,
        stock_status,
        weight,
        short_description,
        short_description_ar,
        description,
        description_ar,
        images: images || [],
        featured,
        meta_title,
        meta_description,
        serving_size,
        servings_per_container,
        ingredients,
        ingredients_ar,
        nutritional_info,
        allergen_info,
        allergen_info_ar,
        usage_instructions,
        usage_instructions_ar,
        warnings,
        warnings_ar,
        created_by: req.user.id,
        status: 'active'
      }])
      .select(`
        *,
        brands(id, name, slug),
        categories(id, name, name_ar, slug)
      `)
      .single();

    if (error) {
      logger.error('Product creation error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la création du produit' }
      });
    }

    // Clear related caches if Redis is available
    try {
      if (cache && typeof cache.delete === 'function') {
        await cache.delete('products:*');
        await cache.delete('products:featured:*');
        await cache.delete('products:new:*');
      }
    } catch (cacheError) {
      logger.warn('Cache clear failed:', cacheError);
      // Continue execution even if cache clear fails
    }

    logger.info(`Product created: ${product.id}`, { userId: req.user.id });

    res.status(201).json({
      success: true,
      data: { product }
    });

  } catch (error) {
    logger.error('Create product error:', error);
    next(error);
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin/Manager/Super Admin)
router.put('/:id', protect, authorize('admin', 'manager', 'super_admin'), [
  param('id').isUUID().withMessage('ID de produit invalide'),
  body('name').optional().notEmpty().withMessage('Nom du produit requis'),
  body('name_ar').optional().isString(),
  body('sku').optional().notEmpty().withMessage('SKU requis'),
  body('category_id').optional().isUUID().withMessage('ID de catégorie invalide'),
  body('brand_id').optional().isUUID().withMessage('ID de marque invalide'),
  body('base_price').optional().isFloat({ min: 0 }).withMessage('Prix de base invalide'),
  body('sale_price').optional().isFloat({ min: 0 }).withMessage('Prix de vente invalide'),
  body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Quantité de stock invalide'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Poids invalide'),
  body('short_description').optional().isString(),
  body('short_description_ar').optional().isString(),
  body('description').optional().isString(),
  body('description_ar').optional().isString(),
  body('images').optional().isArray().withMessage('Images doit être un tableau'),
  body('featured').optional().isBoolean().withMessage('Produit vedette doit être vrai ou faux'),
  body('status').optional().isIn(['active', 'inactive', 'draft']).withMessage('Statut invalide'),
  body('meta_title').optional().isString(),
  body('meta_description').optional().isString()
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

    const { id } = req.params;
    const updateData = { ...req.body };

    // Get existing product
    const { data: existingProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return res.status(404).json({
        success: false,
        error: { message: 'Produit non trouvé' }
      });
    }

    // Update slug if name changed
    if (updateData.name && updateData.name !== existingProduct.name) {
      const newSlug = updateData.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if new slug already exists
      const { data: existingSlug } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', id)
        .single();

      if (existingSlug) {
        return res.status(400).json({
          success: false,
          error: { message: 'Un produit avec ce nom existe déjà' }
        });
      }

      updateData.slug = newSlug;
    }

    // Check SKU uniqueness if changed
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const { data: existingSku } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('sku', updateData.sku)
        .neq('id', id)
        .single();

      if (existingSku) {
        return res.status(400).json({
          success: false,
          error: { message: 'SKU déjà utilisé' }
        });
      }
    }

    // Update stock status if quantity changed
    if (updateData.stock_quantity !== undefined) {
      if (updateData.stock_quantity > 10) {
        updateData.stock_status = 'in_stock';
      } else if (updateData.stock_quantity > 0) {
        updateData.stock_status = 'low_stock';
      } else {
        updateData.stock_status = 'out_of_stock';
      }
    }

    updateData.updated_at = new Date().toISOString();

    // Update product
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        brands(id, name, slug),
        categories(id, name, name_ar, slug)
      `)
      .single();

    if (error) {
      logger.error('Product update error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la mise à jour du produit' }
      });
    }

    // Clear related caches if Redis is available
    try {
      if (cache && typeof cache.delete === 'function') {
        await cache.delete('products:*');
        await cache.delete('products:featured:*');
        await cache.delete('products:new:*');
        await cache.delete(`product:${existingProduct.slug}`);
      }
    } catch (cacheError) {
      logger.warn('Cache clear failed:', cacheError);
      // Continue execution even if cache clear fails
    }

    logger.info(`Product updated: ${product.id}`, { userId: req.user.id });

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    logger.error('Update product error:', error);
    next(error);
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin/Super Admin only)
router.delete('/:id', protect, authorize('admin', 'super_admin'), [
  param('id').isUUID().withMessage('ID de produit invalide')
], async (req, res, next) => {
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
      .select('id, slug')
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

    // Clear related caches if Redis is available
    try {
      if (cache && typeof cache.delete === 'function') {
        await cache.delete('products:*');
        await cache.delete('products:featured:*');
        await cache.delete('products:new:*');
        await cache.delete(`product:${product.slug}`);
      }
    } catch (cacheError) {
      logger.warn('Cache clear failed:', cacheError);
      // Continue execution even if cache clear fails
    }

    logger.info(`Product deleted: ${id}`, { userId: req.user.id });

    res.json({
      success: true,
      data: { message: 'Produit supprimé avec succès' }
    });

  } catch (error) {
    logger.error('Delete product error:', error);
    next(error);
  }
});

// @desc    Upload product images
// @route   POST /api/products/:id/images
// @access  Private (Admin/Super Admin only)
router.post('/:id/images', protect, authorize('admin', 'super_admin'), [
  param('id').isUUID().withMessage('ID de produit invalide')
], async (req, res, next) => {
  try {
    // Validate parameters first
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
    
    // Handle file upload after parameter validation
    await new Promise((resolve, reject) => {
      upload.array('images', 5)(req, res, (err) => {
        if (err) {
          // Convert multer error to a proper JSON response
          if (err.code === 'LIMIT_FILE_SIZE') {
            reject(new Error('File size too large. Maximum size is 5MB'));
          } else if (err.code === 'LIMIT_FILE_COUNT') {
            reject(new Error('Too many files. Maximum is 5 files'));
          } else if (err.message.includes('mime type')) {
            reject(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed'));
          } else {
            reject(err);
          }
        } else {
          resolve();
        }
      });
    });

    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Aucun fichier téléchargé' }
      });
    }

    // Get product to update
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, images')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Produit non trouvé' }
      });
    }

    // Process uploaded files
    const files = processUploadedFiles(req.files);
    const uploadPromises = files.map(file => {
      return uploadProductImage({
        buffer: file.buffer,
        name: file.name,
        type: file.type
      }, id);
    });

    // Upload all images to storage
    const uploadedUrls = await Promise.all(uploadPromises);

    // Get existing images array or initialize it
    const existingImages = product.images || [];

    // Update product with new image URLs
    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({ 
        images: [...existingImages, ...uploadedUrls],
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Product images update error:', updateError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la mise à jour des images' }
      });
    }

    // Clear product cache
    try {
      if (cache && typeof cache.delete === 'function') {
        await cache.delete('products:*');
      }
    } catch (cacheError) {
      logger.warn('Cache clear failed:', cacheError);
    }

    logger.info(`Product images updated: ${id}`, { userId: req.user.id });

    res.json({
      success: true,
      data: {
        message: 'Images téléchargées avec succès',
        images: uploadedUrls
      }
    });

  } catch (error) {
    logger.error('Upload product images error:', error);
    next(error);
  }
});

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:filename
// @access  Private (Admin/Super Admin only)
router.delete('/:id/images/:filename', protect, authorize('admin', 'super_admin'), [
  param('id').isUUID().withMessage('ID de produit invalide'),
  param('filename').notEmpty().withMessage('Nom de fichier requis')
], async (req, res, next) => {
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

    const { id, filename } = req.params;

    // Get product to update
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, images')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Produit non trouvé' }
      });
    }

    // Delete image from storage
    await deleteProductImage(filename, id);

    // Remove image URL from product
    const updatedImages = (product.images || []).filter(url => !url.includes(filename));

    // Update product
    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({ 
        images: updatedImages,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      logger.error('Product image deletion error:', updateError);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la suppression de l\'image' }
      });
    }

    // Clear product cache
    try {
      if (cache && typeof cache.delete === 'function') {
        await cache.delete('products:*');
      }
    } catch (cacheError) {
      logger.warn('Cache clear failed:', cacheError);
    }

    logger.info(`Product image deleted: ${id}/${filename}`, { userId: req.user.id });

    res.json({
      success: true,
      data: {
        message: 'Image supprimée avec succès',
        images: updatedImages
      }
    });

  } catch (error) {
    logger.error('Delete product image error:', error);
    next(error);
  }
});

module.exports = router;
