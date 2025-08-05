"use client"

import React from 'react'
import Head from 'next/head'
import { RevolutionaryHeader } from '@/components/dzbodyfit/RevolutionaryHeader'
import { RevolutionaryFooter } from '@/components/dzbodyfit/RevolutionaryFooter'
import { RevolutionarySidebar } from '@/components/dzbodyfit/RevolutionarySidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
  noIndex?: boolean
  structuredData?: object
}

interface RevolutionaryPageTemplateProps {
  children: React.ReactNode
  variant?: 'default' | 'shop' | 'product' | 'brand' | 'category' | 'admin' | 'checkout'
  seo?: SEOProps
  className?: string
  showSidebar?: boolean
  sidebarConfig?: {
    categories?: Array<{ id: string; name: string; count?: number }>
    brands?: Array<{ id: string; name: string; count?: number }>
    priceRange?: { min: number; max: number }
    filters?: Array<{ id: string; name: string; type: string; options?: string[] }>
  }
  pageTitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  headerActions?: React.ReactNode
  isLoading?: boolean
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const sidebarVariants = {
  open: { x: 0, opacity: 1 },
  closed: { x: '-100%', opacity: 0 }
}

export function RevolutionaryPageTemplate({
  children,
  variant = 'default',
  seo = {},
  className = '',
  showSidebar = false,
  sidebarConfig = {},
  pageTitle,
  breadcrumbs = [],
  headerActions,
  isLoading = false
}: RevolutionaryPageTemplateProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  // SEO Defaults
  const defaultSEO: SEOProps = {
    title: 'DZBodyFit - Premium Supplements in Algeria',
    description: 'Discover authentic protein powders, pre-workouts, and supplements from top brands. Fast delivery across Algeria with expert nutrition guidance.',
    keywords: ['supplements', 'protein', 'pre-workout', 'Algeria', 'fitness', 'bodybuilding'],
    ogImage: '/images/og-default.jpg'
  }

  const finalSEO = { ...defaultSEO, ...seo }

  // Generate structured data based on page variant
  const generateStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "DZBodyFit",
      "url": "https://dzbodyfit.com",
      "description": finalSEO.description,
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://dzbodyfit.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }

    if (variant === 'shop') {
      return {
        ...baseData,
        "@type": "Store",
        "name": "DZBodyFit Store",
        "image": finalSEO.ogImage,
        "priceRange": "$",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "DZ"
        }
      }
    }

    if (variant === 'product') {
      return {
        ...baseData,
        "@type": "Product",
        // Additional product-specific schema will be added by individual product pages
      }
    }

    return baseData
  }

  const getContainerClass = () => {
    switch (variant) {
      case 'shop':
      case 'category':
      case 'brand':
        return showSidebar 
          ? 'grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8' 
          : 'max-w-7xl mx-auto'
      case 'product':
        return 'max-w-7xl mx-auto'
      case 'admin':
        return 'max-w-full'
      case 'checkout':
        return 'max-w-4xl mx-auto'
      default:
        return 'max-w-7xl mx-auto'
    }
  }

  const getMainPadding = () => {
    switch (variant) {
      case 'admin':
        return 'p-0'
      case 'checkout':
        return 'px-4 md:px-6 py-8'
      default:
        return 'px-4 md:px-6 lg:px-8 py-8'
    }
  }

  return (
    <>
      <Head>
        <title>{finalSEO.title}</title>
        <meta name="description" content={finalSEO.description} />
        {finalSEO.keywords && (
          <meta name="keywords" content={finalSEO.keywords.join(', ')} />
        )}
        <meta property="og:title" content={finalSEO.title} />
        <meta property="og:description" content={finalSEO.description} />
        <meta property="og:image" content={finalSEO.ogImage} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={finalSEO.title} />
        <meta name="twitter:description" content={finalSEO.description} />
        <meta name="twitter:image" content={finalSEO.ogImage} />
        {finalSEO.canonicalUrl && (
          <link rel="canonical" href={finalSEO.canonicalUrl} />
        )}
        {finalSEO.noIndex && (
          <meta name="robots" content="noindex, nofollow" />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(finalSEO.structuredData || generateStructuredData())
          }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={cn(
        'min-h-screen bg-gradient-to-br from-white via-dzbodyfit-gray-light/10 to-white',
        className
      )}>
        {/* Header */}
        {variant !== 'admin' && (
          <RevolutionaryHeader />
        )}

        {/* Page Header */}
        {(pageTitle || breadcrumbs.length > 0 || headerActions) && variant !== 'admin' && (
          <section className="bg-gradient-to-r from-dzbodyfit-green/5 to-dzbodyfit-blue/5 border-b">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  {breadcrumbs.length > 0 && (
                    <nav className="mb-2">
                      <ol className="flex items-center space-x-2 text-sm text-dzbodyfit-gray">
                        {breadcrumbs.map((crumb, index) => (
                          <li key={index} className="flex items-center">
                            {index > 0 && <span className="mx-2">/</span>}
                            {crumb.href ? (
                              <a href={crumb.href} className="hover:text-dzbodyfit-green transition-colors">
                                {crumb.label}
                              </a>
                            ) : (
                              <span className="text-dzbodyfit-black font-medium">{crumb.label}</span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </nav>
                  )}
                  {pageTitle && (
                    <h1 className="text-2xl md:text-3xl font-bold text-dzbodyfit-black">
                      {pageTitle}
                    </h1>
                  )}
                </div>
                {headerActions && (
                  <div className="flex items-center space-x-4">
                    {headerActions}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1',
          variant === 'admin' ? 'pt-0' : 'pt-0'
        )}>
          <div className={cn(getMainPadding())}>
            <div className={getContainerClass()}>
              {/* Sidebar */}
              {showSidebar && (
                <>
                  {/* Desktop Sidebar */}
                  <aside className="hidden lg:block">
                    <RevolutionarySidebar />
                  </aside>

                  {/* Mobile Sidebar Overlay */}
                  <AnimatePresence>
                    {sidebarOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                          onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                          variants={sidebarVariants}
                          initial="closed"
                          animate="open"
                          exit="closed"
                          transition={{ type: 'spring', damping: 20 }}
                          className="fixed left-0 top-0 h-full w-80 bg-white z-50 lg:hidden overflow-y-auto"
                        >
                          <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                              <h2 className="text-lg font-semibold">Filters</h2>
                              <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <RevolutionarySidebar />
                          </div>
                        </motion.aside>
                      </>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Page Content */}
              <div className={cn(
                'w-full',
                showSidebar ? 'lg:min-h-[600px]' : ''
              )}>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center min-h-[400px]"
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 border-4 border-dzbodyfit-green/20 border-t-dzbodyfit-green rounded-full animate-spin" />
                        <p className="text-dzbodyfit-gray">Loading...</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                    >
                      {children}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        {variant !== 'admin' && variant !== 'checkout' && (
          <RevolutionaryFooter />
        )}
      </div>
    </>
  )
}

// Export default for backward compatibility
export default RevolutionaryPageTemplate
