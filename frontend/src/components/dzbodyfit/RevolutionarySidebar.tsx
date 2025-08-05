"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import { Slider } from '../ui/slider'
import { Separator } from '../ui/separator'
import { Input } from '../ui/input'
import { 
  Filter, 
  X, 
  Star, 
  ChevronDown, 
  ChevronRight,
  Search,
  RefreshCw,
  Award,
  Heart,
  Eye,
  ShoppingBag,
  Tag,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react'

interface FilterOption {
  id: string
  label: string
  count?: number
  isNew?: boolean
  isPopular?: boolean
}

interface FilterGroup {
  id: string
  title: string
  icon: React.ReactNode
  type: 'checkbox' | 'radio' | 'range' | 'search'
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
  defaultValue?: number[]
  isCollapsible?: boolean
  isExpanded?: boolean
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  variant?: 'filter' | 'navigation' | 'recent'
  title?: string
  className?: string
  onFilterChange?: (filters: Record<string, string[] | number[]>) => void
}

const filterGroups: FilterGroup[] = [
  {
    id: 'category',
    title: 'Categories',
    icon: <ShoppingBag className="w-4 h-4" />,
    type: 'checkbox',
    isCollapsible: true,
    isExpanded: true,
    options: [
      { id: 'protein', label: 'Protein', count: 156, isPopular: true },
      { id: 'pre-workout', label: 'Pre-Workout', count: 89, isPopular: true },
      { id: 'mass-gainer', label: 'Mass Gainers', count: 45 },
      { id: 'creatine', label: 'Creatine', count: 67 },
      { id: 'bcaa', label: 'BCAAs', count: 34 },
      { id: 'fat-burner', label: 'Fat Burners', count: 78, isNew: true },
      { id: 'vitamins', label: 'Vitamins', count: 123 },
      { id: 'accessories', label: 'Accessories', count: 56 }
    ]
  },
  {
    id: 'price',
    title: 'Price Range (DZD)',
    icon: <Tag className="w-4 h-4" />,
    type: 'range',
    min: 0,
    max: 50000,
    step: 1000,
    defaultValue: [0, 50000],
    isCollapsible: true,
    isExpanded: true
  },
  {
    id: 'brand',
    title: 'Brands',
    icon: <Award className="w-4 h-4" />,
    type: 'search',
    isCollapsible: true,
    isExpanded: true,
    options: [
      { id: 'optimum-nutrition', label: 'Optimum Nutrition', count: 45, isPopular: true },
      { id: 'muscletech', label: 'MuscleTech', count: 34 },
      { id: 'bsn', label: 'BSN', count: 28 },
      { id: 'dymatize', label: 'Dymatize', count: 23 },
      { id: 'gaspari', label: 'Gaspari Nutrition', count: 19 },
      { id: 'dzbodyfit', label: 'DZBodyFit Pro', count: 15, isNew: true }
    ]
  },
  {
    id: 'rating',
    title: 'Customer Rating',
    icon: <Star className="w-4 h-4" />,
    type: 'checkbox',
    isCollapsible: true,
    isExpanded: true,
    options: [
      { id: '5-star', label: '5 Stars', count: 89 },
      { id: '4-star', label: '4+ Stars', count: 156 },
      { id: '3-star', label: '3+ Stars', count: 234 },
      { id: '2-star', label: '2+ Stars', count: 267 }
    ]
  },
  {
    id: 'features',
    title: 'Special Features',
    icon: <Zap className="w-4 h-4" />,
    type: 'checkbox',
    isCollapsible: true,
    isExpanded: false,
    options: [
      { id: 'new-arrival', label: 'New Arrivals', count: 23, isNew: true },
      { id: 'best-seller', label: 'Best Sellers', count: 45, isPopular: true },
      { id: 'on-sale', label: 'On Sale', count: 67 },
      { id: 'lab-tested', label: 'Lab Tested', count: 134 },
      { id: 'halal', label: 'Halal Certified', count: 156 },
      { id: 'locally-made', label: 'Made in Algeria', count: 12, isNew: true }
    ]
  },
  {
    id: 'availability',
    title: 'Availability',
    icon: <Clock className="w-4 h-4" />,
    type: 'checkbox',
    isCollapsible: true,
    isExpanded: false,
    options: [
      { id: 'in-stock', label: 'In Stock', count: 234 },
      { id: 'low-stock', label: 'Low Stock', count: 23 },
      { id: 'pre-order', label: 'Pre-Order', count: 12 }
    ]
  }
]

const recentlyViewed = [
  {
    id: '1',
    name: 'Premium Whey Protein',
    brand: 'DZBodyFit Pro',
    price: 8500,
    image: '/api/placeholder/60/60',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Creatine Monohydrate',
    brand: 'Optimum Nutrition',
    price: 4500,
    image: '/api/placeholder/60/60',
    rating: 4.9
  },
  {
    id: '3',
    name: 'Pre-Workout Extreme',
    brand: 'MuscleTech',
    price: 6500,
    image: '/api/placeholder/60/60',
    rating: 4.7
  }
]

export function RevolutionarySidebar({
  onClose,
  variant = 'filter',
  title = 'Filters',
  className = '',
  onFilterChange
}: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(filterGroups.filter(g => g.isExpanded).map(g => g.id))
  )
  const [filters, setFilters] = useState<Record<string, string[] | number[]>>({})
  const [brandSearch, setBrandSearch] = useState('')
  const [priceRange, setPriceRange] = useState([0, 50000])

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const handleFilterChange = (groupId: string, optionId: string, checked: boolean) => {
    const newFilters = { ...filters }
    if (!newFilters[groupId]) {
      newFilters[groupId] = []
    }
    
    const groupFilters = newFilters[groupId] as string[]
    
    if (checked) {
      groupFilters.push(optionId)
    } else {
      newFilters[groupId] = groupFilters.filter((id: string) => id !== optionId)
    }
    
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value)
    const newFilters = { ...filters, price: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const clearAllFilters = () => {
    setFilters({})
    setPriceRange([0, 50000])
    setBrandSearch('')
    onFilterChange?.({})
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).flat().length
  }

  const filteredBrandOptions = filterGroups
    .find(g => g.id === 'brand')?.options
    ?.filter(option => 
      option.label.toLowerCase().includes(brandSearch.toLowerCase())
    ) || []

  if (variant === 'recent') {
    return (
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        className={`bg-white border-r border-dzbodyfit-gray-light/20 ${className}`}
      >
        <div className="p-4 border-b border-dzbodyfit-gray-light/20">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-dzbodyfit-green" />
              Recently Viewed
            </h3>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {recentlyViewed.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-dzbodyfit-gray-light/20 transition-colors cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                <p className="text-xs text-dzbodyfit-gray">{item.brand}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-dzbodyfit-green text-sm">
                    {item.price} DZD
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current text-dzbodyfit-gold" />
                    <span className="text-xs">{item.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          <Button variant="outline" className="w-full mt-4">
            <Eye className="w-4 h-4 mr-2" />
            View All History
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className={`bg-white border-r border-dzbodyfit-gray-light/20 ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-dzbodyfit-gray-light/20">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-dzbodyfit-green" />
            {title}
            {getActiveFilterCount() > 0 && (
              <Badge className="bg-dzbodyfit-green text-white">
                {getActiveFilterCount()}
              </Badge>
            )}
          </h3>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {getActiveFilterCount() > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full mt-3"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Filter Groups */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {filterGroups.map((group) => (
          <div key={group.id} className="border border-dzbodyfit-gray-light/20 rounded-lg">
            {/* Group Header */}
            <Button
              variant="ghost"
              onClick={() => group.isCollapsible && toggleGroup(group.id)}
              className="w-full justify-between p-3 h-auto font-semibold"
            >
              <div className="flex items-center gap-2">
                {group.icon}
                {group.title}
              </div>
              {group.isCollapsible && (
                expandedGroups.has(group.id) ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
              )}
            </Button>

            {/* Group Content */}
            <AnimatePresence>
              {(!group.isCollapsible || expandedGroups.has(group.id)) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 pt-0">
                    {/* Price Range */}
                    {group.type === 'range' && (
                      <div className="space-y-4">
                        <Slider
                          value={priceRange}
                          onValueChange={handlePriceRangeChange}
                          min={group.min}
                          max={group.max}
                          step={group.step}
                          className="w-full"
                        />
                        <div className="flex items-center justify-between text-sm">
                          <span>{priceRange[0]} DZD</span>
                          <span>{priceRange[1]} DZD</span>
                        </div>
                      </div>
                    )}

                    {/* Search Input for Brands */}
                    {group.type === 'search' && (
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-dzbodyfit-gray" />
                          <Input
                            placeholder="Search brands..."
                            value={brandSearch}
                            onChange={(e) => setBrandSearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {filteredBrandOptions.map((option) => (
                            <label
                              key={option.id}
                              className="flex items-center justify-between p-2 rounded hover:bg-dzbodyfit-gray-light/20 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={(filters[group.id] as string[])?.includes(option.id) || false}
                                  onCheckedChange={(checked: boolean) => 
                                    handleFilterChange(group.id, option.id, checked)
                                  }
                                />
                                <span className="text-sm">{option.label}</span>
                                {option.isNew && (
                                  <Badge className="bg-dzbodyfit-blue text-white text-xs">New</Badge>
                                )}
                                {option.isPopular && (
                                  <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black text-xs">Popular</Badge>
                                )}
                              </div>
                              {option.count && (
                                <span className="text-xs text-dzbodyfit-gray">({option.count})</span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Checkbox Options */}
                    {group.type === 'checkbox' && group.options && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {group.options.map((option) => (
                          <label
                            key={option.id}
                            className="flex items-center justify-between p-2 rounded hover:bg-dzbodyfit-gray-light/20 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={(filters[group.id] as string[])?.includes(option.id) || false}
                                onCheckedChange={(checked: boolean) => 
                                  handleFilterChange(group.id, option.id, checked)
                                }
                              />
                              <span className="text-sm">{option.label}</span>
                              {option.isNew && (
                                <Badge className="bg-dzbodyfit-blue text-white text-xs">New</Badge>
                              )}
                              {option.isPopular && (
                                <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black text-xs">Popular</Badge>
                              )}
                            </div>
                            {option.count && (
                              <span className="text-xs text-dzbodyfit-gray">({option.count})</span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Popular Filters */}
        <div className="border border-dzbodyfit-green/20 bg-dzbodyfit-green/5 rounded-lg p-3">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-dzbodyfit-green" />
            Popular Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Best Rated
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              New Arrivals
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Heart className="w-3 h-3 mr-1" />
              Most Loved
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
