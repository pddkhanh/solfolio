'use client';

import * as React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { animationConfig } from '@/lib/animations';

interface TooltipProps {
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
  trigger?: 'hover' | 'click' | 'focus';
  arrow?: boolean;
  animation?: 'fade' | 'scale' | 'slide' | 'bounce';
}

/**
 * Animated tooltip component with multiple animation variants
 */
export const AnimatedTooltip = ({
  content,
  side = 'top',
  align = 'center',
  delay = 300,
  disabled = false,
  className,
  contentClassName,
  children,
  trigger = 'hover',
  arrow = true,
  animation = 'fade',
}: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Calculate position
  const updatePosition = React.useCallback((): void => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    
    let x = 0;
    let y = 0;
    
    // Calculate base position
    switch (side) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2;
        break;
    }
    
    // Adjust for alignment
    if (side === 'top' || side === 'bottom') {
      switch (align) {
        case 'start':
          x = triggerRect.left;
          break;
        case 'end':
          x = triggerRect.right - tooltipRect.width;
          break;
        case 'center':
        default:
          x = x - tooltipRect.width / 2;
          break;
      }
    } else {
      switch (align) {
        case 'start':
          y = triggerRect.top;
          break;
        case 'end':
          y = triggerRect.bottom - tooltipRect.height;
          break;
        case 'center':
        default:
          y = y - tooltipRect.height / 2;
          break;
      }
    }
    
    // Keep tooltip in viewport
    x = Math.max(8, Math.min(x, viewport.width - tooltipRect.width - 8));
    y = Math.max(8, Math.min(y, viewport.height - tooltipRect.height - 8));
    
    setPosition({ x, y });
  }, [side, align]);
  
  // Show tooltip with delay
  const showTooltip = React.useCallback(() => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [disabled, delay]);
  
  // Hide tooltip immediately
  const hideTooltip = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);
  
  // Event handlers
  const handleMouseEnter = () => {
    if (trigger === 'hover') showTooltip();
  };
  
  const handleMouseLeave = () => {
    if (trigger === 'hover') hideTooltip();
  };
  
  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };
  
  const handleFocus = () => {
    if (trigger === 'focus') showTooltip();
  };
  
  const handleBlur = () => {
    if (trigger === 'focus') hideTooltip();
  };
  
  // Update position when tooltip becomes visible
  React.useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, updatePosition]);
  
  // Animation variants
  const animationVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
    slide: {
      initial: {
        opacity: 0,
        x: side === 'left' ? 10 : side === 'right' ? -10 : 0,
        y: side === 'top' ? 10 : side === 'bottom' ? -10 : 0,
      },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: {
        opacity: 0,
        x: side === 'left' ? 10 : side === 'right' ? -10 : 0,
        y: side === 'top' ? 10 : side === 'bottom' ? -10 : 0,
      },
    },
    bounce: {
      initial: { opacity: 0, scale: 0.3 },
      animate: { 
        opacity: 1, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 600,
          damping: 25,
        },
      },
      exit: { opacity: 0, scale: 0.3 },
    },
  };
  
  const variants = animationVariants[animation];
  
  return (
    <>
      {/* Trigger element */}
      <div
        ref={triggerRef}
        className={cn("inline-block", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {children}
      </div>
      
      {/* Tooltip portal */}
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Backdrop for click outside */}
            {trigger === 'click' && (
              <div
                className="fixed inset-0 z-40"
                onClick={hideTooltip}
              />
            )}
            
            {/* Tooltip content */}
            <motion.div
              ref={tooltipRef}
              className="fixed z-50 pointer-events-none"
              style={{
                left: position.x,
                top: position.y,
              }}
              initial={variants.initial as any}
              animate={variants.animate as any}
              exit={variants.exit as any}
              transition={{
                duration: animationConfig.duration.fast,
                ease: animationConfig.ease.default,
              }}
            >
              <div
                className={cn(
                  "relative px-3 py-2 text-sm rounded-lg shadow-lg",
                  "bg-gray-900 text-white border border-gray-700",
                  "dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300",
                  "max-w-xs break-words",
                  contentClassName
                )}
              >
                {content}
                
                {/* Arrow */}
                {arrow && (
                  <div
                    className={cn(
                      "absolute w-2 h-2 rotate-45",
                      "bg-gray-900 border-gray-700",
                      "dark:bg-gray-100 dark:border-gray-300",
                      side === 'top' && "bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b",
                      side === 'bottom' && "top-[-4px] left-1/2 -translate-x-1/2 border-l border-t",
                      side === 'left' && "right-[-4px] top-1/2 -translate-y-1/2 border-t border-r",
                      side === 'right' && "left-[-4px] top-1/2 -translate-y-1/2 border-b border-l"
                    )}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * Simple tooltip with hover trigger
 */
export const Tooltip = ({ content, children, ...props }: Omit<TooltipProps, 'trigger'>) => {
  return (
    <AnimatedTooltip content={content} trigger="hover" {...props}>
      {children}
    </AnimatedTooltip>
  );
};

/**
 * Click tooltip for more complex interactions
 */
export const ClickTooltip = ({ content, children, ...props }: Omit<TooltipProps, 'trigger'>) => {
  return (
    <AnimatedTooltip content={content} trigger="click" {...props}>
      {children}
    </AnimatedTooltip>
  );
};

/**
 * Tooltip provider context for global configuration
 */
interface TooltipContextType {
  delay: number;
  animation: TooltipProps['animation'];
  disabled: boolean;
}

const TooltipContext = React.createContext<TooltipContextType>({
  delay: 300,
  animation: 'fade',
  disabled: false,
});

export const TooltipProvider = ({
  children,
  delay = 300,
  animation = 'fade',
  disabled = false,
}: {
  children: React.ReactNode;
  delay?: number;
  animation?: TooltipProps['animation'];
  disabled?: boolean;
}) => {
  return (
    <TooltipContext.Provider value={{ delay, animation, disabled }}>
      {children}
    </TooltipContext.Provider>
  );
};

/**
 * Hook to use tooltip context
 */
export const useTooltip = () => {
  return React.useContext(TooltipContext);
};

/**
 * Rich tooltip with title and description
 */
export const RichTooltip = ({
  title,
  description,
  children,
  ...props
}: Omit<TooltipProps, 'content'> & {
  title: string;
  description?: string;
}) => {
  const content = (
    <div>
      <div className="font-semibold">{title}</div>
      {description && (
        <div className="text-xs opacity-90 mt-1">{description}</div>
      )}
    </div>
  );
  
  return (
    <AnimatedTooltip content={content} {...props}>
      {children}
    </AnimatedTooltip>
  );
};

/**
 * Tooltip with keyboard shortcut display
 */
export const ShortcutTooltip = ({
  content,
  shortcut,
  children,
  ...props
}: Omit<TooltipProps, 'content'> & {
  content: string;
  shortcut: string;
}) => {
  const tooltipContent = (
    <div className="flex items-center justify-between gap-3">
      <span>{content}</span>
      <kbd className="px-2 py-1 text-xs bg-gray-700 rounded border border-gray-600">
        {shortcut}
      </kbd>
    </div>
  );
  
  return (
    <AnimatedTooltip content={tooltipContent} {...props}>
      {children}
    </AnimatedTooltip>
  );
};

export default AnimatedTooltip;