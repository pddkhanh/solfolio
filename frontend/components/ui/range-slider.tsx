'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RangeSliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  min: number;
  max: number;
  step?: number;
  value?: [number, number];
  defaultValue?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
  label?: string;
  showValues?: boolean;
  showInput?: boolean;
  className?: string;
}

const RangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  RangeSliderProps
>(({
  className,
  min,
  max,
  step = 1,
  value,
  defaultValue = [min, max],
  onValueChange,
  formatValue = (v) => v.toString(),
  label,
  showValues = true,
  showInput = false,
  ...props
}, ref) => {
  const [localValue, setLocalValue] = React.useState<[number, number]>(
    value || defaultValue
  );

  React.useEffect(() => {
    if (value) {
      setLocalValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: number[]) => {
    const typedValue = newValue as [number, number];
    setLocalValue(typedValue);
    onValueChange?.(typedValue);
  };

  const handleInputChange = (index: 0 | 1, inputValue: string) => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) return;

    const newValue: [number, number] = [...localValue];
    newValue[index] = Math.max(min, Math.min(max, numValue));
    
    // Ensure min value doesn't exceed max value
    if (index === 0 && newValue[0] > newValue[1]) {
      newValue[0] = newValue[1];
    } else if (index === 1 && newValue[1] < newValue[0]) {
      newValue[1] = newValue[0];
    }

    handleValueChange(newValue);
  };

  const percentage = React.useMemo(() => {
    const range = max - min;
    return [
      ((localValue[0] - min) / range) * 100,
      ((localValue[1] - min) / range) * 100,
    ];
  }, [localValue, min, max]);

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          {showValues && !showInput && (
            <span className="text-sm text-muted-foreground">
              {formatValue(localValue[0])} - {formatValue(localValue[1])}
            </span>
          )}
        </div>
      )}

      {showInput && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={min}
            max={localValue[1]}
            step={step}
            value={localValue[0]}
            onChange={(e) => handleInputChange(0, e.target.value)}
            className="w-24 rounded-md border bg-background px-2 py-1 text-sm"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <input
            type="number"
            min={localValue[0]}
            max={max}
            step={step}
            value={localValue[1]}
            onChange={(e) => handleInputChange(1, e.target.value)}
            className="w-24 rounded-md border bg-background px-2 py-1 text-sm"
          />
        </div>
      )}

      <div className="relative">
        <SliderPrimitive.Root
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={localValue}
          onValueChange={handleValueChange}
          className="relative flex w-full touch-none select-none items-center"
          {...props}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="absolute h-full bg-primary"
              initial={false}
              animate={{
                left: `${percentage[0]}%`,
                right: `${100 - percentage[1]}%`,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </SliderPrimitive.Track>
          
          {localValue.map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <motion.div
                className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-xs text-background opacity-0"
                initial={{ opacity: 0, y: 5 }}
                whileHover={{ opacity: 1, y: 0 }}
                whileFocus={{ opacity: 1, y: 0 }}
              >
                {formatValue(localValue[index])}
              </motion.div>
            </SliderPrimitive.Thumb>
          ))}
        </SliderPrimitive.Root>

        {/* Tick marks for better visual reference */}
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
});

RangeSlider.displayName = 'RangeSlider';

// Single value slider variant
interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  formatValue?: (value: number) => string;
  label?: string;
  showValue?: boolean;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, formatValue = (v) => v.toString(), label, showValue = true, ...props }, ref) => (
  <div className="space-y-2">
    {label && (
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {showValue && props.value && (
          <span className="text-sm text-muted-foreground">
            {formatValue(props.value[0])}
          </span>
        )}
      </div>
    )}
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  </div>
));

Slider.displayName = SliderPrimitive.Root.displayName;

export { RangeSlider, Slider };