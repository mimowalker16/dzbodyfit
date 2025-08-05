"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { DZBodyFitLogo } from './DZBodyFitLogo'
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Heart,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  Star,
  Truck,
  Shield,
  Award,
  Zap,
  Target,
  Dumbbell,
  FlaskConical,
  Beef,
  Activity,
  Pill
} from 'lucide-react'

interface NavigationItem {
  label: string
  href: string
  icon?: React.ReactNode
  badge?: string
  megaMenu?: {
    featured?: {
      title: string
      description: string
      image: string
      href: string
    }
    categories: {
      title: string
      items: {
        label: string
        href: string
        description?: string
        isNew?: boolean
        isPopular?: boolean
      }[]
    }[]
    quickLinks?: {
      label: string
      href: string
      icon: React.ReactNode
    }[]
  }
}

interface HeaderProps {
  cartItemCount?: number
  isLoggedIn?: boolean
  userName?: string
  onCartClick?: () => void
  onLoginClick?: () => void
  onProfileClick?: () => void
  className?: string
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Supplements',
    href: '/supplements',
    megaMenu: {
      featured: {
        title: 'Premium Whey Protein Isolate',
        description: 'Ultra-pure protein for maximum muscle growth',
        image: '/api/placeholder/300/200',
        href: '/products/premium-whey-isolate'
      },
      categories: [
        {
          title: 'Protein & Muscle Building',
          items: [
            { label: 'Whey Protein', href: '/supplements/whey-protein', description: 'Fast-absorbing protein', isPopular: true },
            { label: 'Casein Protein', href: '/supplements/casein-protein', description: 'Slow-release protein' },
            { label: 'Mass Gainers', href: '/supplements/mass-gainers', description: 'High-calorie formulas' },
            { label: 'Protein Bars', href: '/supplements/protein-bars', description: 'Convenient protein snacks' },
            { label: 'Amino Acids (BCAAs)', href: '/supplements/bcaa', description: 'Essential amino acids', isNew: true }
          ]
        },
        {
          title: 'Performance & Energy',
          items: [
            { label: 'Pre-Workout', href: '/supplements/pre-workout', description: 'Energy & focus boosters', isPopular: true },
            { label: 'Creatine', href: '/supplements/creatine', description: 'Strength & power enhancer' },
            { label: 'Energy Drinks', href: '/supplements/energy-drinks', description: 'Instant energy boost' },
            { label: 'Nitric Oxide', href: '/supplements/nitric-oxide', description: 'Pump enhancers' }
          ]
        },
        {
          title: 'Health & Wellness',
          items: [
            { label: 'Multivitamins', href: '/supplements/multivitamins', description: 'Daily nutrition support' },
            { label: 'Omega-3', href: '/supplements/omega-3', description: 'Heart & brain health' },
            { label: 'Probiotics', href: '/supplements/probiotics', description: 'Digestive health' },
            { label: 'Weight Loss', href: '/supplements/weight-loss', description: 'Fat burning support', isNew: true }
          ]
        }
      ],
      quickLinks: [
        { label: 'Best Sellers', href: '/supplements/best-sellers', icon: <Award className="w-4 h-4" /> },
        { label: 'New Arrivals', href: '/supplements/new', icon: <Zap className="w-4 h-4" /> },
        { label: 'On Sale', href: '/supplements/sale', icon: <Target className="w-4 h-4" /> }
      ]
    }
  },
  {
    label: 'Brands',
    href: '/brands',
    megaMenu: {
      featured: {
        title: 'Optimum Nutrition',
        description: 'Gold Standard in Sports Nutrition',
        image: '/api/placeholder/300/200',
        href: '/brands/optimum-nutrition'
      },
      categories: [
        {
          title: 'Premium Brands',
          items: [
            { label: 'Optimum Nutrition', href: '/brands/optimum-nutrition', isPopular: true },
            { label: 'MuscleTech', href: '/brands/muscletech' },
            { label: 'BSN', href: '/brands/bsn' },
            { label: 'Dymatize', href: '/brands/dymatize' },
            { label: 'Gaspari Nutrition', href: '/brands/gaspari' }
          ]
        },
        {
          title: 'Local Brands',
          items: [
            { label: 'DZBodyFit Pro', href: '/brands/dzbodyfit-pro', isNew: true },
            { label: 'Algeria Nutrition', href: '/brands/algeria-nutrition' },
            { label: 'Mediterranean Supplements', href: '/brands/med-supplements' }
          ]
        }
      ]
    }
  },
  {
    label: 'Equipment',
    href: '/equipment',
    badge: 'New'
  },
  {
    label: 'Nutrition',
    href: '/nutrition'
  }
]

export function RevolutionaryHeader({
  cartItemCount = 0,
  isLoggedIn = false,
  userName,
  onCartClick,
  onLoginClick,
  onProfileClick,
  className = ''
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleDropdownToggle = (itemLabel: string) => {
    setActiveDropdown(activeDropdown === itemLabel ? null : itemLabel)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Handle search functionality
      console.log('Searching for:', searchQuery)
    }
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-dzbodyfit-green text-white py-2 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>+213 555 123 456</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>support@dzbodyfit.dz</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Free delivery in Algiers</span>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Free shipping over 5000 DZD</span>
            </div>
            <Separator orientation="vertical" className="h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>100% Authentic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-dzbodyfit-gray-light/20' 
            : 'bg-white shadow-sm'
        } ${className}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <DZBodyFitLogo variant="full" size="lg" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <div key={item.label} className="relative">
                  <Button
                    variant="ghost"
                    className="h-auto p-2 font-medium text-dzbodyfit-black hover:text-dzbodyfit-green hover:bg-dzbodyfit-green/5 transition-all duration-200"
                    onMouseEnter={() => item.megaMenu && setActiveDropdown(item.label)}
                    onMouseLeave={() => item.megaMenu && setActiveDropdown(null)}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                      {item.badge && (
                        <Badge className="bg-dzbodyfit-red text-white text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {item.megaMenu && (
                        <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                      )}
                    </span>
                  </Button>

                  {/* Mega Menu */}
                  <AnimatePresence>
                    {item.megaMenu && activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 w-screen max-w-6xl bg-white shadow-2xl border border-dzbodyfit-gray-light/20 rounded-lg mt-2"
                        onMouseEnter={() => setActiveDropdown(item.label)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <div className="p-6">
                          <div className="grid grid-cols-12 gap-6">
                            {/* Featured Product */}
                            {item.megaMenu.featured && (
                              <div className="col-span-4">
                                <div className="bg-gradient-to-br from-dzbodyfit-green/5 to-dzbodyfit-blue/5 rounded-lg p-4 h-full">
                                  <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black mb-3">
                                    Featured
                                  </Badge>
                                  <img
                                    src={item.megaMenu.featured.image}
                                    alt={item.megaMenu.featured.title}
                                    className="w-full h-32 object-cover rounded-lg mb-3"
                                  />
                                  <h4 className="font-bold text-lg mb-2">{item.megaMenu.featured.title}</h4>
                                  <p className="text-dzbodyfit-gray text-sm mb-3">{item.megaMenu.featured.description}</p>
                                  <Button className="bg-dzbodyfit-green hover:bg-dzbodyfit-green/90 w-full">
                                    View Product
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Categories */}
                            <div className="col-span-8">
                              <div className="grid grid-cols-3 gap-6">
                                {item.megaMenu.categories.map((category, categoryIndex) => (
                                  <div key={categoryIndex}>
                                    <h4 className="font-semibold text-dzbodyfit-black mb-3 flex items-center gap-2">
                                      {categoryIndex === 0 && <Dumbbell className="w-4 h-4" />}
                                      {categoryIndex === 1 && <FlaskConical className="w-4 h-4" />}
                                      {categoryIndex === 2 && <Activity className="w-4 h-4" />}
                                      {category.title}
                                    </h4>
                                    <ul className="space-y-2">
                                      {category.items.map((subItem, subIndex) => (
                                        <li key={subIndex}>
                                          <a
                                            href={subItem.href}
                                            className="group flex items-center justify-between p-2 rounded-md hover:bg-dzbodyfit-gray-light/30 transition-colors duration-200"
                                          >
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-dzbodyfit-black group-hover:text-dzbodyfit-green transition-colors">
                                                  {subItem.label}
                                                </span>
                                                {subItem.isNew && (
                                                  <Badge className="bg-dzbodyfit-blue text-white text-xs">New</Badge>
                                                )}
                                                {subItem.isPopular && (
                                                  <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black text-xs">Popular</Badge>
                                                )}
                                              </div>
                                              {subItem.description && (
                                                <p className="text-xs text-dzbodyfit-gray mt-1">
                                                  {subItem.description}
                                                </p>
                                              )}
                                            </div>
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>

                              {/* Quick Links */}
                              {item.megaMenu.quickLinks && (
                                <div className="mt-6 pt-4 border-t border-dzbodyfit-gray-light/20">
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-dzbodyfit-gray">Quick Access:</span>
                                    {item.megaMenu.quickLinks.map((link, linkIndex) => (
                                      <Button
                                        key={linkIndex}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                      >
                                        {link.icon}
                                        <span className="ml-1">{link.label}</span>
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search supplements, brands, nutrition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full pl-4 pr-12 py-2 border-2 transition-all duration-200 ${
                    isSearchFocused 
                      ? 'border-dzbodyfit-green ring-2 ring-dzbodyfit-green/20' 
                      : 'border-dzbodyfit-gray-light'
                  }`}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1 h-8 px-3 bg-dzbodyfit-green hover:bg-dzbodyfit-green/90"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Wishlist */}
              <Button variant="ghost" size="sm" className="hidden lg:flex">
                <Heart className="w-5 h-5" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onCartClick}
                className="relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-dzbodyfit-red text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              {/* User Account */}
              {isLoggedIn ? (
                <Button variant="ghost" size="sm" onClick={onProfileClick}>
                  <User className="w-5 h-5" />
                  <span className="hidden lg:inline ml-2">{userName || 'Account'}</span>
                </Button>
              ) : (
                <Button onClick={onLoginClick} className="bg-dzbodyfit-green hover:bg-dzbodyfit-green/90">
                  <span className="hidden lg:inline">Login</span>
                  <User className="w-5 h-5 lg:hidden" />
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-dzbodyfit-gray-light/20"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-12"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1 h-8 px-3 bg-dzbodyfit-green hover:bg-dzbodyfit-green/90"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </form>

                {/* Mobile Navigation */}
                <nav className="space-y-2">
                  {navigationItems.map((item) => (
                    <div key={item.label}>
                      <Button
                        variant="ghost"
                        className="w-full justify-between font-medium text-left"
                        onClick={() => handleDropdownToggle(item.label)}
                      >
                        <span className="flex items-center gap-2">
                          {item.icon}
                          {item.label}
                          {item.badge && (
                            <Badge className="bg-dzbodyfit-red text-white text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </span>
                        {item.megaMenu && (
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform duration-200 ${
                              activeDropdown === item.label ? 'rotate-180' : ''
                            }`} 
                          />
                        )}
                      </Button>

                      {/* Mobile Submenu */}
                      <AnimatePresence>
                        {item.megaMenu && activeDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-4 mt-2 space-y-2"
                          >
                            {item.megaMenu.categories.map((category, categoryIndex) => (
                              <div key={categoryIndex} className="space-y-1">
                                <h4 className="font-semibold text-sm text-dzbodyfit-gray uppercase tracking-wider">
                                  {category.title}
                                </h4>
                                {category.items.map((subItem, subIndex) => (
                                  <a
                                    key={subIndex}
                                    href={subItem.href}
                                    className="block py-2 px-3 text-sm text-dzbodyfit-black hover:bg-dzbodyfit-gray-light/30 rounded-md transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      {subItem.label}
                                      {subItem.isNew && (
                                        <Badge className="bg-dzbodyfit-blue text-white text-xs">New</Badge>
                                      )}
                                      {subItem.isPopular && (
                                        <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black text-xs">Popular</Badge>
                                      )}
                                    </div>
                                  </a>
                                ))}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </nav>

                {/* Mobile Actions */}
                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    Wishlist
                  </Button>
                  {!isLoggedIn && (
                    <Button onClick={onLoginClick} className="w-full bg-dzbodyfit-green hover:bg-dzbodyfit-green/90">
                      <User className="w-4 h-4 mr-2" />
                      Login / Register
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
