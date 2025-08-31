'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  height: number | string;
  itemHeight?: number;
  overscan?: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  scrollClassName?: string;
  estimateItemHeight?: (index: number) => number;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight = 72,
  overscan = 5,
  renderItem,
  className,
  scrollClassName,
  estimateItemHeight,
  getItemKey,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateItemHeight || (() => itemHeight),
    overscan,
    getItemKey: getItemKey ? (index) => getItemKey(items[index], index) : undefined,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalHeight = virtualizer.getTotalSize();

  return (
    <div
      ref={parentRef}
      className={cn(
        'overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent',
        scrollClassName
      )}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <div
        className={cn('relative w-full', className)}
        style={{
          height: `${totalHeight}px`,
        }}
      >
        <div
          style={{
            transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
          }}
          className="absolute top-0 left-0 w-full"
        >
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index];
            const key = getItemKey
              ? getItemKey(item, virtualItem.index)
              : virtualItem.key;

            return (
              <div
                key={key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
              >
                {renderItem(item, virtualItem.index)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}