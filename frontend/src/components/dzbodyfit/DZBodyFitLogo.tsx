import * as React from "react"
import { cn } from "../../lib/utils"

interface DZBodyFitLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "full" | "icon" | "text"
  size?: "sm" | "md" | "lg" | "xl"
  theme?: "dark" | "light" | "gradient"
}

const DZBodyFitLogo = React.forwardRef<HTMLDivElement, DZBodyFitLogoProps>(
  ({ className, variant = "full", size = "md", theme = "dark", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 text-lg",
      md: "h-12 text-2xl", 
      lg: "h-16 text-3xl",
      xl: "h-20 text-4xl"
    }

    const themeClasses = {
      dark: "text-dzbodyfit-black",
      light: "text-dzbodyfit-white",
      gradient: "bg-gradient-to-r from-dzbodyfit-green to-dzbodyfit-success bg-clip-text text-transparent"
    }

    const IconComponent = () => (
      <div className="relative">
        {/* Stylized DB icon representing dumbbells/fitness */}
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-dzbodyfit-green rounded-full"></div>
          <div className="w-8 h-1 bg-dzbodyfit-green"></div>
          <div className="w-3 h-3 bg-dzbodyfit-green rounded-full"></div>
        </div>
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-5 bg-dzbodyfit-gold rounded-full"></div>
        </div>
      </div>
    )

    const TextComponent = () => (
      <div className="font-bold font-display tracking-tight">
        <span className={cn("text-dzbodyfit-green", themeClasses[theme])}>
          DZ
        </span>
        <span className={cn("text-dzbodyfit-gold", themeClasses[theme])}>
          Body
        </span>
        <span className={cn("text-dzbodyfit-black", themeClasses[theme])}>
          Fit
        </span>
      </div>
    )

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center space-x-3 transition-all duration-300 hover:scale-105",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {(variant === "full" || variant === "icon") && <IconComponent />}
        {(variant === "full" || variant === "text") && <TextComponent />}
      </div>
    )
  }
)

DZBodyFitLogo.displayName = "DZBodyFitLogo"

export { DZBodyFitLogo }
