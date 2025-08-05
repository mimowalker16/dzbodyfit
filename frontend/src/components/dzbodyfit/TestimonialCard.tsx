"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Avatar } from '../ui/avatar'
import { 
  Star, 
  Quote, 
  ThumbsUp, 
  MessageCircle, 
  Share2,
  MapPin,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Heart,
  CheckCircle
} from 'lucide-react'

export interface Testimonial {
  id: string
  customerName: string
  customerAvatar?: string
  customerLocation: string
  rating: number
  title: string
  review: string
  productUsed: string
  category: 'protein' | 'pre-workout' | 'weight-loss' | 'mass-gainer' | 'general'
  date: string
  verified: boolean
  helpful: number
  beforeAfterImages?: {
    before: string
    after: string
  }
  results?: {
    weightChange?: string
    muscleGain?: string
    strengthGain?: string
    enduranceImprovement?: string
    duration?: string
  }
  tags: string[]
  isHighlighted?: boolean
  isFeatured?: boolean
}

interface TestimonialCardProps {
  testimonial: Testimonial
  variant?: 'default' | 'featured' | 'compact' | 'detailed'
  onLike?: (testimonialId: string) => void
  onShare?: (testimonialId: string) => void
  className?: string
}

export default function TestimonialCard({
  testimonial,
  variant = 'default',
  onLike,
  onShare,
  className = ''
}: TestimonialCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [showFullReview, setShowFullReview] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(testimonial.id)
  }

  const handleShare = () => {
    onShare?.(testimonial.id)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      protein: 'bg-blue-100 text-blue-800 border-blue-200',
      'pre-workout': 'bg-red-100 text-red-800 border-red-200',
      'weight-loss': 'bg-green-100 text-green-800 border-green-200',
      'mass-gainer': 'bg-purple-100 text-purple-800 border-purple-200',
      general: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[category as keyof typeof colors] || colors.general
  }

  const truncatedReview = testimonial.review.length > 150 
    ? testimonial.review.substring(0, 150) + '...' 
    : testimonial.review

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`relative ${className}`}
      >
        <Card className="h-full bg-gradient-to-br from-dzbodyfit-white to-dzbodyfit-gray-light/20 border-dzbodyfit-green/20 hover:border-dzbodyfit-green/40 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                {testimonial.customerAvatar ? (
                  <img src={testimonial.customerAvatar} alt={testimonial.customerName} />
                ) : (
                  <div className="bg-dzbodyfit-green text-white flex items-center justify-center text-sm font-semibold">
                    {testimonial.customerName.charAt(0)}
                  </div>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-sm">{testimonial.customerName}</div>
                <div className="flex items-center gap-2">
                  <div className="flex text-dzbodyfit-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < testimonial.rating ? 'fill-current' : ''}`} 
                      />
                    ))}
                  </div>
                  {testimonial.verified && (
                    <CheckCircle className="w-3 h-3 text-dzbodyfit-green" />
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-sm text-dzbodyfit-gray line-clamp-3 italic">
              &ldquo;{truncatedReview}&rdquo;
            </p>
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="outline" className={`text-xs ${getCategoryColor(testimonial.category)}`}>
                {testimonial.productUsed}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleLike}>
                <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-current text-dzbodyfit-green' : ''}`} />
                <span className="ml-1 text-xs">{testimonial.helpful}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={`relative ${className}`}
      >
        <Card className="h-full overflow-hidden bg-gradient-to-br from-dzbodyfit-white via-dzbodyfit-green/5 to-dzbodyfit-gold/10 border-2 border-dzbodyfit-gold/30 shadow-xl">
          {/* Featured Badge */}
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black">
              <Trophy className="w-3 h-3 mr-1" />
              Featured Success
            </Badge>
          </div>

          {/* Before/After Images */}
          {testimonial.beforeAfterImages && (
            <div className="relative h-48 bg-gradient-to-r from-dzbodyfit-gray-light to-dzbodyfit-gray">
              <div className="absolute inset-0 flex">
                <div className="w-1/2 relative">
                  <img
                    src={testimonial.beforeAfterImages.before}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary">Before</Badge>
                  </div>
                </div>
                <div className="w-1/2 relative">
                  <img
                    src={testimonial.beforeAfterImages.after}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2">
                    <Badge className="bg-dzbodyfit-green text-white">After</Badge>
                  </div>
                </div>
              </div>
              
              {/* Transformation Arrow */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-white rounded-full p-2 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-dzbodyfit-green" />
                </div>
              </div>
            </div>
          )}

          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 ring-2 ring-dzbodyfit-gold/30">
                {testimonial.customerAvatar ? (
                  <img src={testimonial.customerAvatar} alt={testimonial.customerName} />
                ) : (
                  <div className="bg-dzbodyfit-green text-white flex items-center justify-center text-lg font-bold">
                    {testimonial.customerName.charAt(0)}
                  </div>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="font-bold text-lg">{testimonial.customerName}</div>
                <div className="flex items-center gap-2 text-sm text-dzbodyfit-gray">
                  <MapPin className="w-4 h-4" />
                  {testimonial.customerLocation}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-dzbodyfit-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < testimonial.rating ? 'fill-current' : ''}`} 
                      />
                    ))}
                  </div>
                  {testimonial.verified && (
                    <div className="flex items-center gap-1 text-dzbodyfit-green">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Verified Purchase</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Quote */}
            <div className="relative">
              <Quote className="w-8 h-8 text-dzbodyfit-green/30 absolute -top-2 -left-1" />
              <h3 className="font-bold text-lg mb-2 pl-6">{testimonial.title}</h3>
              <p className="text-dzbodyfit-gray leading-relaxed italic pl-6">
                &ldquo;{testimonial.review}&rdquo;
              </p>
            </div>

            {/* Results Section */}
            {testimonial.results && (
              <div className="bg-dzbodyfit-green/5 rounded-lg p-4 border border-dzbodyfit-green/20">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-dzbodyfit-green" />
                  Amazing Results
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {testimonial.results.weightChange && (
                    <div>
                      <span className="text-dzbodyfit-gray">Weight Change:</span>
                      <div className="font-bold text-dzbodyfit-green">{testimonial.results.weightChange}</div>
                    </div>
                  )}
                  {testimonial.results.muscleGain && (
                    <div>
                      <span className="text-dzbodyfit-gray">Muscle Gain:</span>
                      <div className="font-bold text-dzbodyfit-green">{testimonial.results.muscleGain}</div>
                    </div>
                  )}
                  {testimonial.results.strengthGain && (
                    <div>
                      <span className="text-dzbodyfit-gray">Strength:</span>
                      <div className="font-bold text-dzbodyfit-green">{testimonial.results.strengthGain}</div>
                    </div>
                  )}
                  {testimonial.results.duration && (
                    <div>
                      <span className="text-dzbodyfit-gray">Timeline:</span>
                      <div className="font-bold text-dzbodyfit-green">{testimonial.results.duration}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product Used */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-dzbodyfit-gray">Product Used:</span>
                <Badge className={`ml-2 ${getCategoryColor(testimonial.category)}`}>
                  {testimonial.productUsed}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-dzbodyfit-gray">
                <Calendar className="w-3 h-3" />
                {new Date(testimonial.date).toLocaleDateString()}
              </div>
            </div>

            {/* Tags */}
            {testimonial.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {testimonial.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleLike}>
                  <ThumbsUp className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current text-dzbodyfit-green' : ''}`} />
                  {testimonial.helpful}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Reply
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`relative ${className}`}
    >
      <Card className="h-full bg-gradient-to-br from-dzbodyfit-white to-dzbodyfit-gray-light/20 border-dzbodyfit-green/20 hover:border-dzbodyfit-green/40 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                {testimonial.customerAvatar ? (
                  <img src={testimonial.customerAvatar} alt={testimonial.customerName} />
                ) : (
                  <div className="bg-dzbodyfit-green text-white flex items-center justify-center font-semibold">
                    {testimonial.customerName.charAt(0)}
                  </div>
                )}
              </Avatar>
              <div>
                <div className="font-semibold">{testimonial.customerName}</div>
                <div className="flex items-center gap-2 text-sm text-dzbodyfit-gray">
                  <MapPin className="w-3 h-3" />
                  {testimonial.customerLocation}
                </div>
              </div>
            </div>
            
            {testimonial.isHighlighted && (
              <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black">
                <Heart className="w-3 h-3 mr-1" />
                Top Review
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="flex text-dzbodyfit-gold">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < testimonial.rating ? 'fill-current' : ''}`} 
                  />
                ))}
              </div>
              {testimonial.verified && (
                <div className="flex items-center gap-1 text-dzbodyfit-green">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Verified</span>
                </div>
              )}
            </div>
            <div className="text-xs text-dzbodyfit-gray">
              {new Date(testimonial.date).toLocaleDateString()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Title */}
          {testimonial.title && (
            <h3 className="font-semibold text-dzbodyfit-black">{testimonial.title}</h3>
          )}

          {/* Review */}
          <div className="relative">
            <Quote className="w-6 h-6 text-dzbodyfit-green/20 absolute -top-1 -left-1" />
            <p className="text-dzbodyfit-gray italic pl-4">
              &ldquo;{showFullReview ? testimonial.review : truncatedReview}&rdquo;
            </p>
            {testimonial.review.length > 150 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullReview(!showFullReview)}
                className="mt-1 p-0 h-auto text-dzbodyfit-green text-xs"
              >
                {showFullReview ? 'Show less' : 'Read more'}
              </Button>
            )}
          </div>

          {/* Product */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-dzbodyfit-gray">Used:</span>
              <Badge className={`ml-2 text-xs ${getCategoryColor(testimonial.category)}`}>
                {testimonial.productUsed}
              </Badge>
            </div>
          </div>

          {/* Results (if available) */}
          {testimonial.results && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResults(!showResults)}
              className="w-full justify-center"
            >
              <Target className="w-4 h-4 mr-2" />
              {showResults ? 'Hide Results' : 'View Results'}
            </Button>
          )}

          {showResults && testimonial.results && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-dzbodyfit-green/5 rounded-lg p-3 space-y-2 text-sm"
            >
              {Object.entries(testimonial.results).map(([key, value]) => (
                value && (
                  <div key={key} className="flex justify-between">
                    <span className="text-dzbodyfit-gray capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="font-semibold text-dzbodyfit-green">{value}</span>
                  </div>
                )
              ))}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={handleLike}>
              <ThumbsUp className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current text-dzbodyfit-green' : ''}`} />
              <span className="text-sm">{testimonial.helpful}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
