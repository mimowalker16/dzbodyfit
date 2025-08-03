'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowRight, Star, Zap, Award, Shield } from 'lucide-react';
import Link from 'next/link';

interface HeroBannerProps {
  variant?: 'home' | 'category' | 'product';
  title: string;
  subtitle?: string;
  description: string;
  primaryAction: {
    text: string;
    href: string;
  };
  secondaryAction?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
  badge?: string;
  stats?: Array<{
    value: string;
    label: string;
    icon?: React.ElementType;
  }>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

export function HeroBanner({
  variant = 'home',
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  badge,
  stats
}: HeroBannerProps) {
  const isHome = variant === 'home';

  return (
    <div className="relative min-h-[70vh] lg:min-h-[80vh] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {backgroundImage ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-dzbodyfit-black via-dzbodyfit-green to-dzbodyfit-black" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-dzbodyfit-black/70 via-dzbodyfit-green/30 to-dzbodyfit-black/80" />
        
        {/* Animated Geometric Shapes */}
        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 bg-dzbodyfit-gold/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-40 left-20 w-48 h-48 bg-dzbodyfit-green/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/3 w-24 h-24 bg-dzbodyfit-gold/30 rounded-xl blur-lg rotate-45"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center lg:text-left lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center"
        >
          {/* Text Content */}
          <div className="space-y-8">
            {badge && (
              <motion.div variants={itemVariants}>
                <Badge 
                  className="bg-dzbodyfit-gold/20 text-dzbodyfit-gold border-dzbodyfit-gold/30 hover:bg-dzbodyfit-gold/30 transition-all duration-300"
                >
                  <Star className="w-3 h-3 mr-1" />
                  {badge}
                </Badge>
              </motion.div>
            )}

            {subtitle && (
              <motion.h2 
                variants={itemVariants}
                className="text-lg sm:text-xl font-semibold text-dzbodyfit-gold tracking-wide uppercase"
              >
                {subtitle}
              </motion.h2>
            )}

            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-dzbodyfit-white leading-tight"
            >
              {title.split(' ').map((word, index) => (
                <motion.span
                  key={index}
                  className={index % 2 === 1 ? "text-dzbodyfit-gold" : ""}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                >
                  {word}{' '}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-dzbodyfit-gray-light max-w-2xl leading-relaxed"
            >
              {description}
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href={primaryAction.href}>
                <Button 
                  size="lg"
                  className="bg-dzbodyfit-gold hover:bg-dzbodyfit-gold/90 text-dzbodyfit-black font-bold px-8 py-4 rounded-xl text-lg group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-dzbodyfit-gold/25"
                >
                  {primaryAction.text}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              {secondaryAction && (
                <Link href={secondaryAction.href}>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-dzbodyfit-white text-dzbodyfit-white hover:bg-dzbodyfit-white hover:text-dzbodyfit-black font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:scale-105"
                  >
                    {secondaryAction.text}
                  </Button>
                </Link>
              )}
            </motion.div>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-8"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + (index * 0.1), duration: 0.5 }}
                    className="text-center lg:text-left"
                  >
                    <div className="flex items-center justify-center lg:justify-start mb-2">
                      {stat.icon && <stat.icon className="w-5 h-5 text-dzbodyfit-gold mr-2" />}
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-dzbodyfit-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-dzbodyfit-gray-light">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Visual Element */}
          {isHome && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Floating Product Showcase */}
                <motion.div
                  animate={{ 
                    y: [-20, 20, -20],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="relative bg-gradient-to-br from-dzbodyfit-white/10 to-dzbodyfit-white/5 backdrop-blur-lg rounded-3xl p-8 border border-dzbodyfit-white/20"
                >
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-8 h-8 text-dzbodyfit-gold" />
                      <span className="text-xl font-bold text-dzbodyfit-white">
                        Performance Boost
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Award className="w-8 h-8 text-dzbodyfit-gold" />
                      <span className="text-xl font-bold text-dzbodyfit-white">
                        Premium Quality
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Shield className="w-8 h-8 text-dzbodyfit-gold" />
                      <span className="text-xl font-bold text-dzbodyfit-white">
                        100% Safe
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative Elements */}
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-4 -right-4 w-16 h-16 border-4 border-dzbodyfit-gold/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: [360, 0] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 border-3 border-dzbodyfit-white/30 rounded-full"
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-dzbodyfit-white/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-dzbodyfit-white/70 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
