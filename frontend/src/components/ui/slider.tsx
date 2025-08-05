"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, disabled = false }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value)

    React.useEffect(() => {
      setInternalValue(value)
    }, [value])

    const handleChange = (newValue: number[]) => {
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Number(e.target.value)
      const newValue = [newMin, internalValue[1] || max]
      handleChange(newValue)
    }

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Number(e.target.value)
      const newValue = [internalValue[0] || min, newMax]
      handleChange(newValue)
    }

    return (
      <div ref={ref} className={cn("relative flex items-center space-x-2", className)}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={internalValue[0] || min}
          onChange={handleMinChange}
          disabled={disabled}
          className={cn(
            "flex-1 h-2 bg-dzbodyfit-gray-light rounded-lg appearance-none cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-dzbodyfit-green focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-dzbodyfit-green",
            "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md",
            "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-dzbodyfit-green [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
          )}
        />
        {internalValue.length > 1 && (
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={internalValue[1] || max}
            onChange={handleMaxChange}
            disabled={disabled}
            className={cn(
              "flex-1 h-2 bg-dzbodyfit-gray-light rounded-lg appearance-none cursor-pointer absolute top-0 left-0 right-0",
              "focus:outline-none focus:ring-2 focus:ring-dzbodyfit-green focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
              "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-dzbodyfit-blue",
              "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md",
              "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full",
              "[&::-moz-range-thumb]:bg-dzbodyfit-blue [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
            )}
          />
        )}
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }
