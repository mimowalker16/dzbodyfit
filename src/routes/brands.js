const express = require("express");
const { supabaseAdmin } = require("../config/supabase");
const { logger } = require("../utils/logger");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // First, get all brands from the brands table with their logos
    const { data: brandsData, error: brandsError } = await supabaseAdmin
      .from("brands")
      .select('*')
      .eq('is_active', true);

    if (brandsError) {
      logger.error("Error fetching brands:", brandsError);
      return res.status(500).json({
        success: false,
        error: { message: "Erreur lors de la récupération des marques" }
      });
    }

    console.log(`Found ${brandsData.length} brands in brands table`);

    // Transform brands to match expected format
    const brands = brandsData.map(brand => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description || `Découvrez tous les produits de la marque ${brand.name}`,
      logoUrl: brand.logo_url,
      websiteUrl: brand.website_url,
      isActive: brand.is_active,
    })).sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Returning ${brands.length} brands with logos`);

    res.json({
      success: true,
      data: { brands }
    });
  } catch (error) {
    logger.error("Unexpected error in brands route:", error);
    res.status(500).json({
      success: false,
      error: { message: "Erreur serveur interne" }
    });
  }
});

// @desc    Get brand by ID or slug with products
// @route   GET /api/brands/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // First, try to get the brand info from the brands table
    // Check if it's a UUID (ID) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    
    let brandQuery = supabaseAdmin.from("brands").select('*');
    
    if (isUUID) {
      brandQuery = brandQuery.eq('id', id);
    } else {
      brandQuery = brandQuery.eq('slug', id);
    }
    
    const { data: brandData, error: brandError } = await brandQuery.single();

    if (brandError || !brandData) {
      logger.error("Error fetching brand:", brandError);
      return res.status(404).json({
        success: false,
        error: { message: "Marque non trouvée" }
      });
    }

    // Get all products for this brand using the brand ID
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select(`
        *,
        brands!inner(id, name, slug),
        categories(id, name, slug, name_ar)
      `)
      .eq('brands.id', brandData.id)
      .eq('status', 'active');

    if (error) {
      logger.error("Error fetching brand products:", error);
      return res.status(500).json({
        success: false,
        error: { message: "Erreur lors de la récupération des produits de la marque" }
      });
    }

    // Use the brand data from brands table
    const brand = {
      id: brandData.id,
      name: brandData.name,
      slug: brandData.slug,
      description: brandData.description || `Découvrez tous les produits de la marque ${brandData.name}`,
      logoUrl: brandData.logo_url,
      websiteUrl: brandData.website_url,
      isActive: brandData.is_active,
    };

    // Process products data (handle empty products array)
    const processedProducts = (products || []).map(product => {
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

    res.json({
      success: true,
      data: { 
        brand,
        products: processedProducts
      }
    });

  } catch (error) {
    logger.error("Unexpected error in brand by ID route:", error);
    res.status(500).json({
      success: false,
      error: { message: "Erreur serveur interne" }
    });
  }
});

module.exports = router;
