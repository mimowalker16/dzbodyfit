"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Separator } from '../ui/separator'
import { 
  ShoppingCart, 
  Heart, 
  Award,
  Star,
  Plus,
  Minus,
  FlaskConical,
  Zap,
  Target,
  CheckCircle
} from 'lucide-react'

export interface SupplementProduct {
  id: string
  name: string
  brand: string
  image: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  category: string
  servings: number
  servingSize: string
  flavors: string[]
  mainBenefits: string[]
  keyIngredients: string[]
  nutritionFacts: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    sugar?: number
    sodium?: number
    [key: string]: number | undefined
  }
  certifications: string[]
  inStock: boolean
  stockLevel: number
  isNew?: boolean
  isBestSeller?: boolean
  isOnSale?: boolean
}

interface SupplementCardProps {
  product: SupplementProduct
  variant?: 'default' | 'detailed' | 'compact' | 'comparison'
  onAddToCart?: (productId: string, quantity: number, flavor: string) => void
  onAddToWishlist?: (productId: string) => void
  className?: string
}

export default function SupplementCard({
  product,
  variant = 'default',
  onAddToCart,
  onAddToWishlist,
  className = ''
}: SupplementCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedFlavor, setSelectedFlavor] = useState(product.flavors[0] || '')
  const [showNutrition, setShowNutrition] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleAddToCart = () => {
    onAddToCart?.(product.id, quantity, selectedFlavor)
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    onAddToWishlist?.(product.id)
  }

  const discountPercentage = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const stockPercentage = (product.stockLevel / 100) * 100

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className={`relative ${className}`}
      >
        <Card className="h-full overflow-hidden bg-gradient-to-br from-dzbodyfit-white to-dzbodyfit-gray-light/30 border-dzbodyfit-green/20 hover:border-dzbodyfit-green/40 transition-all duration-300">
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover"
            />
            {product.isOnSale && (
              <Badge className="absolute top-2 left-2 bg-dzbodyfit-red text-white">
                -{discountPercentage}%
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge className="absolute top-2 right-2 bg-dzbodyfit-gold text-dzbodyfit-black">
                <Award className="w-3 h-3 mr-1" />
                Best Seller
              </Badge>
            )}
          </div>
          
          <CardContent className="p-3">
            <div className="text-xs text-dzbodyfit-gray mb-1">{product.brand}</div>
            <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</h3>
            
            <div className="flex items-center gap-1 mb-2">
              <div className="flex text-dzbodyfit-gold">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-dzbodyfit-gray">({product.reviewCount})</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-dzbodyfit-green">{product.price} DZD</span>
                {product.originalPrice && (
                  <span className="text-xs text-dzbodyfit-gray line-through ml-1">
                    {product.originalPrice} DZD
                  </span>
                )}
              </div>
              <Button 
                size="sm" 
                onClick={handleAddToCart}
                className="h-7 px-2"
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={`relative ${className}`}
      >
        <Card className="h-full overflow-hidden bg-gradient-to-br from-dzbodyfit-white via-dzbodyfit-gray-light/20 to-dzbodyfit-green/5 border-2 border-dzbodyfit-green/20 hover:border-dzbodyfit-green/40 transition-all duration-500 shadow-xl">
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover"
            />
            
            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <Badge className="bg-dzbodyfit-blue text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  New
                </Badge>
              )}
              {product.isOnSale && (
                <Badge className="bg-dzbodyfit-red text-white">
                  -{discountPercentage}% OFF
                </Badge>
              )}
              {product.isBestSeller && (
                <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black">
                  <Award className="w-3 h-3 mr-1" />
                  Best Seller
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWishlist}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-dzbodyfit-red text-dzbodyfit-red' : ''}`} />
            </Button>

            {/* Stock Level Indicator */}
            {product.stockLevel < 50 && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-dzbodyfit-gray">Stock Level</span>
                    <span className="font-semibold">{product.stockLevel}% left</span>
                  </div>
                  <Progress value={stockPercentage} className="h-1" />
                </div>
              </div>
            )}
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
              <div className="flex items-center gap-1">
                <div className="flex text-dzbodyfit-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-dzbodyfit-gray">({product.reviewCount})</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-dzbodyfit-gray mb-1">{product.brand}</div>
              <h3 className="text-xl font-bold text-dzbodyfit-black leading-tight">{product.name}</h3>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Key Benefits */}
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2 text-dzbodyfit-green" />
                Key Benefits
              </h4>
              <div className="flex flex-wrap gap-1">
                {product.mainBenefits.slice(0, 3).map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Serving Info */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-dzbodyfit-gray-light/30 rounded-lg">
              <div>
                <div className="text-xs text-dzbodyfit-gray">Servings</div>
                <div className="font-semibold">{product.servings}</div>
              </div>
              <div>
                <div className="text-xs text-dzbodyfit-gray">Serving Size</div>
                <div className="font-semibold">{product.servingSize}</div>
              </div>
            </div>

            {/* Flavor Selection */}
            {product.flavors.length > 1 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Flavor</h4>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map((flavor) => (
                    <Button
                      key={flavor}
                      variant={selectedFlavor === flavor ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFlavor(flavor)}
                      className="text-xs"
                    >
                      {flavor}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition Facts Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNutrition(!showNutrition)}
              className="w-full justify-center"
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              {showNutrition ? 'Hide' : 'Show'} Nutrition Facts
            </Button>

            <AnimatePresence>
              {showNutrition && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white border rounded-lg p-3 space-y-2">
                    <h5 className="font-semibold text-sm">Nutrition Facts (per serving)</h5>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(product.nutritionFacts).map(([key, value]) => (
                        value !== undefined && (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key}:</span>
                            <span className="font-semibold">{value}{key === 'calories' ? '' : 'g'}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Certifications */}
            {product.certifications.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-dzbodyfit-green" />
                  Certifications
                </h4>
                <div className="flex flex-wrap gap-1">
                  {product.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-dzbodyfit-green text-dzbodyfit-green">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            {/* Price */}
            <div className="w-full text-center">
              <div className="text-2xl font-bold text-dzbodyfit-green">
                {product.price} DZD
              </div>
              {product.originalPrice && (
                <div className="text-sm text-dzbodyfit-gray line-through">
                  {product.originalPrice} DZD
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-dzbodyfit-green hover:bg-dzbodyfit-green/90"
                size="lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative ${className}`}
    >
      <Card className="h-full overflow-hidden bg-gradient-to-br from-dzbodyfit-white to-dzbodyfit-gray-light/20 border-dzbodyfit-green/20 hover:border-dzbodyfit-green/40 transition-all duration-300 shadow-lg hover:shadow-xl">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          
          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isOnSale && (
              <Badge className="bg-dzbodyfit-red text-white text-xs">
                -{discountPercentage}%
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black text-xs">
                <Award className="w-3 h-3 mr-1" />
                Best Seller
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWishlist}
            className="absolute top-3 right-3 bg-white/80 hover:bg-white"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-dzbodyfit-red text-dzbodyfit-red' : ''}`} />
          </Button>
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
            <div className="flex items-center gap-1">
              <div className="flex text-dzbodyfit-gold">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-dzbodyfit-gray">({product.reviewCount})</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-dzbodyfit-gray mb-1">{product.brand}</div>
            <h3 className="font-bold text-dzbodyfit-black leading-tight line-clamp-2">{product.name}</h3>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Key Benefits */}
          <div className="flex flex-wrap gap-1">
            {product.mainBenefits.slice(0, 2).map((benefit, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>

          {/* Serving Info */}
          <div className="flex justify-between text-sm bg-dzbodyfit-gray-light/30 rounded p-2">
            <div>
              <span className="text-dzbodyfit-gray">Servings: </span>
              <span className="font-semibold">{product.servings}</span>
            </div>
            <div>
              <span className="text-dzbodyfit-gray">Size: </span>
              <span className="font-semibold">{product.servingSize}</span>
            </div>
          </div>

          {/* Price */}
          <div className="text-center">
            <div className="text-xl font-bold text-dzbodyfit-green">
              {product.price} DZD
            </div>
            {product.originalPrice && (
              <div className="text-sm text-dzbodyfit-gray line-through">
                {product.originalPrice} DZD
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button 
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full bg-dzbodyfit-green hover:bg-dzbodyfit-green/90"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
