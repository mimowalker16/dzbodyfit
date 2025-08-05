"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { RevolutionaryPageTemplate } from '@/components/dzbodyfit/RevolutionaryPageTemplate'
import { ResponsiveLayoutGrid } from '@/components/dzbodyfit/ResponsiveLayoutGrid'
import { HeroBanner } from '@/components/dzbodyfit/HeroBanner'
import { ProductCard } from '@/components/dzbodyfit/ProductCard'
import BrandCard from '@/components/dzbodyfit/BrandCard'
import TestimonialCard from '@/components/dzbodyfit/TestimonialCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  Zap, 
  Award, 
  Shield, 
  Star,
  TrendingUp,
  Users,
  Package,
  Heart,
  ChevronRight,
  Play,
  ArrowRight,
  Target,
  Dumbbell,
  Trophy,
  Clock,
  CheckCircle,
  Sparkles,
  Flame,
  Instagram,
  Facebook,
  Youtube
} from 'lucide-react'

const featuredProducts = [
  {
    id: '1',
    name: 'DZBodyFit Pro Whey',
    brand: 'DZBodyFit Pro',
    price: 8500,
    originalPrice: 12000,
    rating: 4.9,
    reviewCount: 234,
    images: ['/api/placeholder/300/300'],
    category: 'Protein',
    isNew: true,
    isBestSeller: true,
    discount: 29,
    inStock: true,
    description: 'Premium whey protein isolate with added BCAAs and digestive enzymes for maximum absorption.',
    variants: ['Vanilla', 'Chocolate', 'Strawberry'],
    specifications: {
      servingSize: '30g',
      servingsPerContainer: 33,
      protein: '25g',
      carbs: '2g',
      fat: '1g'
    }
  },
  {
    id: '2',
    name: 'Explosive Pre-Workout',
    brand: 'MuscleTech',
    price: 6500,
    originalPrice: 8000,
    rating: 4.7,
    reviewCount: 189,
    images: ['/api/placeholder/300/300'],
    category: 'Pre-Workout',
    isBestSeller: true,
    discount: 19,
    inStock: true,
    description: 'High-stimulant pre-workout for intense training sessions with clinical doses of key ingredients.',
    specifications: {
      servingSize: '15g',
      servingsPerContainer: 30,
      caffeine: '300mg',
      betaAlanine: '3g',
      creatine: '3g'
    }
  },
  {
    id: '3',
    name: 'Mass Gainer Extreme',
    brand: 'Optimum Nutrition',
    price: 15000,
    rating: 4.8,
    reviewCount: 156,
    images: ['/api/placeholder/300/300'],
    category: 'Mass Gainer',
    inStock: true,
    description: 'High-calorie mass gainer with premium protein blend for serious muscle building.',
    specifications: {
      servingSize: '150g',
      servingsPerContainer: 16,
      calories: '630',
      protein: '50g',
      carbs: '85g'
    }
  }
]

const featuredBrands = [
  {
    id: '1',
    name: 'DZBodyFit Pro',
    logo: '/api/placeholder/120/60',
    coverImage: '/api/placeholder/400/150',
    description: 'Premium Algerian supplements made with international standards',
    shortDescription: 'Premium Algerian supplements made with international standards',
    country: 'Algeria',
    founded: 2016,
    specialties: ['Protein', 'Pre-Workout', 'Mass Gainers'],
    popularProducts: ['DZBodyFit Pro Whey', 'Mass Gainer Pro', 'Pre-Workout Elite'],
    rating: 4.9,
    reviewCount: 1250,
    productCount: 15,
    followers: 25000,
    isVerified: true,
    isFeatured: true,
    isExclusive: true,
    certifications: ['ISO Certified', 'Lab Tested', 'Halal Certified'],
    achievements: ['Best Local Brand', 'Customer Choice Award'],
    socialMedia: {
      website: 'https://dzbodyfit.com',
      instagram: '@dzbodyfit',
      facebook: 'DZBodyFit'
    },
    stats: {
      customerSatisfaction: 98,
      qualityRating: 9.5,
      innovationScore: 9.0
    }
  },
  {
    id: '2',
    name: 'Optimum Nutrition',
    logo: '/api/placeholder/120/60',
    coverImage: '/api/placeholder/400/150',
    description: 'World leader in sports nutrition and supplement innovation',
    shortDescription: 'World leader in sports nutrition and supplement innovation',
    country: 'USA',
    founded: 1986,
    specialties: ['Protein', 'Amino Acids', 'Vitamins'],
    popularProducts: ['Gold Standard Whey', 'BCAA Energy', 'Creatine Mono'],
    rating: 4.8,
    reviewCount: 5600,
    productCount: 45,
    followers: 125000,
    isVerified: true,
    isFeatured: true,
    isExclusive: false,
    certifications: ['NSF Certified', 'Informed Choice', 'GMP Certified'],
    achievements: ['Industry Leader', 'Most Trusted Brand'],
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
  },
  {
    id: '3',
    name: 'MuscleTech',
    logo: '/api/placeholder/120/60',
    coverImage: '/api/placeholder/400/150',
    description: 'Science-driven supplements for serious athletes',
    shortDescription: 'Science-driven supplements for serious athletes',
    country: 'Canada',
    founded: 1995,
    specialties: ['Pre-Workout', 'Creatine', 'Fat Burners'],
    popularProducts: ['Nitro-Tech Whey', 'Cell-Tech Creatine', 'Hydroxycut'],
    rating: 4.7,
    reviewCount: 3400,
    productCount: 34,
    followers: 89000,
    isVerified: true,
    isFeatured: true,
    isExclusive: false,
    certifications: ['Science-Based', 'Third-Party Tested', 'GMP Certified'],
    achievements: ['Innovation Award', 'Research Excellence'],
    socialMedia: {
      website: 'https://muscletech.com',
      instagram: '@muscletech',
      facebook: 'MuscleTech'
    },
    stats: {
      customerSatisfaction: 94,
      qualityRating: 8.9,
      innovationScore: 9.2
    }
  }
]

const testimonials = [
  {
    id: '1',
    customerName: 'Ahmed Benali',
    customerAvatar: '/api/placeholder/50/50',
    customerLocation: 'Algiers, Algeria',
    rating: 5,
    title: 'Amazing transformation in just 6 months!',
    review: 'DZBodyFit transformed my training completely. The quality of supplements is exceptional and the delivery is always on time.',
    productUsed: 'DZBodyFit Pro Whey',
    category: 'protein' as const,
    date: '2024-07-15',
    verified: true,
    helpful: 47,
    beforeAfterImages: {
      before: '/api/placeholder/150/200',
      after: '/api/placeholder/150/200'
    },
    results: {
      weightChange: '+15kg muscle',
      muscleGain: '+12kg lean mass',
      strengthGain: '+50% bench press',
      duration: '6 months'
    },
    tags: ['muscle-gain', 'transformation', 'bodybuilding'],
    isHighlighted: true,
    isFeatured: true
  },
  {
    id: '2',
    customerName: 'Fatima Cherif',
    customerAvatar: '/api/placeholder/50/50',
    customerLocation: 'Oran, Algeria',
    rating: 5,
    title: 'Best supplements store in Algeria!',
    review: 'Amazing customer service and authentic products. Finally found a trustworthy supplement store in Algeria!',
    productUsed: 'Explosive Pre-Workout',
    category: 'pre-workout' as const,
    date: '2024-06-20',
    verified: true,
    helpful: 32,
    beforeAfterImages: {
      before: '/api/placeholder/150/200',
      after: '/api/placeholder/150/200'
    },
    results: {
      weightChange: '-12kg fat',
      muscleGain: '+5kg lean mass',
      strengthGain: '+30% overall',
      duration: '4 months'
    },
    tags: ['fat-loss', 'fitness', 'transformation'],
    isHighlighted: true,
    isFeatured: true
  },
  {
    id: '3',
    customerName: 'Yacine Meziani',
    customerAvatar: '/api/placeholder/50/50',
    customerLocation: 'Constantine, Algeria',
    rating: 5,
    title: 'Genuine products, fast delivery!',
    review: 'The best supplement store in Algeria. Fast shipping and genuine products. Highly recommended!',
    productUsed: 'Mass Gainer Extreme',
    category: 'mass-gainer' as const,
    date: '2024-05-10',
    verified: true,
    helpful: 28,
    beforeAfterImages: {
      before: '/api/placeholder/150/200',
      after: '/api/placeholder/150/200'
    },
    results: {
      weightChange: '+20kg muscle',
      muscleGain: '+18kg lean mass',
      strengthGain: '+60% deadlift',
      duration: '8 months'
    },
    tags: ['mass-gain', 'powerlifting', 'transformation'],
    isHighlighted: true,
    isFeatured: true
  }
]

const categories = [
  {
    id: 'protein',
    name: 'Protein',
    icon: <Dumbbell className="w-8 h-8" />,
    description: 'Build lean muscle with premium protein supplements',
    productCount: 156,
    image: '/api/placeholder/400/300',
    color: 'from-dzbodyfit-green to-dzbodyfit-blue',
    popular: true
  },
  {
    id: 'pre-workout',
    name: 'Pre-Workout',
    icon: <Zap className="w-8 h-8" />,
    description: 'Explosive energy for intense training sessions',
    productCount: 89,
    image: '/api/placeholder/400/300',
    color: 'from-dzbodyfit-blue to-purple-500',
    popular: true
  },
  {
    id: 'mass-gainers',
    name: 'Mass Gainers',
    icon: <TrendingUp className="w-8 h-8" />,
    description: 'High-calorie formulas for serious muscle building',
    productCount: 45,
    image: '/api/placeholder/400/300',
    color: 'from-dzbodyfit-gold to-orange-500'
  },
  {
    id: 'creatine',
    name: 'Creatine',
    icon: <Target className="w-8 h-8" />,
    description: 'Enhance strength and power performance',
    productCount: 67,
    image: '/api/placeholder/400/300',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'vitamins',
    name: 'Vitamins',
    icon: <Shield className="w-8 h-8" />,
    description: 'Essential nutrients for optimal health',
    productCount: 123,
    image: '/api/placeholder/400/300',
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 'fat-burners',
    name: 'Fat Burners',
    icon: <Flame className="w-8 h-8" />,
    description: 'Accelerate fat loss and boost metabolism',
    productCount: 78,
    image: '/api/placeholder/400/300',
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

export default function HomePage() {
  return (
    <RevolutionaryPageTemplate
      variant="default"
      seo={{
        title: "DZBodyFit - Algeria's #1 Supplement Store",
        description: "Premium fitness supplements, protein powder, pre-workout, and mass gainers. Fast delivery across Algeria. Authentic products, expert advice."
      }}
      className="bg-gradient-to-br from-white via-dzbodyfit-gray-light/20 to-white"
    >
      {/* Hero Section */}
      <section className="relative -mt-8 mb-16">
        <HeroBanner
          variant="home"
          title="Transform Your Fitness Journey"
          subtitle="Algeria's Premier Destination for Premium Supplements"
          description="Discover authentic protein powders, pre-workouts, and mass gainers from world-renowned brands. Fast delivery across all Algeria with expert nutrition guidance."
          primaryAction={{
            text: "Shop Now",
            href: "/shop"
          }}
          secondaryAction={{
            text: "View Success Stories",
            href: "#testimonials"
          }}
          backgroundImage="/api/placeholder/1920/800"
        />
      </section>

      {/* Stats Section */}
      <section className="mb-16">
        <div className="max-w-6xl mx-auto">
          <ResponsiveLayoutGrid columns={4} gap="lg" className="text-center">
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
          </ResponsiveLayoutGrid>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-16">
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
          
          <ResponsiveLayoutGrid columns={3} gap="lg">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} variant="featured" />
              </motion.div>
            ))}
          </ResponsiveLayoutGrid>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mb-16 bg-gradient-to-r from-dzbodyfit-green/5 to-dzbodyfit-blue/5 py-16 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
          
          <ResponsiveLayoutGrid columns={3} gap="lg" className="mb-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer"
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className={`h-48 bg-gradient-to-br ${category.color} relative`}>
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute top-4 right-4">
                      {category.popular && <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black">Popular</Badge>}
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      {category.icon}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                    <p className="text-dzbodyfit-gray mb-3">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dzbodyfit-gray">{category.productCount} products</span>
                      <ChevronRight className="w-4 h-4 text-dzbodyfit-green group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </ResponsiveLayoutGrid>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Trusted Brands
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-dzbodyfit-gray text-lg max-w-2xl mx-auto"
            >
              We partner with the world&apos;s leading supplement brands
            </motion.p>
          </div>
          
          <ResponsiveLayoutGrid columns={3} gap="lg">
            {featuredBrands.map((brand, index) => (
              <motion.div
                key={brand.id}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <BrandCard brand={brand} variant="featured" />
              </motion.div>
            ))}
          </ResponsiveLayoutGrid>
        </div>
      </section>

      {/* Success Stories */}
      <section id="testimonials" className="mb-16 bg-gradient-to-r from-dzbodyfit-black/5 to-dzbodyfit-gray/5 py-16 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Success Stories
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-dzbodyfit-gray text-lg max-w-2xl mx-auto"
            >
              Real transformations from our DZBodyFit community
            </motion.p>
          </div>
          
          <ResponsiveLayoutGrid columns={3} gap="lg">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.15 }}
              >
                <TestimonialCard testimonial={testimonial} variant="featured" />
              </motion.div>
            ))}
          </ResponsiveLayoutGrid>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-dzbodyfit-green text-dzbodyfit-green hover:bg-dzbodyfit-green hover:text-white">
              View All Success Stories
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
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
          
          <ResponsiveLayoutGrid columns={4} gap="lg">
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
          </ResponsiveLayoutGrid>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="relative overflow-hidden"
          >
            <Card className="border-0 bg-gradient-to-r from-dzbodyfit-green to-dzbodyfit-blue p-8 md:p-12 text-white text-center relative">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-80" />
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

      {/* Social Proof */}
      <section className="mb-16">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h3 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold mb-8"
          >
            Follow Our Journey
          </motion.h3>
          
          <div className="flex justify-center space-x-8 mb-8">
            {[
              { icon: <Instagram className="w-8 h-8" />, followers: '50K', platform: 'Instagram' },
              { icon: <Facebook className="w-8 h-8" />, followers: '25K', platform: 'Facebook' },
              { icon: <Youtube className="w-8 h-8" />, followers: '15K', platform: 'YouTube' }
            ].map((social, index) => (
              <motion.div
                key={social.platform}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center space-y-2 group cursor-pointer"
              >
                <div className="p-4 rounded-full bg-dzbodyfit-green/10 group-hover:bg-dzbodyfit-green/20 transition-colors">
                  <div className="text-dzbodyfit-green">{social.icon}</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{social.followers}</div>
                  <div className="text-sm text-dzbodyfit-gray">{social.platform}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </RevolutionaryPageTemplate>
  )
}
