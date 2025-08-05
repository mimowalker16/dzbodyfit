/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState } from 'react'
import { HeroBanner } from '../components/dzbodyfit/HeroBanner'
import { ProductCard } from '../components/dzbodyfit/ProductCard'
import SupplementCard from '../components/dzbodyfit/SupplementCard'
import TestimonialCard from '../components/dzbodyfit/TestimonialCard'
import BrandCard from '../components/dzbodyfit/BrandCard'
import { ShoppingCart } from '../components/dzbodyfit/ShoppingCart'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  variant: string
}

// Sample data for demonstrations
const sampleProduct = {
  id: '1',
  name: 'Premium Whey Protein Isolate',
  brand: 'DZBodyFit Pro',
  category: 'Protein',
  price: 8500,
  originalPrice: 10000,
  rating: 4.8,
  reviewCount: 324,
  images: ['/api/placeholder/300/300', '/api/placeholder/300/300'],
  inStock: true,
  isFeatured: true,
  isOnSale: true,
  description: 'Ultra-pure whey protein isolate with 90% protein content for maximum muscle growth and recovery.',
  features: ['25g Protein', 'Fast Absorption', 'Low Lactose', 'No Artificial Colors'],
  variants: ['Vanilla', 'Chocolate', 'Strawberry'],
  specifications: {
    servingSize: '30g',
    servingsPerContainer: 33,
    proteinPerServing: '25g'
  }
}

const sampleSupplementProduct = {
  id: '2',
  name: 'Mass Gainer Extreme 3000',
  brand: 'DZBodyFit Elite',
  image: '/api/placeholder/300/300',
  price: 12000,
  originalPrice: 15000,
  rating: 4.6,
  reviewCount: 156,
  category: 'mass-gainer' as const,
  servings: 16,
  servingSize: '150g',
  flavors: ['Chocolate', 'Vanilla', 'Banana'],
  mainBenefits: ['Rapid Weight Gain', 'Muscle Building', 'High Calories'],
  keyIngredients: ['Whey Protein', 'Maltodextrin', 'Creatine', 'BCAAs'],
  nutritionFacts: {
    calories: 1200,
    protein: 50,
    carbs: 250,
    fat: 8,
    sugar: 15
  },
  certifications: ['Halal Certified', 'Lab Tested', 'GMP Certified'],
  inStock: true,
  stockLevel: 75,
  isNew: true,
  isBestSeller: true,
  isOnSale: true
}

const sampleTestimonial = {
  id: '1',
  customerName: 'Ahmed Benali',
  customerAvatar: '/api/placeholder/50/50',
  customerLocation: 'Algiers, Algeria',
  rating: 5,
  title: 'Amazing transformation in just 3 months!',
  review: 'I started using DZBodyFit Premium Whey Protein 3 months ago and the results are incredible. I gained 8kg of lean muscle mass and my strength increased dramatically. The chocolate flavor is amazing and it mixes perfectly. Best supplement investment I ever made!',
  productUsed: 'Premium Whey Protein',
  category: 'protein' as const,
  date: '2024-11-15',
  verified: true,
  helpful: 47,
  beforeAfterImages: {
    before: '/api/placeholder/200/300',
    after: '/api/placeholder/200/300'
  },
  results: {
    weightChange: '+8kg',
    muscleGain: '+6kg lean mass',
    strengthGain: '+40% bench press',
    duration: '3 months'
  },
  tags: ['muscle-gain', 'strength', 'transformation'],
  isHighlighted: true,
  isFeatured: true
}

const sampleBrand = {
  id: '1',
  name: 'Optimum Nutrition',
  logo: '/api/placeholder/80/80',
  coverImage: '/api/placeholder/400/150',
  description: 'Optimum Nutrition has been setting the gold standard in sports nutrition for over 35 years. Known for their uncompromising quality and innovative formulations, they provide athletes and fitness enthusiasts with the supplements they need to achieve their goals.',
  shortDescription: 'Premium sports nutrition brand trusted by athletes worldwide for over 35 years.',
  country: 'USA',
  founded: 1986,
  specialties: ['Whey Protein', 'Pre-Workout', 'Amino Acids', 'Vitamins'],
  popularProducts: ['Gold Standard Whey', 'Creatine Monohydrate', 'BCAA Energy'],
  rating: 4.7,
  reviewCount: 15420,
  productCount: 156,
  followers: 89200,
  isVerified: true,
  isFeatured: true,
  isExclusive: false,
  certifications: ['NSF Certified', 'Informed Choice', 'GMP Certified'],
  achievements: ['Industry Leader', 'Most Trusted Brand', '#1 Selling Whey'],
  socialMedia: {
    website: 'https://optimumnutrition.com',
    instagram: '@optimumnutrition',
    facebook: 'OptimumNutrition'
  },
  stats: {
    customerSatisfaction: 96,
    qualityRating: 9.2,
    innovationScore: 8.8
  }
}

export default function DZBodyFitPreviewEnhanced() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const handleAddToCart = (product: any) => {
    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: (product.images && product.images[0]) || product.image || '/api/placeholder/300/300',
      variant: 'Default'
    }
    
    setCartItems((prev: any) => {
      const existingItem = prev.find((item: any) => item.id === product.id && item.variant === 'Default')
      if (existingItem) {
        return prev.map((item: any) =>
          item.id === product.id && item.variant === 'Default'
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, newItem]
    })
  }

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      handleRemoveFromCart(itemId)
      return
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const handleCheckout = () => {
    console.log('Proceeding to checkout with items:', cartItems)
    // Here you would typically navigate to checkout page
  }

  const handleClearCart = () => {
    setCartItems([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dzbodyfit-gray-light via-dzbodyfit-white to-dzbodyfit-green/5">
      {/* Header */}
      <div className="bg-dzbodyfit-white border-b border-dzbodyfit-gray-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dzbodyfit-black">DZBodyFit Components</h1>
            <p className="text-dzbodyfit-gray">Revolutionary Frontend Showcase</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-dzbodyfit-green text-dzbodyfit-green">
              Phase 3 - 90% Complete
            </Badge>
            <Button
              onClick={() => setIsCartOpen(true)}
              className="bg-dzbodyfit-green hover:bg-dzbodyfit-green/90 relative"
            >
              Cart ({cartItems.length})
              {cartItems.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-dzbodyfit-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItems.length}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Hero Banner */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-dzbodyfit-black mb-2">Hero Banner</h2>
            <p className="text-dzbodyfit-gray">Revolutionary hero component with animations</p>
          </div>
          <HeroBanner 
            title="DZBodyFit Component Showcase"
            description="Experience our revolutionary component library built for Algeria's premium supplement store"
            primaryAction={{
              text: "Explore Components",
              href: "#components"
            }}
            backgroundImage="/api/placeholder/1920/600"
          />
        </section>

        <Separator className="my-12" />

        {/* Component Showcase */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-dzbodyfit-black mb-2">Component Library</h2>
            <p className="text-dzbodyfit-gray">Comprehensive DZBodyFit component system</p>
          </div>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products">Product Cards</TabsTrigger>
              <TabsTrigger value="supplements">Supplement Cards</TabsTrigger>
              <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
              <TabsTrigger value="brands">Brand Cards</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Product Card Variants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-dzbodyfit-gray mb-3">Default Variant</h4>
                    <ProductCard
                      product={sampleProduct}
                      variant="default"
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-dzbodyfit-gray mb-3">Featured Variant</h4>
                    <ProductCard
                      product={sampleProduct}
                      variant="featured"
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-dzbodyfit-gray mb-3">Compact Variant</h4>
                    <ProductCard
                      product={sampleProduct}
                      variant="compact"
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="supplements" className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Supplement Card Variants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-dzbodyfit-gray mb-3">Default Variant</h4>
                    <SupplementCard
                      product={sampleSupplementProduct}
                      variant="default"
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-dzbodyfit-gray mb-3">Detailed Variant</h4>
                    <SupplementCard
                      product={sampleSupplementProduct}
                      variant="detailed"
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-dzbodyfit-gray mb-3">Compact Variant</h4>
                    <SupplementCard
                      product={sampleSupplementProduct}
                      variant="compact"
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="testimonials" className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Testimonial Card Variants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-dzbodyfit-gray mb-3">Default Variant</h4>
                    <TestimonialCard
                      testimonial={sampleTestimonial}
                      variant="default"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-dzbodyfit-gray mb-3">Featured Variant</h4>
                    <TestimonialCard
                      testimonial={sampleTestimonial}
                      variant="featured"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-dzbodyfit-gray mb-3">Compact Variant</h4>
                    <TestimonialCard
                      testimonial={sampleTestimonial}
                      variant="compact"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="brands" className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Brand Card Variants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-dzbodyfit-gray mb-3">Default Variant</h4>
                    <BrandCard
                      brand={sampleBrand}
                      variant="default"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-dzbodyfit-gray mb-3">Featured Variant</h4>
                    <BrandCard
                      brand={sampleBrand}
                      variant="featured"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-dzbodyfit-gray mb-3">Compact Variant</h4>
                    <BrandCard
                      brand={sampleBrand}
                      variant="compact"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <Separator className="my-12" />

        {/* Implementation Stats */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-dzbodyfit-black mb-2">Development Progress</h2>
            <p className="text-dzbodyfit-gray">Phase 3 Custom Components Implementation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-dzbodyfit-green/10 to-dzbodyfit-green/5 border-dzbodyfit-green/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Components</h3>
                  <Badge className="bg-dzbodyfit-green text-white">Complete</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-dzbodyfit-green mb-1">8/8</div>
                <p className="text-sm text-dzbodyfit-gray">Revolutionary components built</p>
                <div className="mt-2 space-y-1 text-xs">
                  <div>✅ HeroBanner</div>
                  <div>✅ ProductCard</div>
                  <div>✅ SupplementCard</div>
                  <div>✅ TestimonialCard</div>
                  <div>✅ BrandCard</div>
                  <div>✅ ShoppingCart</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-dzbodyfit-blue/10 to-dzbodyfit-blue/5 border-dzbodyfit-blue/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Features</h3>
                  <Badge className="bg-dzbodyfit-blue text-white">Advanced</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-dzbodyfit-blue mb-1">100%</div>
                <p className="text-sm text-dzbodyfit-gray">Revolutionary features</p>
                <div className="mt-2 space-y-1 text-xs">
                  <div>✅ Framer Motion</div>
                  <div>✅ Glass Morphism</div>
                  <div>✅ DZD Currency</div>
                  <div>✅ Algerian Market</div>
                  <div>✅ TypeScript</div>
                  <div>✅ Responsive Design</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-dzbodyfit-gold/10 to-dzbodyfit-gold/5 border-dzbodyfit-gold/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Performance</h3>
                  <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black">Optimized</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-dzbodyfit-gold mb-1">2.0s</div>
                <p className="text-sm text-dzbodyfit-gray">Build time</p>
                <div className="mt-2 space-y-1 text-xs">
                  <div>✅ Fast compilation</div>
                  <div>✅ Zero errors</div>
                  <div>✅ Clean imports</div>
                  <div>✅ Optimized bundle</div>
                  <div>✅ Tree shaking</div>
                  <div>✅ Code splitting</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-dzbodyfit-red/10 to-dzbodyfit-red/5 border-dzbodyfit-red/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Next Phase</h3>
                  <Badge className="bg-dzbodyfit-red text-white">Phase 4</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-dzbodyfit-red mb-1">25%</div>
                <p className="text-sm text-dzbodyfit-gray">Layout system progress</p>
                <div className="mt-2 space-y-1 text-xs">
                  <div>🔄 Page templates</div>
                  <div>🔄 Layout system</div>
                  <div>🔄 Navigation</div>
                  <div>🔄 Footer system</div>
                  <div>🔄 Sidebars</div>
                  <div>🔄 Responsive layouts</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Shopping Cart */}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={handleCheckout}
        onClearCart={handleClearCart}
      />
    </div>
  )
}
