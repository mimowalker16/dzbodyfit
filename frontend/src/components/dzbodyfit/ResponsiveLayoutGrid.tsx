import React from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveLayoutGridProps {
  children: React.ReactNode
  columns?: number
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function ResponsiveLayoutGrid({ 
  children, 
  columns = 3, 
  gap = 'lg', 
  className = '' 
}: ResponsiveLayoutGridProps) {
  const getGridCols = () => {
    switch (columns) {
      case 1: return 'grid-cols-1'
      case 2: return 'grid-cols-1 md:grid-cols-2'
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      case 6: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  const getGapSize = () => {
    switch (gap) {
      case 'sm': return 'gap-2'
      case 'md': return 'gap-4'
      case 'lg': return 'gap-6'
      case 'xl': return 'gap-8'
      default: return 'gap-4'
    }
  }

  return (
    <div className={cn(`grid ${getGridCols()} ${getGapSize()}`, className)}>
      {children}
    </div>
  )
}

export default ResponsiveLayoutGrid
