require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');
const { logger } = require('../utils/logger');

// Sample categories for Algerian supplement shop
const categories = [
  {
    name: 'Protéines',
    name_ar: 'البروتين',
    slug: 'proteines',
    description: 'Protéines pour la musculation et la récupération',
    description_ar: 'البروتينات لكمال الأجسام والتعافي',
    sort_order: 1,
    is_active: true
  },
  {
    name: 'Créatines',
    name_ar: 'الكرياتين',
    slug: 'creatines',
    description: 'Créatine pour l\'énergie et la performance',
    description_ar: 'الكرياتين للطاقة والأداء',
    sort_order: 2,
    is_active: true
  },
  {
    name: 'Mass Gainers',
    name_ar: 'مكملات زيادة الوزن',
    slug: 'mass-gainers',
    description: 'Gainers pour la prise de masse',
    description_ar: 'مكملات زيادة الوزن للكتلة العضلية',
    sort_order: 3,
    is_active: true
  },  {
    name: 'Brûleurs de Graisse',
    name_ar: 'حارقات الدهون',
    slug: 'bruleurs-graisse',
    description: 'Produits pour la perte de poids',
    description_ar: 'منتجات فقدان الوزن',
    sort_order: 4,
    is_active: true
  },
  {
    name: 'Pre-Workout',
    name_ar: 'ما قبل التمرين',
    slug: 'pre-workout',
    description: 'Boosters avant l\'entraînement',
    description_ar: 'منشطات ما قبل التمرين',
    sort_order: 5,
    is_active: true
  },
  {
    name: 'Boosters',
    name_ar: 'المنشطات',
    slug: 'boosters',
    description: 'Suppléments de performance',
    description_ar: 'مكملات الأداء',
    sort_order: 6,
    is_active: true
  },
  {
    name: 'Acides Aminés',
    name_ar: 'الأحماض الأمينية',
    slug: 'acides-amines',    description: 'BCAA et acides aminés essentiels',
    description_ar: 'الأحماض الأمينية الأساسية و BCAA',
    sort_order: 7,
    is_active: true
  },
  {
    name: 'Vitamines',
    name_ar: 'الفيتامينات',
    slug: 'vitamines',
    description: 'Vitamines et minéraux',
    description_ar: 'الفيتامينات والمعادن',
    sort_order: 8,
    is_active: true
  },
  {
    name: 'Barres & Snacks',
    name_ar: 'الألواح والوجبات الخفيفة',
    slug: 'barres-snacks',    description: 'Barres protéinées et collations',
    description_ar: 'ألواح البروتين والوجبات الخفيفة',
    sort_order: 9,
    is_active: true
  }
];

// Sample brands
const brands = [
  {
    name: 'Optimum Nutrition',
    slug: 'optimum-nutrition',
    description: 'Leader mondial en nutrition sportive'
  },
  {
    name: 'MuscleTech',
    slug: 'muscletech',
    description: 'Innovation en suppléments de performance'
  },
  {
    name: 'BSN',
    slug: 'bsn',
    description: 'Suppléments premium pour bodybuilders'
  },
  {
    name: 'Dymatize',
    slug: 'dymatize',
    description: 'Nutrition scientifique pour athlètes'
  },
  {
    name: 'Myprotein',
    slug: 'myprotein',
    description: 'Nutrition sportive accessible'
  }
];

// Sample products
const products = [
  {
    name: 'Whey Gold Standard 2kg',
    name_ar: 'واي بروتين جولد ستاندرد 2 كيلو',
    slug: 'whey-gold-standard-2kg',
    short_description: 'Protéine whey isolate premium',
    short_description_ar: 'بروتين واي معزول عالي الجودة',
    description: 'Gold Standard 100% Whey est la protéine la plus utilisée au monde. Elle contient des isolats de protéines de lactosérum comme ingrédient principal avec 24g de protéines par portion.',
    description_ar: 'جولد ستاندرد 100% واي هو البروتين الأكثر استخداماً في العالم. يحتوي على عزلة بروتين مصل اللبن كمكون رئيسي مع 24 جرام بروتين لكل حصة.',
    sku: 'ON-WGS-2KG',
    base_price: 18500.00,
    sale_price: 16500.00,
    stock_quantity: 25,
    stock_status: 'in_stock',
    weight: 2.0,
    featured: true,
    status: 'active',
    nutritional_info: {
      per_serving: {
        calories: 120,
        protein: 24,
        carbs: 1,
        fat: 1
      },
      serving_size: '30g',
      servings_per_container: 67
    },
    ingredients: 'Isolat de protéines de lactosérum, concentré de protéines de lactosérum, peptides de lactosérum, cacao en poudre, arômes naturels et artificiels, lécithine de soja, acesulfame potassium, sucralose.',
    ingredients_ar: 'عزلة بروتين مصل اللبن، مركز بروتين مصل اللبن، ببتيدات مصل اللبن، مسحوق الكاكاو، نكهات طبيعية واصطناعية، ليسيثين الصويا، أسيسولفام البوتاسيوم، سوكرالوز.',
    usage_instructions: 'Mélanger 1 mesure avec 180-250ml d\'eau froide ou de lait. Consommer 1-2 fois par jour.',
    usage_instructions_ar: 'اخلط مغرفة واحدة مع 180-250 مل من الماء البارد أو الحليب. تناول 1-2 مرات يومياً.',
    images: ['https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Whey+Protein'],
    meta_title: 'Gold Standard Whey Protein 2kg - Protéine Premium Algérie',
    meta_description: 'Achetez Gold Standard 100% Whey Protein en Algérie. Protéine isolate premium pour musculation et récupération.'
  },
  {
    name: 'Créatine Monohydrate 500g',
    name_ar: 'كرياتين مونوهيدرات 500 جرام',
    slug: 'creatine-monohydrate-500g',
    short_description: 'Créatine pure micronisée',
    short_description_ar: 'كرياتين نقي مطحون ناعم',
    description: 'Créatine monohydrate pure à 99.9% pour augmenter la force et la puissance musculaire.',
    description_ar: 'كرياتين مونوهيدرات نقي بنسبة 99.9% لزيادة القوة والطاقة العضلية.',
    sku: 'ON-CREAT-500G',
    base_price: 4500.00,
    stock_quantity: 40,
    stock_status: 'in_stock',
    weight: 0.5,
    featured: true,
    status: 'active',
    nutritional_info: {
      per_serving: {
        creatine_monohydrate: 5
      },
      serving_size: '5g',
      servings_per_container: 100
    },
    ingredients: 'Créatine monohydrate pure',
    ingredients_ar: 'كرياتين مونوهيدرات نقي',
    usage_instructions: 'Prendre 5g par jour, de préférence après l\'entraînement.',
    usage_instructions_ar: 'تناول 5 جرام يومياً، ويفضل بعد التمرين.',
    images: [], // Will be populated through the upload endpoint
    meta_title: 'Créatine Monohydrate 500g - Complément Musculation Algérie',
    meta_description: 'Créatine monohydrate pure pour augmenter la force et la performance. Livraison en Algérie.'
  },
  {
    name: 'Mass Gainer Serious Mass 2.7kg',
    name_ar: 'ماس جينر سيريوس ماس 2.7 كيلو',
    slug: 'serious-mass-2-7kg',
    short_description: 'Gainer haute calorie',
    short_description_ar: 'مكمل زيادة الوزن عالي السعرات',
    description: 'Serious Mass est conçu pour les personnes qui ont des difficultés à prendre du poids. Chaque portion fournit 1250 calories.',
    description_ar: 'سيريوس ماس مصمم للأشخاص الذين يجدون صعوبة في زيادة الوزن. كل حصة توفر 1250 سعرة حرارية.',
    sku: 'ON-SM-2.7KG',
    base_price: 14800.00,
    sale_price: 13200.00,
    stock_quantity: 15,
    stock_status: 'in_stock',
    weight: 2.7,
    featured: false,
    status: 'active',
    nutritional_info: {
      per_serving: {
        calories: 1250,
        protein: 50,
        carbs: 252,
        fat: 4.5
      },
      serving_size: '334g',
      servings_per_container: 8
    },
    ingredients: 'Maltodextrine, concentré de protéines de lactosérum, lait écrémé en poudre, cacao en poudre, arômes naturels et artificiels.',
    ingredients_ar: 'مالتوديكسترين، مركز بروتين مصل اللبن، مسحوق الحليب منزوع الدسم، مسحوق الكاكاو، نكهات طبيعية واصطناعية.',
    usage_instructions: 'Mélanger 2 mesures avec 500ml de lait ou d\'eau. Consommer entre les repas.',
    usage_instructions_ar: 'اخلط مغرفتين مع 500 مل من الحليب أو الماء. تناول بين الوجبات.',
    images: [], // Will be populated through the upload endpoint
    meta_title: 'Serious Mass Gainer 2.7kg - Prise de Masse Algérie',
    meta_description: 'Mass gainer haute calorie pour prise de poids rapide. 1250 calories par portion. Livraison Algérie.'
  },
  {
    name: 'BCAA Energy 280g',
    name_ar: 'بي سي إيه إيه إنرجي 280 جرام',
    slug: 'bcaa-energy-280g',
    short_description: 'Acides aminés avec caféine',
    short_description_ar: 'أحماض أمينية مع كافيين',
    description: 'BCAA Energy combine les acides aminés essentiels avec de la caféine pour soutenir l\'énergie et la récupération pendant l\'entraînement.',
    description_ar: 'بي سي إيه إيه إنرجي يجمع بين الأحماض الأمينية الأساسية والكافيين لدعم الطاقة والتعافي أثناء التمرين.',
    sku: 'ON-BCAA-280G',
    base_price: 6800.00,
    sale_price: 5900.00,
    stock_quantity: 30,
    stock_status: 'in_stock',
    weight: 0.28,
    featured: true,
    status: 'active',
    nutritional_info: {
      per_serving: {
        calories: 10,
        leucine: 1.75,
        isoleucine: 0.875,
        valine: 0.875,
        caffeine: 100
      },
      serving_size: '9g',
      servings_per_container: 30
    },
    ingredients: 'L-Leucine, L-Isoleucine, L-Valine, Caféine naturelle, Arômes naturels, Acide citrique, Betterave rouge (colorant).',
    ingredients_ar: 'إل-ليوسين، إل-إيزوليوسين، إل-فالين، كافيين طبيعي، نكهات طبيعية، حمض الستريك، بنجر أحمر (ملون).',
    usage_instructions: 'Mélanger 1 mesure avec 300ml d\'eau. Consommer pendant l\'entraînement.',
    usage_instructions_ar: 'اخلط مغرفة واحدة مع 300 مل من الماء. تناول أثناء التمرين.',
    images: ['https://via.placeholder.com/400x400/96CEB4/FFFFFF?text=BCAA+Energy'],
    meta_title: 'BCAA Energy 280g - Acides Aminés avec Caféine Algérie',
    meta_description: 'BCAA Energy pour soutenir l\'énergie et la récupération. Livraison rapide en Algérie.'
  },
  {
    name: 'Pre-Workout Gold Standard 330g',
    name_ar: 'بري وورك آوت جولد ستاندرد 330 جرام',
    slug: 'pre-workout-gold-standard-330g',
    short_description: 'Booster pré-entraînement premium',
    short_description_ar: 'منشط ما قبل التمرين الممتاز',
    description: 'Gold Standard Pre-Workout est formulé avec des ingrédients de qualité pour augmenter l\'énergie, la concentration et l\'endurance.',
    description_ar: 'جولد ستاندرد بري وورك آوت مُصاغ بمكونات عالية الجودة لزيادة الطاقة والتركيز والتحمل.',
    sku: 'ON-PRE-330G',
    base_price: 7200.00,
    stock_quantity: 20,
    stock_status: 'in_stock',
    weight: 0.33,
    featured: false,
    status: 'active',
    nutritional_info: {
      per_serving: {
        calories: 5,
        caffeine: 175,
        creatine: 3,
        beta_alanine: 1.5,
        citrulline: 750
      },
      serving_size: '11g',
      servings_per_container: 30
    },
    ingredients: 'Créatine monohydrate, Bêta-alanine, L-Citrulline, Caféine, Extrait de thé vert, Arômes naturels.',
    ingredients_ar: 'كرياتين مونوهيدرات، بيتا ألانين، إل-سيترولين، كافيين، مستخلص الشاي الأخضر، نكهات طبيعية.',
    usage_instructions: 'Mélanger 1 mesure avec 250ml d\'eau froide 20-30 minutes avant l\'entraînement.',
    usage_instructions_ar: 'اخلط مغرفة واحدة مع 250 مل من الماء البارد قبل 20-30 دقيقة من التمرين.',
    images: ['https://via.placeholder.com/400x400/F7DC6F/FFFFFF?text=Pre+Workout'],
    meta_title: 'Pre-Workout Gold Standard 330g - Booster Entraînement Algérie',
    meta_description: 'Pre-workout premium pour énergie et performance maximales. Commandez en Algérie.'
  },
  {
    name: 'Whey Isolate Zero 1.8kg',
    name_ar: 'واي أيزوليت زيرو 1.8 كيلو',
    slug: 'whey-isolate-zero-1-8kg',
    short_description: 'Isolat de whey sans lactose',
    short_description_ar: 'عزلة واي خالية من اللاكتوز',
    description: 'Isolat de protéines de lactosérum ultra-pur, sans lactose, sans gluten et sans sucre ajouté pour une digestion optimale.',
    description_ar: 'عزلة بروتين مصل اللبن فائقة النقاء، خالية من اللاكتوز والغلوتين والسكر المضاف للهضم الأمثل.',
    sku: 'ON-ISO-1.8KG',
    base_price: 22500.00,
    sale_price: 19800.00,
    stock_quantity: 12,
    stock_status: 'low_stock',
    weight: 1.8,
    featured: true,
    status: 'active',
    nutritional_info: {
      per_serving: {
        calories: 110,
        protein: 25,
        carbs: 0,
        fat: 0,
        sodium: 70
      },
      serving_size: '30g',
      servings_per_container: 60
    },
    ingredients: 'Isolat de protéines de lactosérum, Arômes naturels, Lécithine de tournesol, Édulcorant (Sucralose).',
    ingredients_ar: 'عزلة بروتين مصل اللبن، نكهات طبيعية، ليسيثين عباد الشمس، محلي (سوكرالوز).',
    usage_instructions: 'Mélanger 1 mesure avec 200-250ml d\'eau froide. Consommer post-entraînement.',
    usage_instructions_ar: 'اخلط مغرفة واحدة مع 200-250 مل من الماء البارد. تناول بعد التمرين.',
    images: ['https://via.placeholder.com/400x400/85C1E9/FFFFFF?text=Whey+Isolate'],
    meta_title: 'Whey Isolate Zero 1.8kg - Protéine Pure Sans Lactose Algérie',
    meta_description: 'Isolat de whey ultra-pur sans lactose ni sucre. Parfait pour digestion sensible. Algérie.'
  }
];

async function seedDatabase() {
  try {
    logger.info('🌱 Début du seeding de la base de données...');

    // Clear existing data (in reverse order due to foreign keys)
    logger.info('🧹 Nettoyage des données existantes...');
    
    const { error: deleteProductsError } = await supabaseAdmin.from('products').delete().gte('created_at', '1900-01-01');
    if (deleteProductsError) logger.warn('Products delete warning:', deleteProductsError.message);
    
    const { error: deleteBrandsError } = await supabaseAdmin.from('brands').delete().gte('created_at', '1900-01-01');
    if (deleteBrandsError) logger.warn('Brands delete warning:', deleteBrandsError.message);
    
    const { error: deleteCategoriesError } = await supabaseAdmin.from('categories').delete().gte('created_at', '1900-01-01');
    if (deleteCategoriesError) logger.warn('Categories delete warning:', deleteCategoriesError.message);
    
    logger.info('✅ Nettoyage terminé');

    // Insert categories
    logger.info('📁 Insertion des catégories...');
    const { data: insertedCategories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .insert(categories)
      .select('*');

    if (categoriesError) {
      throw new Error(`Erreur categories: ${categoriesError.message}`);
    }
    logger.info(`✅ ${insertedCategories.length} catégories insérées`);

    // Insert brands
    logger.info('🏷️ Insertion des marques...');
    const { data: insertedBrands, error: brandsError } = await supabaseAdmin
      .from('brands')
      .insert(brands)
      .select('*');

    if (brandsError) {
      throw new Error(`Erreur brands: ${brandsError.message}`);
    }
    logger.info(`✅ ${insertedBrands.length} marques insérées`);

    // Prepare products with brand and category IDs
    const proteinesCategory = insertedCategories.find(cat => cat.slug === 'proteines');
    const creatinesCategory = insertedCategories.find(cat => cat.slug === 'creatines');
    const massGainersCategory = insertedCategories.find(cat => cat.slug === 'mass-gainers');
    const acidesaminesCategory = insertedCategories.find(cat => cat.slug === 'acides-amines');
    const preworkoutCategory = insertedCategories.find(cat => cat.slug === 'pre-workout');
    const optimumBrand = insertedBrands.find(brand => brand.slug === 'optimum-nutrition');

    const productsWithRelations = products.map((product, index) => {
      let category_id;
      
      // Map products to appropriate categories
      if (product.slug.includes('whey') || product.slug.includes('protein') || product.slug.includes('isolate')) {
        category_id = proteinesCategory?.id;
      } else if (product.slug.includes('creatine')) {
        category_id = creatinesCategory?.id;
      } else if (product.slug.includes('mass') || product.slug.includes('gainer')) {
        category_id = massGainersCategory?.id;
      } else if (product.slug.includes('bcaa') || product.slug.includes('amino')) {
        category_id = acidesaminesCategory?.id;
      } else if (product.slug.includes('pre-workout') || product.slug.includes('preworkout')) {
        category_id = preworkoutCategory?.id;
      } else {
        category_id = insertedCategories[index % insertedCategories.length]?.id;
      }

      return {
        ...product,
        brand_id: optimumBrand?.id || insertedBrands[0]?.id,
        category_id: category_id
      };
    });

    // Insert products
    logger.info('📦 Insertion des produits...');
    const { data: insertedProducts, error: productsError } = await supabaseAdmin
      .from('products')
      .insert(productsWithRelations)
      .select('*');

    if (productsError) {
      throw new Error(`Erreur products: ${productsError.message}`);
    }
    logger.info(`✅ ${insertedProducts.length} produits insérés`);

    logger.info('🎉 Seeding terminé avec succès!');
    
    return {
      categories: insertedCategories,
      brands: insertedBrands,
      products: insertedProducts
    };

  } catch (error) {
    logger.error('❌ Erreur lors du seeding:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('✅ Base de données seedée avec succès');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Erreur de seeding:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
