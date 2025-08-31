'use client';

import { ReactNode, useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTouchGestures, triggerHapticFeedback } from '@/hooks/use-touch-gestures';
import { cn } from '@/lib/utils';
import { Copy, Share2, Edit2, Trash2, Star, MoreVertical } from 'lucide-react';

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface LongPressMenuProps {
  children: ReactNode;
  items: MenuItem[];
  className?: string;
  delay?: number;
  position?: 'top' | 'bottom' | 'auto';
  align?: 'start' | 'center' | 'end';
  hapticFeedback?: boolean;
  showIndicator?: boolean;
}

export function LongPressMenu({
  children,
  items,
  className,
  delay = 500,
  position = 'auto',
  align = 'center',
  hapticFeedback = true,
  showIndicator = true
}: LongPressMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [actualPosition, setActualPosition] = useState<'top' | 'bottom'>('bottom');

  const handleLongPress = useCallback((event: TouchEvent | MouseEvent) => {
    if (hapticFeedback) triggerHapticFeedback('medium');
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    let x: number, y: number;
    
    if ('touches' in event) {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    // Calculate menu position
    const viewportHeight = window.innerHeight;
    const menuHeight = items.length * 48 + 16; // Approximate menu height
    
    // Determine vertical position
    let finalPosition: 'top' | 'bottom' = 'bottom';
    if (position === 'auto') {
      finalPosition = y + menuHeight > viewportHeight - 50 ? 'top' : 'bottom';
    } else {
      finalPosition = position;
    }
    
    setActualPosition(finalPosition);
    setMenuPosition({ x, y });
    setIsOpen(true);
  }, [items.length, position, hapticFeedback]);

  useTouchGestures(containerRef, {
    longPress: {
      onLongPress: handleLongPress,
      delay
    },
    hapticFeedback
  });

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setMenuPosition(null);
  }, []);

  const handleItemClick = useCallback((item: MenuItem) => {
    if (item.disabled) return;
    
    if (hapticFeedback) triggerHapticFeedback('light');
    item.onClick();
    handleClose();
  }, [hapticFeedback, handleClose]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      <div 
        ref={containerRef}
        className={cn('relative', className)}
      >
        {children}
        
        {/* Long press indicator */}
        {showIndicator && (
          <div className="absolute top-1 right-1 pointer-events-none opacity-30">
            <MoreVertical className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Context menu */}
      <AnimatePresence>
        {isOpen && menuPosition && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50"
            style={{
              left: menuPosition.x,
              top: actualPosition === 'bottom' ? menuPosition.y + 10 : undefined,
              bottom: actualPosition === 'top' ? window.innerHeight - menuPosition.y + 10 : undefined,
              transform: align === 'center' ? 'translateX(-50%)' : 
                         align === 'start' ? 'translateX(0)' :
                         'translateX(-100%)'
            }}
          >
            <div className="bg-bg-secondary rounded-lg shadow-2xl border border-border-default overflow-hidden min-w-[200px]">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-3 text-left transition-colors',
                    'min-h-[48px]', // Touch-friendly size
                    item.destructive 
                      ? 'text-red-500 hover:bg-red-500/10 active:bg-red-500/20' 
                      : 'hover:bg-bg-tertiary active:bg-bg-tertiary/80',
                    item.disabled && 'opacity-50 cursor-not-allowed',
                    index !== items.length - 1 && 'border-b border-border-default'
                  )}
                >
                  {item.icon && (
                    <span className="flex-shrink-0">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1 text-sm font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Pre-configured long press menu for common actions
interface QuickActionsMenuProps {
  children: ReactNode;
  onCopy?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  className?: string;
}

export function QuickActionsMenu({
  children,
  onCopy,
  onShare,
  onEdit,
  onDelete,
  onFavorite,
  isFavorite = false,
  className
}: QuickActionsMenuProps) {
  const items: MenuItem[] = [];

  if (onCopy) {
    items.push({
      label: 'Copy',
      icon: <Copy className="w-4 h-4" />,
      onClick: onCopy
    });
  }

  if (onShare) {
    items.push({
      label: 'Share',
      icon: <Share2 className="w-4 h-4" />,
      onClick: onShare
    });
  }

  if (onFavorite) {
    items.push({
      label: isFavorite ? 'Remove from favorites' : 'Add to favorites',
      icon: <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />,
      onClick: onFavorite
    });
  }

  if (onEdit) {
    items.push({
      label: 'Edit',
      icon: <Edit2 className="w-4 h-4" />,
      onClick: onEdit
    });
  }

  if (onDelete) {
    items.push({
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      destructive: true
    });
  }

  if (items.length === 0) {
    return <>{children}</>;
  }

  return (
    <LongPressMenu
      items={items}
      className={className}
    >
      {children}
    </LongPressMenu>
  );
}