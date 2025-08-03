import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-3 focus-visible:ring-offset-2 shadow-sm hover:shadow-lg hover:scale-105",
  {
    variants: {
      variant: {
        default: "bg-dzbodyfit-green text-dzbodyfit-white hover:bg-dzbodyfit-green/90 focus-visible:ring-dzbodyfit-green/30",
        destructive: "bg-dzbodyfit-error text-dzbodyfit-white hover:bg-dzbodyfit-error/90 focus-visible:ring-dzbodyfit-error/30",
        outline: "border-2 border-dzbodyfit-green bg-transparent text-dzbodyfit-green hover:bg-dzbodyfit-green hover:text-dzbodyfit-white focus-visible:ring-dzbodyfit-green/30",
        secondary: "bg-dzbodyfit-gray-light text-dzbodyfit-black hover:bg-dzbodyfit-gray-medium focus-visible:ring-dzbodyfit-gray-medium/30",
        ghost: "hover:bg-dzbodyfit-gray-light hover:text-dzbodyfit-black focus-visible:ring-dzbodyfit-gray-light/30",
        link: "text-dzbodyfit-green underline-offset-4 hover:underline focus-visible:ring-dzbodyfit-green/30",
        success: "bg-dzbodyfit-success text-dzbodyfit-white hover:bg-dzbodyfit-success/90 focus-visible:ring-dzbodyfit-success/30",
        warning: "bg-dzbodyfit-warning text-dzbodyfit-black hover:bg-dzbodyfit-warning/90 focus-visible:ring-dzbodyfit-warning/30",
        gold: "bg-dzbodyfit-gold text-dzbodyfit-black hover:bg-dzbodyfit-gold/90 font-semibold focus-visible:ring-dzbodyfit-gold/30",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-6 has-[>svg]:px-4 text-base",
        xl: "h-14 rounded-lg px-8 has-[>svg]:px-6 text-lg",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
