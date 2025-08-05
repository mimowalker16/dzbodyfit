"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RevolutionaryHeader } from '@/components/dzbodyfit/RevolutionaryHeader'
import { RevolutionaryFooter } from '@/components/dzbodyfit/RevolutionaryFooter'
import { HeroBanner } from '@/components/dzbodyfit/HeroBanner'
import { ProductCard } from '@/components/dzbodyfit/ProductCard'
import { ShoppingCart } from '@/components/dzbodyfit/ShoppingCart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { api, type Product, type Category } from '@/lib/api'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/router'
import { 
  Zap, 
  Shield, 
  Users,
  Package,
  Trophy,
  Clock,
  CheckCircle,
  Heart,
  ChevronRight,
  ArrowRight,
  Target,
  Dumbbell,
  TrendingUp,
  Flame
} from 'lucide-react'

// Default categories for fallback
const defaultCategories = [
  {
    id: 'protein',
    name: 'Protein',
    slug: 'protein',
    icon: <Dumbbell className="w-8 h-8" />,
    description: 'Build lean muscle with premium protein supplements',
    productCount: 156,
    color: 'from-dzbodyfit-green to-dzbodyfit-blue',
    popular: true
  },
  {
    id: 'pre-workout',
    name: 'Pre-Workout',
    slug: 'pre-workout',
    icon: <Zap className="w-8 h-8" />,
    description: 'Explosive energy for intense training sessions',
    productCount: 89,
    color: 'from-dzbodyfit-blue to-purple-500',
    popular: true
  },
  {
    id: 'mass-gainers',
    name: 'Mass Gainers',
    slug: 'mass-gainers',
    icon: <TrendingUp className="w-8 h-8" />,
    description: 'High-calorie formulas for serious muscle building',
    productCount: 45,
    color: 'from-dzbodyfit-gold to-orange-500'
  },
  {
    id: 'creatine',
    name: 'Creatine',
    slug: 'creatine',
    icon: <Target className="w-8 h-8" />,
    description: 'Enhance strength and power performance',
    productCount: 67,
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'vitamins',
    name: 'Vitamins',
    slug: 'vitamins',
    icon: <Shield className="w-8 h-8" />,
    description: 'Essential nutrients for optimal health',
    productCount: 123,
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 'fat-burners',
    name: 'Fat Burners',
    slug: 'fat-burners',
    icon: <Flame className="w-8 h-8" />,
    description: 'Accelerate fat loss and boost metabolism',
    productCount: 78,
    color: 'from-orange-500 to-red-500'
  }
]

const stats = [
  { label: 'Happy Customers', value: '25,000+', icon: <Users className="w-6 h-6" /> },
  { label: 'Products Sold', value: '150,000+', icon: <Package className="w-6 h-6" /> },
  { label: 'Success Stories', value: '5,000+', icon: <Trophy className="w-6 h-6" /> },
  { label: 'Years Experience', value: '8+', icon: <Clock className="w-6 h-6" /> }
]

const features = [
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: 'Authentic Products',
    description: 'Only genuine supplements from verified brands'
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Fast Delivery',
    description: '24-48h delivery across all Algeria'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Lab Tested',
    description: 'Third-party tested for purity and potency'
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Customer Support',
    description: '24/7 expert nutrition guidance'
  }
]

function ResponsiveGrid({ children, columns = 3, gap = 'lg', className = '' }: {
  children: React.ReactNode
  columns?: number
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const getGridCols = () => {
    switch (columns) {
      case 1: return 'grid-cols-1'
      case 2: return 'grid-cols-1 md:grid-cols-2'
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      case 6: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  const getGapSize = () => {
    switch (gap) {
      case 'sm': return 'gap-2'
      case 'md': return 'gap-4'
      case 'lg': return 'gap-6'
      case 'xl': return 'gap-8'
      default: return 'gap-4'
    }
  }

  return (
    <div className={`grid ${getGridCols()} ${getGapSize()} ${className}`}>
      {children}
    </div>
  )
}

export default function HomepageRevolution() {
  const router = useRouter()
  const { itemCount } = useCart()
  
  // State for API data
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Cart UI state
  const [cartOpen, setCartOpen] = useState(false)

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load featured products, new products, and categories in parallel
        const [featuredResponse, newResponse, categoriesResponse] = await Promise.all([
          api.products.getFeatured(6),
          api.products.getNew(3),
          api.categories.getAll()
        ])

        if (featuredResponse.success) {
          setFeaturedProducts(featuredResponse.data.items)
        }

        if (newResponse.success) {
          setNewProducts(newResponse.data.items)
        }

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data.categories)
        }

      } catch (err) {
        console.error('Failed to load homepage data:', err)
        setError('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Use default categories as fallback with proper mapping
  const displayCategories = categories.length > 0 
    ? categories.slice(0, 6).map((cat, index) => {
        const defaultCat = defaultCategories[index] || defaultCategories[0]
        return {
          ...cat,
          icon: defaultCat.icon,
          color: defaultCat.color,
          description: cat.description || defaultCat.description,
          productCount: defaultCat.productCount, // TODO: Get real count from API
          popular: defaultCat.popular
        }
      })
    : defaultCategories

  // Transform API products to match ProductCard interface
  const transformProduct = (product: Product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand?.name || 'DZBodyFit',
    description: product.description || `Premium ${product.name} supplement`,
    price: product.sale_price || product.price,
    originalPrice: product.sale_price ? product.price : undefined,
    discount: product.sale_price ? Math.round(((product.price - product.sale_price) / product.price) * 100) : undefined,
    rating: 4.5, // TODO: Add rating to API
    reviewCount: Math.floor(Math.random() * 200) + 50, // TODO: Add reviews to API
    images: product.images.length > 0 ? product.images : ['/api/placeholder/300/300'],
    category: product.category?.name || 'Supplements',
    inStock: product.stock_quantity > 0,
    stockCount: product.stock_quantity,
    isNew: false, // TODO: Add logic based on created_at
    isBestseller: product.is_featured,
    currency: 'DZD'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-dzbodyfit-gray-light/20 to-white">
      {/* Header */}
      <RevolutionaryHeader 
        cartItemCount={itemCount}
        onCartClick={() => setCartOpen(true)}
      />

      {/* Cart Sidebar */}
      <ShoppingCart 
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      {/* Main Content */}
      <main className="pt-0">
        {/* Hero Section */}
        <section className="relative mb-16">
          <HeroBanner
            variant="home"
            title="Transform Your Fitness Journey"
            subtitle="Algeria&apos;s Premier Destination for Premium Supplements"
            description="Discover authentic protein powders, pre-workouts, and mass gainers from world-renowned brands. Fast delivery across all Algeria with expert nutrition guidance."
            backgroundImage="/api/placeholder/1920/800"
            primaryAction={{
              text: "Shop Now",
              href: "/shop"
            }}
            secondaryAction={{
              text: "Learn More",
              href: "/about"
            }}
          />
        </section>

        {/* Stats Section */}
        <section className="mb-16 px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ResponsiveGrid columns={4} gap="lg" className="text-center">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className="p-6 border-2 border-dzbodyfit-green/20 bg-gradient-to-br from-white to-dzbodyfit-green/5 hover:border-dzbodyfit-green/40 transition-all duration-300 hover:scale-105">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-3 rounded-full bg-dzbodyfit-green/10">
                        <div className="text-dzbodyfit-green">{stat.icon}</div>
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-dzbodyfit-green to-dzbodyfit-blue bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className="text-dzbodyfit-gray font-medium">{stat.label}</div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </ResponsiveGrid>
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-16 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <motion.h2 
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  className="text-3xl md:text-4xl font-bold mb-2"
                >
                  🔥 Featured Products
                </motion.h2>
                <motion.p 
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-dzbodyfit-gray"
                >
                  Discover our most popular supplements
                </motion.p>
              </div>
              <Button className="bg-dzbodyfit-green hover:bg-dzbodyfit-green/90">
                View All Products
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            {/* Loading State */}
            {loading && (
              <ResponsiveGrid columns={3} gap="lg">
                {[...Array(6)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="animate-pulse"
                  >
                    <Card className="h-96">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </ResponsiveGrid>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">Failed to load products</p>
                  <p className="text-sm text-gray-500">{error}</p>
                </div>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-dzbodyfit-green hover:bg-dzbodyfit-green/90"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && (
              <ResponsiveGrid columns={3} gap="lg">
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ y: 40, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard product={transformProduct(product)} variant="featured" />
                  </motion.div>
                ))}
              </ResponsiveGrid>
            )}

            {/* No Products State */}
            {!loading && !error && featuredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold text-gray-600">No featured products available</p>
                <p className="text-sm text-gray-500">Check back later for new products</p>
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-16 bg-gradient-to-r from-dzbodyfit-green/5 to-dzbodyfit-blue/5 py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Shop by Category
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-dzbodyfit-gray text-lg max-w-2xl mx-auto"
              >
                Find the perfect supplements for your fitness goals
              </motion.p>
            </div>
            
            <ResponsiveGrid columns={3} gap="lg">
              {displayCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative group cursor-pointer"
                >
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className={`h-48 bg-gradient-to-br ${category.color || 'from-dzbodyfit-green to-dzbodyfit-blue'} relative flex items-center justify-center`}>
                      <div className="text-white">{category.icon || <Package className="w-8 h-8" />}</div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                      <p className="text-dzbodyfit-gray mb-3">{category.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-dzbodyfit-gray">{category.productCount || 0} products</span>
                        <ChevronRight className="w-4 h-4 text-dzbodyfit-green group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </ResponsiveGrid>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16 px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Why Choose DZBodyFit?
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-dzbodyfit-gray text-lg max-w-2xl mx-auto"
              >
                We&apos;re committed to providing the best supplement experience in Algeria
              </motion.p>
            </div>
            
            <ResponsiveGrid columns={4} gap="lg">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="p-4 rounded-full bg-dzbodyfit-green/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-dzbodyfit-green/20 transition-colors">
                    <div className="text-dzbodyfit-green">{feature.icon}</div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-dzbodyfit-gray">{feature.description}</p>
                </motion.div>
              ))}
            </ResponsiveGrid>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="mb-16 px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="relative overflow-hidden"
            >
              <Card className="border-0 bg-gradient-to-r from-dzbodyfit-green to-dzbodyfit-blue p-8 md:p-12 text-white text-center relative">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    Get Exclusive Fitness Tips & Offers
                  </h3>
                  <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                    Join 25,000+ fitness enthusiasts and get weekly nutrition tips, workout guides, and exclusive discounts on premium supplements.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 rounded-lg text-dzbodyfit-black focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <Button className="bg-white text-dzbodyfit-green hover:bg-white/90 font-semibold px-8">
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-white/70 text-sm mt-4">
                    No spam, unsubscribe anytime. Privacy protected.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <RevolutionaryFooter />

      {/* Scroll to Top */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          size="lg"
          className="rounded-full w-12 h-12 p-0 bg-dzbodyfit-green hover:bg-dzbodyfit-green/90 shadow-lg"
        >
          <ChevronRight className="w-6 h-6 rotate-[-90deg]" />
        </Button>
      </motion.div>
    </div>
  )
}
