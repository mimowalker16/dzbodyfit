import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShoppingCart, 
  Search, 
  Menu, 
  X, 
  User, 
  Heart,
  ChevronDown,
  Dumbbell,
  Zap
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { DZBodyFitLogo } from "./DZBodyFitLogo"

interface HeaderProps {
  className?: string
}

const DZBodyFitHeader: React.FC<HeaderProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Handle scroll effect for glass morphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const categories = [
    {
      name: "Protéines",
      icon: Dumbbell,
      subcategories: ["Whey Protein", "Casein", "Isolate", "Vegan Protein"]
    },
    {
      name: "Pré-Workout", 
      icon: Zap,
      subcategories: ["Energie", "Focus", "Pompe", "Endurance"]
    },
    {
      name: "Suppléments",
      subcategories: ["Vitamines", "Minéraux", "Oméga-3", "Probiotiques"]
    },
    {
      name: "Marques",
      subcategories: ["Optimum", "Dymatize", "BSN", "MuscleTech"]
    }
  ]

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled 
            ? "bg-dzbodyfit-white/80 backdrop-blur-xl border-b border-dzbodyfit-gray-light/50 shadow-xl" 
            : "bg-transparent",
          className
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/" className="block">
                <DZBodyFitLogo 
                  size="lg" 
                  theme={isScrolled ? "dark" : "gradient"}
                  className="cursor-pointer"
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="relative group"
                  onMouseEnter={() => setActiveCategory(category.name)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <motion.button
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-dzbodyfit-black hover:bg-dzbodyfit-gray-light/50 transition-all duration-300 group-hover:text-dzbodyfit-green"
                    whileHover={{ y: -2 }}
                  >
                    {category.icon && <category.icon size={18} />}
                    <span>{category.name}</span>
                    <ChevronDown size={16} className="transition-transform duration-300 group-hover:rotate-180" />
                  </motion.button>

                  {/* Mega Menu */}
                  <AnimatePresence>
                    {activeCategory === category.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-dzbodyfit-white rounded-2xl shadow-2xl border border-dzbodyfit-gray-light p-6"
                      >
                        <div className="grid grid-cols-1 gap-3">
                          {category.subcategories.map((sub) => (
                            <Link
                              key={sub}
                              href={`/categories/${sub.toLowerCase().replace(/\s+/g, '-')}`}
                              className="block p-3 rounded-xl hover:bg-dzbodyfit-green/10 hover:text-dzbodyfit-green transition-all duration-200 font-medium"
                            >
                              {sub}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dzbodyfit-gray-medium" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher des suppléments..."
                  className="w-full pl-12 pr-4 py-3 bg-dzbodyfit-gray-light/50 border border-transparent rounded-2xl focus:outline-none focus:ring-3 focus:ring-dzbodyfit-green/30 focus:border-dzbodyfit-green transition-all duration-300"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              
              {/* Search Button (Mobile) */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search size={20} />
              </Button>

              {/* Wishlist */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" className="relative rounded-xl">
                  <Heart size={20} />
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-dzbodyfit-success text-dzbodyfit-white text-xs flex items-center justify-center p-0"
                  >
                    3
                  </Badge>
                </Button>
              </motion.div>

              {/* Cart */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" className="relative rounded-xl">
                  <ShoppingCart size={20} />
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-dzbodyfit-gold text-dzbodyfit-black text-xs flex items-center justify-center p-0"
                  >
                    2
                  </Badge>
                </Button>
              </motion.div>

              {/* User Menu */}
              <Button variant="ghost" size="icon" className="rounded-xl">
                <User size={20} />
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={20} />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-dzbodyfit-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute top-0 right-0 w-80 h-full bg-dzbodyfit-white shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-dzbodyfit-gray-light">
                <DZBodyFitLogo size="md" theme="dark" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl"
                >
                  <X size={20} />
                </Button>
              </div>
              
              <div className="p-6 space-y-6">
                {categories.map((category) => (
                  <div key={category.name} className="space-y-3">
                    <h3 className="font-semibold text-dzbodyfit-black text-lg">
                      {category.name}
                    </h3>
                    <div className="space-y-2 pl-4">
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub}
                          href={`/categories/${sub.toLowerCase().replace(/\s+/g, '-')}`}
                          className="block py-2 text-dzbodyfit-gray-medium hover:text-dzbodyfit-green transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden bg-dzbodyfit-white"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(false)}
                  className="rounded-xl"
                >
                  <X size={20} />
                </Button>
                <h2 className="text-xl font-semibold text-dzbodyfit-black">Rechercher</h2>
              </div>
              
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dzbodyfit-gray-medium" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher des suppléments..."
                  className="w-full pl-12 pr-4 py-4 bg-dzbodyfit-gray-light rounded-2xl focus:outline-none focus:ring-3 focus:ring-dzbodyfit-green/30 text-lg"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export { DZBodyFitHeader }
