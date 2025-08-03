'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Zap, 
  Eye, 
  Share2,
  Package,
  Truck,
  Shield,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  inStock: boolean;
  stockCount?: number;
  features?: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  shippingTime?: string;
  currency?: string;
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'featured' | 'compact' | 'detailed';
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  isInWishlist?: boolean;
  className?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, delay: 0.1 }
  }
};

export function ProductCard({
  product,
  variant = 'default',
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  isInWishlist = false,
  className = ''
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist?.(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ${product.currency || 'DZD'}`;
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';
  const isDetailed = variant === 'detailed';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group ${className}`}
    >
      <Card className={`
        overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300
        bg-dzbodyfit-white relative
        ${isFeatured ? 'ring-2 ring-dzbodyfit-gold' : ''}
        ${isCompact ? 'h-80' : 'h-auto'}
      `}>
        {/* Image Section */}
        <div className={`relative overflow-hidden ${isCompact ? 'h-48' : 'h-64'}`}>
          <Link href={`/products/${product.id}`}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="relative w-full h-full"
            >
              <Image
                src={product.images[currentImageIndex] || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>
          </Link>

          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-dzbodyfit-green text-dzbodyfit-white border-0">
                <Zap className="w-3 h-3 mr-1" />
                New
              </Badge>
            )}
            {product.isBestseller && (
              <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black border-0">
                <Star className="w-3 h-3 mr-1" />
                Bestseller
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge variant="destructive" className="bg-red-500 text-white border-0">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute top-3 right-3 flex flex-col gap-2"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="w-10 h-10 p-0 bg-dzbodyfit-white/90 hover:bg-dzbodyfit-white border-dzbodyfit-gray-light rounded-full"
                  onClick={handleWishlist}
                >
                  <Heart 
                    className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-dzbodyfit-black'}`} 
                  />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="w-10 h-10 p-0 bg-dzbodyfit-white/90 hover:bg-dzbodyfit-white border-dzbodyfit-gray-light rounded-full"
                  onClick={handleQuickView}
                >
                  <Eye className="w-4 h-4 text-dzbodyfit-black" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-10 h-10 p-0 bg-dzbodyfit-white/90 hover:bg-dzbodyfit-white border-dzbodyfit-gray-light rounded-full"
                >
                  <Share2 className="w-4 h-4 text-dzbodyfit-black" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-dzbodyfit-black/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Out of Stock
              </Badge>
            </div>
          )}

          {/* Image Navigation for Multiple Images */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-dzbodyfit-gold' 
                      : 'bg-dzbodyfit-white/50 hover:bg-dzbodyfit-white/80'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <CardContent className={`p-4 ${isCompact ? 'space-y-2' : 'space-y-3'}`}>
          {/* Brand & Category */}
          <div className="flex items-center justify-between">
            <Link 
              href={`/brands/${product.brand.toLowerCase()}`}
              className="text-sm font-medium text-dzbodyfit-green hover:text-dzbodyfit-green/80 transition-colors"
            >
              {product.brand}
            </Link>
            <span className="text-xs text-dzbodyfit-gray-dark bg-dzbodyfit-gray-light px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.id}`}>
            <h3 className={`font-bold text-dzbodyfit-black hover:text-dzbodyfit-green transition-colors line-clamp-2 ${
              isCompact ? 'text-sm' : 'text-base'
            }`}>
              {product.name}
            </h3>
          </Link>

          {/* Description (only for detailed variant) */}
          {isDetailed && (
            <p className="text-sm text-dzbodyfit-gray-dark line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-dzbodyfit-gold text-dzbodyfit-gold'
                      : 'text-dzbodyfit-gray-light'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-dzbodyfit-gray-dark">
              ({product.reviewCount})
            </span>
          </div>

          {/* Features (only for detailed variant) */}
          {isDetailed && product.features && (
            <div className="space-y-1">
              {product.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center text-xs text-dzbodyfit-gray-dark">
                  <div className="w-1 h-1 bg-dzbodyfit-green rounded-full mr-2" />
                  {feature}
                </div>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className={`font-bold text-dzbodyfit-black ${
              isCompact ? 'text-lg' : 'text-xl'
            }`}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-dzbodyfit-gray-dark line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Shipping Info */}
          {product.shippingTime && (
            <div className="flex items-center text-xs text-dzbodyfit-gray-dark">
              <Truck className="w-3 h-3 mr-1" />
              Delivery in {product.shippingTime}
            </div>
          )}

          {/* Stock Info */}
          {product.inStock && product.stockCount && product.stockCount <= 10 && (
            <div className="flex items-center text-xs text-orange-600">
              <Clock className="w-3 h-3 mr-1" />
              Only {product.stockCount} left in stock
            </div>
          )}

          {/* Add to Cart Button */}
          <AnimatePresence>
            {(isHovered || isCompact) && product.inStock && (
              <motion.div
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-dzbodyfit-green hover:bg-dzbodyfit-green/90 text-dzbodyfit-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quality Guarantees (only for featured variant) */}
          {isFeatured && (
            <div className="flex justify-between text-xs text-dzbodyfit-gray-dark pt-2 border-t border-dzbodyfit-gray-light">
              <div className="flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Guaranteed
              </div>
              <div className="flex items-center">
                <Package className="w-3 h-3 mr-1" />
                Fast Ship
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
