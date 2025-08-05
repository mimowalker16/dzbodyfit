"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { DZBodyFitLogo } from './DZBodyFitLogo'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Youtube, 
  Twitter,
  Send,
  Shield,
  Truck,
  RefreshCw,
  Star,
  Heart,
  Award,
  Clock,
  CheckCircle,
  CreditCard,
  Smartphone,
  Globe,
  ArrowRight
} from 'lucide-react'

interface FooterProps {
  className?: string
}

interface FooterLink {
  label: string
  href: string
  isViewAll?: boolean
  isFeatured?: boolean
}

const footerSections = {
  products: {
    title: 'Products',
    icon: <Award className="w-4 h-4" />,
    links: [
      { label: 'Whey Protein', href: '/supplements/whey-protein' },
      { label: 'Mass Gainers', href: '/supplements/mass-gainers' },
      { label: 'Pre-Workout', href: '/supplements/pre-workout' },
      { label: 'Creatine', href: '/supplements/creatine' },
      { label: 'BCAAs', href: '/supplements/bcaa' },
      { label: 'Fat Burners', href: '/supplements/fat-burners' },
      { label: 'Vitamins', href: '/supplements/vitamins' },
      { label: 'View All', href: '/supplements', isViewAll: true }
    ] as FooterLink[]
  },
  brands: {
    title: 'Brands',
    icon: <Star className="w-4 h-4" />,
    links: [
      { label: 'Optimum Nutrition', href: '/brands/optimum-nutrition' },
      { label: 'MuscleTech', href: '/brands/muscletech' },
      { label: 'BSN', href: '/brands/bsn' },
      { label: 'Dymatize', href: '/brands/dymatize' },
      { label: 'Gaspari Nutrition', href: '/brands/gaspari' },
      { label: 'DZBodyFit Pro', href: '/brands/dzbodyfit-pro', isFeatured: true },
      { label: 'All Brands', href: '/brands', isViewAll: true }
    ] as FooterLink[]
  },
  support: {
    title: 'Customer Support',
    icon: <Phone className="w-4 h-4" />,
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Order Tracking', href: '/track-order' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns & Refunds', href: '/returns' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'Product Guide', href: '/product-guide' },
      { label: 'Help Center', href: '/help', isViewAll: true }
    ] as FooterLink[]
  },
  company: {
    title: 'About DZBodyFit',
    icon: <Heart className="w-4 h-4" />,
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Mission & Values', href: '/mission' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press & Media', href: '/press' },
      { label: 'Athletes', href: '/athletes' },
      { label: 'Reviews', href: '/reviews' },
      { label: 'Blog', href: '/blog' },
      { label: 'Learn More', href: '/about', isViewAll: true }
    ] as FooterLink[]
  }
}

const trustBadges = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: '100% Authentic',
    description: 'Guaranteed genuine products'
  },
  {
    icon: <Truck className="w-6 h-6" />,
    title: 'Fast Delivery',
    description: 'Free shipping over 5000 DZD'
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: '30-Day Returns',
    description: 'Hassle-free returns'
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: 'Quality Assured',
    description: 'Lab-tested supplements'
  }
]

const paymentMethods = [
  { name: 'Cash on Delivery', icon: <CreditCard className="w-8 h-8" /> },
  { name: 'Bank Transfer', icon: <CreditCard className="w-8 h-8" /> },
  { name: 'Mobile Payment', icon: <Smartphone className="w-8 h-8" /> }
]

const socialMediaLinks = [
  { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, href: '#', color: 'hover:text-blue-600' },
  { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, href: '#', color: 'hover:text-pink-600' },
  { name: 'Youtube', icon: <Youtube className="w-5 h-5" />, href: '#', color: 'hover:text-red-600' },
  { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: '#', color: 'hover:text-blue-500' }
]

export function RevolutionaryFooter({ className = '' }: FooterProps) {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setIsSubscribed(true)
      setEmail('')
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  return (
    <footer className={`bg-gradient-to-br from-dzbodyfit-black via-dzbodyfit-gray to-dzbodyfit-black text-white ${className}`}>
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-dzbodyfit-green via-dzbodyfit-blue to-dzbodyfit-green">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              Join the DZBodyFit Community
            </h3>
            <p className="text-lg opacity-90">
              Get exclusive deals, nutrition tips, and be the first to know about new products
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:border-white focus:ring-white/20"
                required
              />
              <Button
                type="submit"
                className="bg-white text-dzbodyfit-green hover:bg-white/90 font-semibold px-6"
                disabled={isSubscribed}
              >
                {isSubscribed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            </form>
            
            {isSubscribed && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-3 text-white/90"
              >
                ✨ Welcome to the DZBodyFit family! Check your email for exclusive offers.
              </motion.p>
            )}
            
            <p className="text-center text-sm opacity-75 mt-4">
              Join 25,000+ fitness enthusiasts across Algeria
            </p>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-dzbodyfit-green/20 rounded-full mb-3 text-dzbodyfit-green">
                  {badge.icon}
                </div>
                <h4 className="font-semibold mb-1">{badge.title}</h4>
                <p className="text-sm text-gray-400">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <DZBodyFitLogo variant="full" size="lg" />
            <p className="text-gray-400 mt-4 mb-6 leading-relaxed">
                                  Algeria&apos;s Premier Fitness Equipment & Supplements Store 
              Empowering your fitness journey with quality products and expert guidance since 2020.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-dzbodyfit-green" />
                <span className="text-sm">+213 555 123 456</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-dzbodyfit-green" />
                <span className="text-sm">support@dzbodyfit.dz</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-dzbodyfit-green" />
                <span className="text-sm">Algiers, Algeria</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-dzbodyfit-green" />
                <span className="text-sm">Mon-Sat: 9AM-8PM</span>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-3">Follow Us</h4>
              <div className="flex gap-3">
                {socialMediaLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-dzbodyfit-green ${social.color}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-dzbodyfit-green">
                {section.icon}
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className={`text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 ${
                        link.isViewAll ? 'font-semibold text-dzbodyfit-green hover:text-dzbodyfit-green/80' : ''
                      }`}
                    >
                      {link.label}
                      {link.isFeatured && (
                        <Badge className="bg-dzbodyfit-gold text-dzbodyfit-black text-xs">New</Badge>
                      )}
                      {link.isViewAll && <ArrowRight className="w-3 h-3" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods & Legal */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Payment Methods:</span>
              <div className="flex items-center gap-3">
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className="w-12 h-8 bg-white/10 rounded flex items-center justify-center"
                    title={method.name}
                  >
                    {method.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="flex items-center gap-4">
              <Badge className="bg-dzbodyfit-green text-white">
                <Globe className="w-3 h-3 mr-1" />
                Halal Certified
              </Badge>
              <Badge className="bg-dzbodyfit-blue text-white">
                <Shield className="w-3 h-3 mr-1" />
                Lab Tested
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/50 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>© 2024 DZBodyFit. All rights reserved.</span>
              <Separator orientation="vertical" className="h-4 bg-white/20" />
              <span>Made with ❤️ in Algeria</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
