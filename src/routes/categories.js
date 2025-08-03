const express = require('express');
const { query, validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/supabase');
const { cache } = require('../config/redis');
const { logger } = require('../utils/logger');

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', [
  query('includeProducts').optional().isBoolean().withMessage('includeProducts doit être un boolean'),
  query('parent').optional().isUUID().withMessage('ID parent invalide')
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

    const { includeProducts = false, parent } = req.query;

    // Build cache key
    const cacheKey = `categories:${includeProducts}:${parent || 'all'}`;
    
    // Check cache first
    const cachedCategories = await cache.get(cacheKey);
    if (cachedCategories) {
      return res.json({
        success: true,
        data: { categories: cachedCategories },
        cached: true
      });
    }    // Build query
    let query = supabaseAdmin
      .from('categories')
      .select(`
        id,
        name,
        name_ar,
        slug,
        description,
        description_ar,
        parent_id,
        image_url,
        meta_title,
        meta_description,
        sort_order,
        is_active${includeProducts ? `,
          products(
            id,
            name,
            slug,
            base_price,
            sale_price,
            stock_status,
            images
          )
        ` : ''}
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    // Filter by parent if specified
    if (parent) {
      query = query.eq('parent_id', parent);
    } else if (parent === null) {
      query = query.is('parent_id', null);
    }

    const { data: categories, error } = await query;

    if (error) {
      logger.error('Categories fetch error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération des catégories' }
      });
    }

    // Process categories data
    const processedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parent_id,
      imageUrl: category.image_url,
      icon: category.icon,
      isFeatured: category.is_featured,
      sortOrder: category.sort_order,
      productCount: includeProducts ? category.product_categories?.length || 0 : undefined,
      products: includeProducts ? category.product_categories?.map(pc => {
        const product = pc.products;
        const featuredImage = product.product_media?.find(media => media.is_featured) 
          || product.product_media?.[0];
        
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          salePrice: product.sale_price,
          currentPrice: product.sale_price || product.price,
          stockStatus: product.stock_status,
          image: featuredImage ? {
            url: featuredImage.url,
            altText: featuredImage.alt_text
          } : null
        };
      }) || [] : undefined
    }));

    // Cache for 10 minutes
    await cache.set(cacheKey, processedCategories, 600);

    res.json({
      success: true,
      data: { categories: processedCategories }
    });

  } catch (error) {
    logger.error('Get categories error:', error);
    next(error);
  }
});

// @desc    Get category hierarchy
// @route   GET /api/categories/hierarchy
// @access  Public
router.get('/hierarchy', async (req, res, next) => {
  try {
    // Check cache first
    const cacheKey = 'categories:hierarchy';
    const cachedHierarchy = await cache.get(cacheKey);
    if (cachedHierarchy) {
      return res.json({
        success: true,
        data: { categories: cachedHierarchy },
        cached: true
      });
    }

    // Get all categories
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        parent_id,
        image_url,
        icon,
        is_featured,
        sort_order
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      logger.error('Categories hierarchy fetch error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Erreur lors de la récupération de la hiérarchie des catégories' }
      });
    }

    // Build hierarchy
    const categoryMap = new Map();
    const rootCategories = [];

    // First pass: create category objects
    categories.forEach(category => {
      const processedCategory = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: category.parent_id,
        imageUrl: category.image_url,
        icon: category.icon,
        isFeatured: category.is_featured,
        sortOrder: category.sort_order,
        children: []
      };
      
      categoryMap.set(category.id, processedCategory);
      
      if (!category.parent_id) {
        rootCategories.push(processedCategory);
      }
    });

    // Second pass: build parent-child relationships
    categories.forEach(category => {
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        const child = categoryMap.get(category.id);
        if (parent && child) {
          parent.children.push(child);
        }
      }
    });

    // Sort children by sort_order
    const sortChildren = (categories) => {
      categories.forEach(category => {
        category.children.sort((a, b) => a.sortOrder - b.sortOrder);
        if (category.children.length > 0) {
          sortChildren(category.children);
        }
      });
    };

    sortChildren(rootCategories);

    // Cache for 15 minutes
    await cache.set(cacheKey, rootCategories, 900);

    res.json({
      success: true,
      data: { categories: rootCategories }
    });

  } catch (error) {
    logger.error('Get categories hierarchy error:', error);
    next(error);
  }
});

// @desc    Get single category by ID
// @route   GET /api/categories/id/:id
// @access  Public
router.get('/id/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check cache first
    const cacheKey = `category:id:${id}`;
    const cachedCategory = await cache.get(cacheKey);
    if (cachedCategory) {
      return res.json({
        success: true,
        data: { category: cachedCategory },
        cached: true
      });
    }

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .select(`
        id,
        name,
        name_ar,
        slug,
        description,
        description_ar,
        parent_id,
        image_url,
        sort_order,
        meta_title,
        meta_description,
        is_active,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error || !category) {
      return res.status(404).json({
        success: false,
        error: { message: 'Catégorie non trouvée' }
      });
    }

    // Process category data
    const processedCategory = {
      id: category.id,
      name: category.name,
      nameAr: category.name_ar,
      slug: category.slug,
      description: category.description,
      descriptionAr: category.description_ar,
      parentId: category.parent_id,
      imageUrl: category.image_url,
      sortOrder: category.sort_order,
      isActive: category.is_active,
      metaTitle: category.meta_title,
      metaDescription: category.meta_description,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
      products: [] // We'll fetch products separately if needed
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, processedCategory, 300);

    res.json({
      success: true,
      data: { category: processedCategory }
    });

  } catch (error) {
    logger.error('Category by ID fetch error:', error);
    next(error);
  }
});

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    console.log(`🔍 Category slug route hit with slug: "${slug}"`);

    // Check cache first
    const cacheKey = `category:${slug}`;
    const cachedCategory = await cache.get(cacheKey);
    if (cachedCategory) {
      return res.json({
        success: true,
        data: { category: cachedCategory },
        cached: true
      });
    }

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .select(`
        id,
        name,
        name_ar,
        slug,
        description,
        description_ar,
        parent_id,
        image_url,
        sort_order,
        meta_title,
        meta_description,
        is_active,
        created_at,
        updated_at
      `)
      .eq('slug', slug)
      .single();

    if (error || !category) {
      console.log(`❌ Category not found for slug: ${slug}`, error);
      return res.status(404).json({
        success: false,
        error: { message: 'Catégorie non trouvée' }
      });
    }

    console.log(`✅ Found category for slug "${slug}":`, category.name);

    // Get parent category if exists
    let parentCategory = null;
    if (category.parent_id) {
      const { data: parent } = await supabaseAdmin
        .from('categories')
        .select('id, name, slug')
        .eq('id', category.parent_id)
        .single();
      parentCategory = parent;
    }

    // Process category data
    const processedCategory = {
      id: category.id,
      name: category.name,
      nameAr: category.name_ar,
      slug: category.slug,
      description: category.description,
      descriptionAr: category.description_ar,
      parentId: category.parent_id,
      parent: parentCategory,
      imageUrl: category.image_url,
      sortOrder: category.sort_order,
      isActive: category.is_active,
      metaTitle: category.meta_title,
      metaDescription: category.meta_description,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
      seo: {
        metaTitle: category.meta_title,
        metaDescription: category.meta_description
      }
    };

    // Cache for 10 minutes
    await cache.set(cacheKey, processedCategory, 600);

    res.json({
      success: true,
      data: { category: processedCategory }
    });

  } catch (error) {
    logger.error('Get category error:', error);
    next(error);
  }
});

module.exports = router;
