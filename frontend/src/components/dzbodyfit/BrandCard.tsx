"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Star, 
  ArrowRight, 
  Users, 
  Award,
  ShoppingBag,
  MapPin,
  Calendar,
  TrendingUp,
  CheckCircle,
  Factory,
  Heart,
  Eye
} from 'lucide-react'

export interface Brand {
  id: string
  name: string
  logo: string
  coverImage?: string
  description: string
  shortDescription: string
  country: string
  founded: number
  specialties: string[]
  popularProducts: string[]
  rating: number
  reviewCount: number
  productCount: number
  followers: number
  isVerified: boolean
  isFeatured?: boolean
  isExclusive?: boolean
  certifications: string[]
  achievements: string[]
  socialMedia: {
    website?: string
    instagram?: string
    facebook?: string
  }
  stats: {
    customerSatisfaction: number
    qualityRating: number
    innovationScore: number
  }
}

interface BrandCardProps {
  brand: Brand
  variant?: 'default' | 'featured' | 'compact' | 'detailed'
  onViewBrand?: (brandId: string) => void
  onFollowBrand?: (brandId: string) => void
  className?: string
}

export default function BrandCard({
  brand,
  variant = 'default',
  onViewBrand,
  onFollowBrand,
  className = ''
}: BrandCardProps) {
  const [isFollowing, setIsFollowing] = useState(false)

  const handleViewBrand = () => {
    onViewBrand?.(brand.id)
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    onFollowBrand?.(brand.id)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const currentYear = new Date().getFullYear()
  const yearsActive = currentYear - brand.founded

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={`relative ${className}`}
      >
        <Card className="h-full bg-gradient-to-br from-dzbodyfit-white to-dzbodyfit-gray-light/20 border-dzbodyfit-green/20 hover:border-dzbodyfit-green/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-12 h-12 object-contain rounded-lg bg-white p-1 border"
                />
                {brand.isVerified && (
                  <CheckCircle className="w-4 h-4 text-dzbodyfit-green absolute -top-1 -right-1 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm line-clamp-1">{brand.name}</h3>
                <div className="flex items-center gap-2 text-xs text-dzbodyfit-gray">
                  <MapPin className="w-3 h-3" />
                  {brand.country}
                  <span>•</span>
                  <Calendar className="w-3 h-3" />
                  {yearsActive}y
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-2">
            <p className="text-xs text-dzbodyfit-gray line-clamp-2">
              {brand.shortDescription}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="flex text-dzbodyfit-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < Math.floor(brand.rating) ? 'fill-current' : ''}`} 
                    />
                  ))}
                </div>
                <span className="text-xs text-dzbodyfit-gray">({formatNumber(brand.reviewCount)})</span>
              </div>
              <div className="text-xs text-dzbodyfit-gray">
                {formatNumber(brand.productCount)} products
              </div>
            </div>

            <Button 
              onClick={handleViewBrand}
              size="sm" 
              className="w-full bg-dzbodyfit-green hover:bg-dzbodyfit-green/90"
            >
              <Eye className="w-3 h-3 mr-1" />
              View Brand
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        className={`relative ${className}`}
      >
        <Card className="h-full overflow-hidden bg-gradient-to-br from-dzbodyfit-white via-dzbodyfit-green/5 to-dzbodyfit-gold/10 border-2 border-dzbodyfit-gold/30 shadow-2xl">
          {/* Featured Badge */}
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black">
              <Award className="w-3 h-3 mr-1" />
              Featured Brand
            </Badge>
          </div>

          {/* Cover Image */}
          {brand.coverImage && (
            <div className="relative h-32 bg-gradient-to-r from-dzbodyfit-green to-dzbodyfit-blue">
              <img
                src={brand.coverImage}
                alt={`${brand.name} cover`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          )}

          <CardHeader className="relative">
            {/* Brand Logo */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white rounded-xl p-2 shadow-lg border-2 border-white">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                {brand.isVerified && (
                  <CheckCircle className="w-5 h-5 text-dzbodyfit-green absolute -top-1 -right-1 bg-white rounded-full" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-dzbodyfit-black">{brand.name}</h3>
                  {brand.isExclusive && (
                    <Badge variant="outline" className="text-xs border-dzbodyfit-gold text-dzbodyfit-gold">
                      Exclusive
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-sm text-dzbodyfit-gray mb-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {brand.country}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Est. {brand.founded}
                  </div>
                  <div className="flex items-center gap-1">
                    <Factory className="w-4 h-4" />
                    {yearsActive} years
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="flex text-dzbodyfit-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(brand.rating) ? 'fill-current' : ''}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">{brand.rating}</span>
                    <span className="text-sm text-dzbodyfit-gray">({formatNumber(brand.reviewCount)})</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Description */}
            <p className="text-dzbodyfit-gray leading-relaxed">
              {brand.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-dzbodyfit-gray-light/20 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-dzbodyfit-green">{brand.stats.customerSatisfaction}%</div>
                <div className="text-xs text-dzbodyfit-gray">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-dzbodyfit-green">{brand.stats.qualityRating}/10</div>
                <div className="text-xs text-dzbodyfit-gray">Quality</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-dzbodyfit-green">{brand.stats.innovationScore}/10</div>
                <div className="text-xs text-dzbodyfit-gray">Innovation</div>
              </div>
            </div>

            {/* Specialties */}
            <div>
              <h4 className="font-semibold mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {brand.specialties.slice(0, 4).map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {brand.specialties.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{brand.specialties.length - 4} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Popular Products */}
            <div>
              <h4 className="font-semibold mb-2">Popular Products</h4>
              <div className="space-y-1">
                {brand.popularProducts.slice(0, 3).map((product, index) => (
                  <div key={index} className="text-sm text-dzbodyfit-gray flex items-center">
                    <TrendingUp className="w-3 h-3 mr-2 text-dzbodyfit-green" />
                    {product}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {brand.certifications.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {brand.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-dzbodyfit-green text-dzbodyfit-green">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Community Stats */}
            <div className="flex items-center justify-between p-3 bg-dzbodyfit-green/5 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-dzbodyfit-gray" />
                  <span className="text-sm font-semibold">{formatNumber(brand.followers)}</span>
                  <span className="text-xs text-dzbodyfit-gray">followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4 text-dzbodyfit-gray" />
                  <span className="text-sm font-semibold">{formatNumber(brand.productCount)}</span>
                  <span className="text-xs text-dzbodyfit-gray">products</span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button 
              onClick={handleViewBrand}
              className="flex-1 bg-dzbodyfit-green hover:bg-dzbodyfit-green/90"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Products
            </Button>
            <Button 
              variant="outline"
              onClick={handleFollow}
              className={isFollowing ? 'border-dzbodyfit-green text-dzbodyfit-green' : ''}
            >
              <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
            </Button>
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
      <Card className="h-full bg-gradient-to-br from-dzbodyfit-white to-dzbodyfit-gray-light/20 border-dzbodyfit-green/20 hover:border-dzbodyfit-green/40 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 bg-white rounded-lg p-2 shadow-md border">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-contain"
                />
              </div>
              {brand.isVerified && (
                <CheckCircle className="w-4 h-4 text-dzbodyfit-green absolute -top-1 -right-1 bg-white rounded-full" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-dzbodyfit-black">{brand.name}</h3>
                {brand.isFeatured && (
                  <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black text-xs">
                    Featured
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-sm text-dzbodyfit-gray">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {brand.country}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {yearsActive}y
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="flex text-dzbodyfit-gold">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(brand.rating) ? 'fill-current' : ''}`} 
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{brand.rating}</span>
              <span className="text-sm text-dzbodyfit-gray">({formatNumber(brand.reviewCount)})</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Description */}
          <p className="text-sm text-dzbodyfit-gray line-clamp-3">
            {brand.shortDescription}
          </p>

          {/* Specialties */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Specialties</h4>
            <div className="flex flex-wrap gap-1">
              {brand.specialties.slice(0, 3).map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {brand.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{brand.specialties.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-dzbodyfit-gray">
              <Users className="w-4 h-4" />
              {formatNumber(brand.followers)} followers
            </div>
            <div className="flex items-center gap-1 text-dzbodyfit-gray">
              <ShoppingBag className="w-4 h-4" />
              {formatNumber(brand.productCount)} products
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button 
            onClick={handleViewBrand}
            className="flex-1 bg-dzbodyfit-green hover:bg-dzbodyfit-green/90"
            size="sm"
          >
            <ArrowRight className="w-4 h-4 mr-1" />
            View Brand
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleFollow}
            className={isFollowing ? 'border-dzbodyfit-green text-dzbodyfit-green' : ''}
          >
            <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
