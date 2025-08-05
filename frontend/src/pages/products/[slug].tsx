/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { RevolutionaryPageTemplate } from '../../components/dzbodyfit/RevolutionaryPageTemplate'
import { ProductCard } from '../../components/dzbodyfit/ProductCard'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { api, type Product as APIProduct } from '../../lib/api'
import { useCart } from '../../contexts/CartContext'
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  Award,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react'

// Sample product data - in real app, this would come from API
const sampleProduct = {
  id: 'whey-protein-isolate-premium',
  name: 'Premium Whey Protein Isolate',
  brand: {
    name: 'DZBodyFit Pro',
    logo: '/api/placeholder/80/40',
    verified: true
  },
  price: 8500,
  originalPrice: 12000,
  images: [
    '/api/placeholder/600/600',
    '/api/placeholder/600/600',
    '/api/placeholder/600/600',
    '/api/placeholder/600/600'
  ],
  category: 'Protein',
  inStock: true,
  stockLevel: 47,
  rating: 4.8,
  reviewCount: 324,
  soldCount: 1250,
  description: 'Notre isolat de protéine de lactosérum premium offre une pureté exceptionnelle avec 90% de protéines pour une absorption rapide et une croissance musculaire optimale.',
  features: [
    '25g de protéines par portion',
    'Absorption ultra-rapide',
    'Faible en lactose (<1%)',
    'Sans colorants artificiels',
    'Certifié Halal',
    'Testé en laboratoire'
  ],
  variants: {
    flavors: ['Vanille', 'Chocolat', 'Fraise', 'Banane', 'Nature'],
    sizes: [
      { size: '1kg', price: 8500, servings: 33 },
      { size: '2kg', price: 15900, servings: 66, popular: true },
      { size: '5kg', price: 38000, servings: 166, bestValue: true }
    ]
  },
  nutritionFacts: {
    servingSize: '30g',
    servingsPerContainer: 33,
    calories: 120,
    protein: 25,
    carbs: 1,
    fat: 0.5,
    sugar: 0.5,
    sodium: 50
  },
  ingredients: [
    'Isolat de protéine de lactosérum',
    'Arômes naturels',
    'Lécithine de tournesol',
    'Sucralose',
    'Stevia'
  ],
  usage: {
    timing: ['Post-entraînement', 'Entre les repas', 'Au réveil'],
    dosage: '1-2 portions par jour',
    preparation: 'Mélanger 30g avec 250ml d&apos;eau ou de lait'
  },
  certifications: ['Halal', 'Testé en laboratoire', 'Sans OGM', 'Fabriqué en Europe'],
  benefits: [
    { icon: Target, title: 'Croissance Musculaire', description: 'Stimule la synthèse protéique' },
    { icon: Zap, title: 'Récupération Rapide', description: 'Réduit les courbatures' },
    { icon: TrendingUp, title: 'Performance Optimale', description: 'Améliore les performances' }
  ]
}

const relatedProducts: any[] = [
  {
    id: "1",
    name: "Créatine Monohydrate",
    price: 3500,
    description: "Créatine pure pour améliorer les performances",
    images: ["/api/placeholder/300/300"],
    brand: { name: "DZBodyFit", slug: "dzbodyfit" },
    category: { name: "Créatine", slug: "creatine" },
    rating: 4.7,
    reviewCount: 189,
    inStock: true,
    isInStock: true
  },
  {
    id: "2",
    name: "BCAA Energy",
    price: 4200,
    originalPrice: 5000,
    description: "Acides aminés pour la récupération musculaire",
    images: ["/api/placeholder/300/300"],
    brand: { name: "DZBodyFit", slug: "dzbodyfit" },
    category: { name: "BCAA", slug: "bcaa" },
    rating: 4.6,
    reviewCount: 156,
    inStock: true,
    isInStock: true
  },
  {
    id: "3",
    name: "Pre-Workout Extreme",
    price: 6800,
    description: "Boost d'énergie pour l'entraînement",
    images: ["/api/placeholder/300/300"],
    brand: { name: "DZBodyFit Pro", slug: "dzbodyfit-pro" },
    category: { name: "Pre-Workout", slug: "pre-workout" },
    rating: 4.9,
    reviewCount: 298,
    inStock: true,
    isInStock: true
  },
  {
    id: "4",
    name: "Mass Gainer 3000",
    price: 9500,
    description: "Prise de masse avec protéines et glucides",
    images: ["/api/placeholder/300/300"],
    brand: { name: "DZBodyFit", slug: "dzbodyfit" },
    category: { name: "Mass Gainer", slug: "mass-gainer" },
    rating: 4.5,
    reviewCount: 142,
    inStock: true,
    isInStock: true
  }
]

export default function ProductPage() {
  const router = useRouter()
  const { slug } = router.query
  const { addToCart, loading: cartLoading } = useCart()
  
  // State for API data
  const [product, setProduct] = useState<APIProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI state
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedFlavor, setSelectedFlavor] = useState('Vanille')
  const [selectedSize, setSelectedSize] = useState(1) // Default to 2kg (popular)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!slug || typeof slug !== 'string') return

      try {
        setLoading(true)
        setError(null)

        const response = await api.products.getBySlug(slug)
        if (response.success) {
          setProduct(response.data.product)
          
          // Load related products
          const relatedResponse = await api.products.getAll({ 
            limit: 4,
            category: response.data.product.category_id 
          })
          if (relatedResponse.success) {
            setRelatedProducts(relatedResponse.data.items.filter(p => p.id !== response.data.product.id))
          }
        } else {
          setError('Product not found')
        }

      } catch (err) {
        console.error('Failed to load product:', err)
        setError('Failed to load product. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [slug])

  // Transform product for ProductCard component
  const transformProductForCard = (apiProduct: APIProduct) => ({
    id: apiProduct.id,
    name: apiProduct.name,
    brand: apiProduct.brand?.name || 'DZBodyFit',
    description: apiProduct.description || '',
    price: apiProduct.sale_price || apiProduct.price,
    originalPrice: apiProduct.sale_price ? apiProduct.price : undefined,
    rating: 4.5, // TODO: Add to API
    reviewCount: Math.floor(Math.random() * 200) + 50,
    images: apiProduct.images.length > 0 ? apiProduct.images : ['/api/placeholder/300/300'],
    category: apiProduct.category?.name || 'Supplements',
    inStock: apiProduct.stock_quantity > 0,
    currency: 'DZD'
  })

  // Use real product data or fallback to sample
  const currentProduct = product || sampleProduct
  const currentPrice = product ? (product.sale_price || product.price) : sampleProduct.variants.sizes[selectedSize].price
  const totalPrice = currentPrice * quantity

  const handleAddToCart = async () => {
    if (!currentProduct) return
    
    try {
      // Use real product ID if available, otherwise create a temporary ID
      const productId = product ? product.id : `sample-${currentProduct.name.toLowerCase().replace(/\s+/g, '-')}`
      
      const success = await addToCart(productId, quantity)
      
      if (success) {
        // Show success feedback
        console.log('Successfully added to cart:', {
          product: currentProduct.name,
          flavor: selectedFlavor,
          size: product ? 'Standard' : sampleProduct.variants.sizes[selectedSize].size,
          quantity,
          price: totalPrice
        })
        
        // Optional: Show toast notification
        // toast.success(`${currentProduct.name} ajouté au panier!`)
        
        // Optional: Reset quantity to 1
        setQuantity(1)
      } else {
        console.error('Failed to add to cart')
        // Optional: Show error toast
        // toast.error('Erreur lors de l\'ajout au panier')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      // Optional: Show error toast
      // toast.error('Erreur lors de l\'ajout au panier')
    }
  }

  // Loading state
  if (loading) {
    return (
      <RevolutionaryPageTemplate variant="product">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-lg">Loading product...</p>
          </div>
        </div>
      </RevolutionaryPageTemplate>
    )
  }

  // Error state
  if (error) {
    return (
      <RevolutionaryPageTemplate variant="product">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-red-500">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="mb-4">{error}</p>
            <Button onClick={() => router.push('/')} className="bg-green-500 text-white hover:bg-green-600">
              Go Back Home
            </Button>
          </div>
        </div>
      </RevolutionaryPageTemplate>
    )
  }

  return (
    <RevolutionaryPageTemplate
      variant="product"
      seo={{
        title: sampleProduct.name,
        description: sampleProduct.description,
        keywords: [sampleProduct.category, sampleProduct.brand.name, 'supplément', 'DZBodyFit']
      }}
    >
      <div className="space-y-12">
        {/* Product Header */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-white to-dzbodyfit-gray-light">
              <Image
                src={sampleProduct.images[selectedImage]}
                alt={sampleProduct.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {sampleProduct.originalPrice > sampleProduct.price && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-dzbodyfit-red text-white">
                    -{Math.round((1 - sampleProduct.price / sampleProduct.originalPrice) * 100)}%
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {sampleProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index 
                      ? 'border-dzbodyfit-green' 
                      : 'border-transparent hover:border-dzbodyfit-gray'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${sampleProduct.name} vue ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-dzbodyfit-green text-dzbodyfit-green">
                  {sampleProduct.category}
                </Badge>
                {sampleProduct.brand.verified && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Marque Vérifiée
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-dzbodyfit-black mb-2">
                {sampleProduct.name}
              </h1>
              
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src={sampleProduct.brand.logo}
                  alt={sampleProduct.brand.name}
                  width={60}
                  height={30}
                  className="object-contain"
                />
                <span className="text-dzbodyfit-gray">par {sampleProduct.brand.name}</span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(sampleProduct.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-dzbodyfit-gray-light'
                      }`}
                    />
                  ))}
                  <span className="font-semibold text-dzbodyfit-black ml-1">
                    {sampleProduct.rating}
                  </span>
                </div>
                <span className="text-dzbodyfit-gray">
                  ({sampleProduct.reviewCount} avis)
                </span>
                <span className="text-dzbodyfit-gray">
                  {sampleProduct.soldCount} vendus
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-dzbodyfit-green">
                  {currentPrice.toLocaleString()} DZD
                </span>
                {product?.sale_price && (
                  <span className="text-xl text-dzbodyfit-gray line-through">
                    {product.price.toLocaleString()} DZD
                  </span>
                )}
              </div>
              {product && (
                <p className="text-sm text-dzbodyfit-gray">
                  Stock: {product.stock_quantity} available
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {sampleProduct.inStock ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700 font-medium">En stock</span>
                  <span className="text-dzbodyfit-gray">
                    ({sampleProduct.stockLevel} unités disponibles)
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">Rupture de stock</span>
                </>
              )}
            </div>

            {/* Variants */}
            <div className="space-y-4">
              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-dzbodyfit-black mb-2">
                  Taille
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {sampleProduct.variants.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(index)}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        selectedSize === index
                          ? 'border-dzbodyfit-green bg-dzbodyfit-green/5'
                          : 'border-dzbodyfit-gray-light hover:border-dzbodyfit-green/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{size.size}</span>
                          <span className="text-sm text-dzbodyfit-gray ml-2">
                            ({size.servings} portions)
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-dzbodyfit-green">
                            {size.price.toLocaleString()} DZD
                          </div>
                          {size.popular && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              Populaire
                            </Badge>
                          )}
                          {size.bestValue && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Meilleur Prix
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flavor Selection */}
              <div>
                <label className="block text-sm font-medium text-dzbodyfit-black mb-2">
                  Goût
                </label>
                <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleProduct.variants.flavors.map((flavor) => (
                      <SelectItem key={flavor} value={flavor}>
                        {flavor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dzbodyfit-black mb-2">
                  Quantité
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-dzbodyfit-green hover:bg-dzbodyfit-green/90 h-12 text-lg"
                  disabled={!sampleProduct.inStock || cartLoading}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {cartLoading ? 'Ajout en cours...' : `Ajouter au Panier - ${totalPrice.toLocaleString()} DZD`}
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-10">
                    <Heart className="h-4 w-4 mr-2" />
                    Favoris
                  </Button>
                  <Button variant="outline" className="h-10">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dzbodyfit-gray-light">
              <div className="text-center space-y-1">
                <Truck className="h-6 w-6 text-dzbodyfit-green mx-auto" />
                <p className="text-xs text-dzbodyfit-gray">Livraison 48h</p>
              </div>
              <div className="text-center space-y-1">
                <Shield className="h-6 w-6 text-dzbodyfit-green mx-auto" />
                <p className="text-xs text-dzbodyfit-gray">Paiement Sécurisé</p>
              </div>
              <div className="text-center space-y-1">
                <Award className="h-6 w-6 text-dzbodyfit-green mx-auto" />
                <p className="text-xs text-dzbodyfit-gray">Garantie Qualité</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Product Details Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="usage">Utilisation</TabsTrigger>
            <TabsTrigger value="reviews">Avis ({sampleProduct.reviewCount})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Description du Produit</h3>
                <p className="text-dzbodyfit-gray mb-6 leading-relaxed">
                  {sampleProduct.description}
                </p>
                
                <h4 className="font-semibold mb-3">Caractéristiques Principales</h4>
                <ul className="space-y-2">
                  {sampleProduct.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-dzbodyfit-green flex-shrink-0" />
                      <span className="text-dzbodyfit-gray">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Avantages</h4>
                <div className="space-y-4">
                  {sampleProduct.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="p-2 rounded-lg bg-dzbodyfit-green/10">
                        <benefit.icon className="h-5 w-5 text-dzbodyfit-green" />
                      </div>
                      <div>
                        <h5 className="font-medium">{benefit.title}</h5>
                        <p className="text-sm text-dzbodyfit-gray">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {sampleProduct.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="border-dzbodyfit-green text-dzbodyfit-green">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="nutrition" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Valeurs Nutritionnelles</CardTitle>
                  <p className="text-sm text-dzbodyfit-gray">
                    Par portion de {sampleProduct.nutritionFacts.servingSize}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-dzbodyfit-gray-light">
                    <span>Calories</span>
                    <span className="font-medium">{sampleProduct.nutritionFacts.calories} kcal</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dzbodyfit-gray-light">
                    <span>Protéines</span>
                    <span className="font-medium">{sampleProduct.nutritionFacts.protein}g</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dzbodyfit-gray-light">
                    <span>Glucides</span>
                    <span className="font-medium">{sampleProduct.nutritionFacts.carbs}g</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dzbodyfit-gray-light">
                    <span>Lipides</span>
                    <span className="font-medium">{sampleProduct.nutritionFacts.fat}g</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dzbodyfit-gray-light">
                    <span>Sucres</span>
                    <span className="font-medium">{sampleProduct.nutritionFacts.sugar}g</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Sodium</span>
                    <span className="font-medium">{sampleProduct.nutritionFacts.sodium}mg</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ingrédients</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {sampleProduct.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-dzbodyfit-green" />
                        <span className="text-dzbodyfit-gray">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="usage" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-dzbodyfit-green" />
                    Quand Prendre
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {sampleProduct.usage.timing.map((time, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-dzbodyfit-green" />
                        <span className="text-dzbodyfit-gray">{time}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-dzbodyfit-green" />
                    Dosage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-dzbodyfit-gray mb-4">{sampleProduct.usage.dosage}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Débutant</span>
                      <span className="text-sm font-medium">1 portion/jour</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Intermédiaire</span>
                      <span className="text-sm font-medium">1-2 portions/jour</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avancé</span>
                      <span className="text-sm font-medium">2-3 portions/jour</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-dzbodyfit-green" />
                    Préparation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-dzbodyfit-gray mb-4">{sampleProduct.usage.preparation}</p>
                  <div className="mt-4 p-3 bg-dzbodyfit-green/5 rounded-lg">
                    <p className="text-sm text-dzbodyfit-gray">
                      <strong>Conseil :</strong> Mixez pendant 30 secondes pour un mélange parfait
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-dzbodyfit-gray mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Système d&apos;Avis</h3>
              <p className="text-dzbodyfit-gray mb-4">
                Le système d&apos;avis client sera intégré dans la prochaine phase
              </p>
              <Badge className="bg-dzbodyfit-green text-white">
                Prochainement - Phase 5.2
              </Badge>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Related Products */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-dzbodyfit-black mb-2">
              Produits Recommandés
            </h2>
            <p className="text-dzbodyfit-gray">
              Complétez votre stack avec ces produits populaires
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((apiProduct) => (
              <ProductCard
                key={apiProduct.id}
                product={transformProductForCard(apiProduct)}
                onAddToCart={(product) => console.log('Add to cart:', product)}
              />
            ))}
          </div>
        </section>
      </div>
    </RevolutionaryPageTemplate>
  )
}

// Use server-side rendering to avoid build issues
export async function getServerSideProps() {
  return {
    props: {}
  }
}
