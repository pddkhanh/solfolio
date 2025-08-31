/**
 * Accessibility utilities and hooks for SolFolio
 * Implements WCAG 2.1 AA compliance standards
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Keyboard navigation constants
 */
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * ARIA live region politeness levels
 */
export const ARIA_LIVE = {
  OFF: 'off',
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
} as const;

/**
 * Common ARIA roles
 */
export const ARIA_ROLES = {
  BUTTON: 'button',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  COMPLEMENTARY: 'complementary',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo',
  SEARCH: 'search',
  FORM: 'form',
  REGION: 'region',
  ALERT: 'alert',
  STATUS: 'status',
  DIALOG: 'dialog',
  ALERTDIALOG: 'alertdialog',
  PROGRESSBAR: 'progressbar',
  MENU: 'menu',
  MENUBAR: 'menubar',
  MENUITEM: 'menuitem',
  TOOLTIP: 'tooltip',
  GRID: 'grid',
  ROW: 'row',
  GRIDCELL: 'gridcell',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
} as const;

/**
 * Focus trap hook for modals and dialogs
 */
export function useFocusTrap(isActive = true) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element
    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== KEYS.TAB) return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the previous element
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for keyboard navigation in lists and grids
 */
export function useArrowNavigation(
  itemsCount: number,
  orientation: 'horizontal' | 'vertical' | 'grid' = 'vertical',
  gridColumns = 1
) {
  const currentIndex = useRef(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, onIndexChange: (index: number) => void) => {
      let newIndex = currentIndex.current;

      switch (e.key) {
        case KEYS.ARROW_UP:
          if (orientation === 'vertical') {
            newIndex = Math.max(0, currentIndex.current - 1);
          } else if (orientation === 'grid') {
            newIndex = Math.max(0, currentIndex.current - gridColumns);
          }
          break;

        case KEYS.ARROW_DOWN:
          if (orientation === 'vertical') {
            newIndex = Math.min(itemsCount - 1, currentIndex.current + 1);
          } else if (orientation === 'grid') {
            newIndex = Math.min(itemsCount - 1, currentIndex.current + gridColumns);
          }
          break;

        case KEYS.ARROW_LEFT:
          if (orientation === 'horizontal') {
            newIndex = Math.max(0, currentIndex.current - 1);
          } else if (orientation === 'grid') {
            newIndex = Math.max(0, currentIndex.current - 1);
          }
          break;

        case KEYS.ARROW_RIGHT:
          if (orientation === 'horizontal') {
            newIndex = Math.min(itemsCount - 1, currentIndex.current + 1);
          } else if (orientation === 'grid') {
            newIndex = Math.min(itemsCount - 1, currentIndex.current + 1);
          }
          break;

        case KEYS.HOME:
          newIndex = 0;
          break;

        case KEYS.END:
          newIndex = itemsCount - 1;
          break;

        default:
          return;
      }

      if (newIndex !== currentIndex.current) {
        e.preventDefault();
        currentIndex.current = newIndex;
        onIndexChange(newIndex);
      }
    },
    [itemsCount, orientation, gridColumns]
  );

  return { handleKeyDown, currentIndex: currentIndex.current };
}

/**
 * Hook to announce changes to screen readers
 */
export function useAnnounce() {
  const announceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!announceRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', ARIA_LIVE.POLITE);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
      announceRef.current = announcer;
    }

    return () => {
      if (announceRef.current && document.body.contains(announceRef.current)) {
        document.body.removeChild(announceRef.current);
        announceRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return announce;
}

/**
 * Hook to manage focus visibility (keyboard vs mouse)
 */
export function useFocusVisible() {
  useEffect(() => {
    // Add or remove 'keyboard-navigation' class based on input method
    let lastInteraction: 'keyboard' | 'mouse' = 'mouse';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYS.TAB) {
        lastInteraction = 'keyboard';
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      lastInteraction = 'mouse';
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
}

/**
 * Get appropriate ARIA label for token value changes
 */
export function getChangeAriaLabel(value: number, change: number, changePercent: number): string {
  const direction = change >= 0 ? 'increased' : 'decreased';
  const absChange = Math.abs(change);
  const absPercent = Math.abs(changePercent);
  
  return `Value: $${value.toFixed(2)}, ${direction} by $${absChange.toFixed(2)} or ${absPercent.toFixed(2)} percent`;
}

/**
 * Get ARIA label for loading states
 */
export function getLoadingAriaLabel(context: string): string {
  return `Loading ${context}. Please wait.`;
}

/**
 * Format time for screen readers
 */
export function getTimeAriaLabel(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get focus ring styles
 */
export function getFocusRingClass(): string {
  return 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-primary';
}

/**
 * Check color contrast ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Convert hex to RGB
  const getRGB = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Calculate relative luminance
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const { r, g, b } = rgb;
    const sRGB = [r, g, b].map((val) => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const rgb1 = getRGB(color1);
  const rgb2 = getRGB(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 */
export function meetsContrastStandard(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText = false
): boolean {
  if (level === 'AA') {
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  } else {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
}

/**
 * Hook to register a skip navigation target
 */
export function useSkipTarget<T extends HTMLElement = HTMLDivElement>(id: string) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Add the id and tabindex to make it focusable
    element.id = id;
    element.tabIndex = -1;

    // Handle focus styling
    const handleFocus = () => {
      element.style.outline = '2px solid var(--primary)';
      element.style.outlineOffset = '2px';
    };

    const handleBlur = () => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    };

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [id]);

  return ref;
}