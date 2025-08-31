'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkipLink {
  id: string;
  label: string;
}

const defaultLinks: SkipLink[] = [
  { id: 'main-content', label: 'Skip to main content' },
  { id: 'portfolio-overview', label: 'Skip to portfolio overview' },
  { id: 'token-list', label: 'Skip to token list' },
  { id: 'positions', label: 'Skip to positions' },
  { id: 'footer', label: 'Skip to footer' },
];

interface SkipNavigationProps {
  links?: SkipLink[];
  className?: string;
}

export function SkipNavigation({ 
  links = defaultLinks,
  className 
}: SkipNavigationProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const handleFocus = () => setIsVisible(true);
  const handleBlur = () => setIsVisible(false);

  return (
    <motion.nav
      initial={false}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : -100 
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        'fixed top-0 left-0 z-50 w-full bg-bg-secondary border-b border-border-default',
        'transform transition-all duration-200',
        !isVisible && 'sr-only',
        className
      )}
      aria-label="Skip navigation"
    >
      <div className="container mx-auto px-4 py-2">
        <ul className="flex flex-wrap gap-4">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClick={() => {
                  // Ensure the target element receives focus
                  const element = document.getElementById(link.id);
                  if (element) {
                    element.setAttribute('tabindex', '-1');
                    element.focus();
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsVisible(false);
                }}
                className={cn(
                  'inline-block px-4 py-2 rounded-lg',
                  'bg-primary text-white font-medium',
                  'hover:bg-primary-dark transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-primary'
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
}

/**
 * Hook to create skip link targets
 */
export function useSkipTarget(id: string) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Set the ID for the skip link target
    element.id = id;
    
    // Make the element focusable when navigated to via skip link
    const originalTabIndex = element.getAttribute('tabindex');
    
    const handleFocus = () => {
      // Remove tabindex after focus to prevent it from being in the tab order
      setTimeout(() => {
        if (originalTabIndex) {
          element.setAttribute('tabindex', originalTabIndex);
        } else {
          element.removeAttribute('tabindex');
        }
      }, 100);
    };

    element.addEventListener('focus', handleFocus);

    return () => {
      element.removeEventListener('focus', handleFocus);
    };
  }, [id]);

  return ref;
}