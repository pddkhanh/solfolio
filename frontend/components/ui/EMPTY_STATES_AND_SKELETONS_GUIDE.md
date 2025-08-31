# Empty States & Skeleton Loaders Guide

## Overview
This guide provides comprehensive documentation for implementing empty states and skeleton loaders in SolFolio, ensuring a polished user experience during loading and empty data scenarios.

## Empty States

### Purpose
Empty states guide users when there's no data to display, providing clear context and actionable next steps.

### Available Variants

#### 1. `no-wallet` - Wallet Not Connected
```tsx
<EmptyState
  variant="no-wallet"
  action={{
    label: "Connect Wallet",
    onClick: handleWalletConnect
  }}
/>
```
**Use when:** User hasn't connected their Solana wallet

#### 2. `no-tokens` - No Tokens Found
```tsx
<EmptyState
  variant="no-tokens"
  action={{
    label: "Buy Tokens",
    onClick: () => window.open('https://jupiter.ag', '_blank')
  }}
  secondaryAction={{
    label: "Learn More",
    onClick: handleLearnMore
  }}
/>
```
**Use when:** Connected wallet has no token balances

#### 3. `no-positions` - No DeFi Positions
```tsx
<EmptyState
  variant="no-positions"
  action={{
    label: "Explore Protocols",
    onClick: () => router.push('/protocols')
  }}
/>
```
**Use when:** User has no active DeFi positions

#### 4. `no-results` - No Search Results
```tsx
<EmptyState
  variant="no-results"
  description={`No results for "${searchQuery}"`}
  action={{
    label: "Clear Filters",
    onClick: handleClearFilters
  }}
/>
```
**Use when:** Search or filter returns no results

#### 5. `no-history` - No Transaction History
```tsx
<EmptyState
  variant="no-history"
  action={{
    label: "View Protocols",
    onClick: handleViewProtocols
  }}
/>
```
**Use when:** No transaction history exists

#### 6. `network-error` - Network Connection Error
```tsx
<EmptyState
  variant="network-error"
  action={{
    label: "Retry Connection",
    onClick: handleRetry
  }}
  showRetryAfter={30} // Auto-retry countdown
/>
```
**Use when:** Network connectivity issues occur

#### 7. `maintenance` - Maintenance Mode
```tsx
<EmptyState
  variant="maintenance"
  showRetryAfter={300} // 5 minute countdown
  action={{
    label: "Check Status",
    onClick: () => window.open('/status', '_blank')
  }}
/>
```
**Use when:** Service is temporarily unavailable

#### 8. `error` - Generic Error
```tsx
<EmptyState
  variant="error"
  description={errorMessage}
  action={{
    label: "Try Again",
    onClick: handleRetry
  }}
/>
```
**Use when:** Unexpected errors occur

#### 9. `loading` - Loading State
```tsx
<EmptyState
  variant="loading"
  description="Fetching data from protocols..."
  animated={true}
/>
```
**Use when:** Data is being loaded

#### 10. `custom` - Custom Empty State
```tsx
<EmptyState
  variant="custom"
  title="Custom Title"
  description="Custom description"
  icon={<CustomIcon />}
  action={{
    label: "Custom Action",
    onClick: handleCustomAction
  }}
/>
```
**Use when:** None of the predefined variants fit

### Props

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `string` | Predefined empty state type |
| `title` | `string` | Override default title |
| `description` | `string` | Override default description |
| `icon` | `ReactNode` | Custom icon component |
| `action` | `object` | Primary action button config |
| `secondaryAction` | `object` | Secondary action button config |
| `className` | `string` | Additional CSS classes |
| `animated` | `boolean` | Enable animations (default: true) |
| `showRetryAfter` | `number` | Seconds until retry (for error states) |

## Skeleton Loaders

### Purpose
Skeleton loaders provide visual feedback during data loading, preventing layout shift and improving perceived performance.

### Basic Components

#### 1. Basic Skeleton
```tsx
<Skeleton 
  className="w-32 h-10" 
  animation="shimmer"
/>
```

#### 2. Text Skeleton
```tsx
<SkeletonText 
  lines={3} 
  widths={["100%", "80%", "60%"]}
/>
```

#### 3. Card Skeleton
```tsx
<SkeletonCard 
  showAvatar={true}
  showTitle={true}
  showDescription={true}
  showActions={true}
/>
```

#### 4. Table Row Skeleton
```tsx
<SkeletonTableRow 
  columns={4}
  className="border-b"
/>
```

### Specialized Skeletons

#### Portfolio Metric Skeleton
```tsx
<SkeletonMetric 
  showIcon={true}
  showTrend={true}
/>
```

#### Token Row Skeleton
```tsx
<SkeletonTokenRow 
  showActions={true}
/>
```

#### Position Card Skeleton
```tsx
<SkeletonPositionCard />
```

#### Chart Skeleton
```tsx
<SkeletonChart 
  type="area" // or "bar", "pie", "line"
  height={300}
/>
```

### Stagger Container
Use for sequential loading animations:
```tsx
<SkeletonContainer staggerDelay={0.05}>
  <SkeletonCard />
  <SkeletonCard />
  <SkeletonCard />
</SkeletonContainer>
```

## Implementation Patterns

### Pattern 1: Conditional Rendering
```tsx
function TokenList() {
  const { data, loading, error } = useTokens();
  
  if (loading) return <TokenListSkeleton />;
  if (error) return <EmptyState variant="error" />;
  if (!data?.length) return <EmptyState variant="no-tokens" />;
  
  return <TokenListContent data={data} />;
}
```

### Pattern 2: Progressive Enhancement
```tsx
function PortfolioView() {
  const { wallet, tokens, positions, loading } = usePortfolio();
  
  if (!wallet.connected) {
    return <EmptyState variant="no-wallet" />;
  }
  
  return (
    <div>
      {loading ? (
        <PortfolioSkeleton />
      ) : (
        <>
          {tokens.length === 0 && <EmptyState variant="no-tokens" />}
          {positions.length === 0 && <EmptyState variant="no-positions" />}
          {tokens.length > 0 && <TokenList tokens={tokens} />}
          {positions.length > 0 && <PositionList positions={positions} />}
        </>
      )}
    </div>
  );
}
```

### Pattern 3: Inline Empty States
```tsx
function RecentActivity() {
  const { activities } = useActivities();
  
  return (
    <Card>
      <CardHeader>Recent Activity</CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyStateInline message="No recent activity" />
        ) : (
          <ActivityList activities={activities} />
        )}
      </CardContent>
    </Card>
  );
}
```

## Animation Guidelines

### Skeleton Animations
- **Shimmer**: Default, smooth gradient sweep
- **Pulse**: Opacity fade in/out
- **Wave**: Scale + opacity animation
- **None**: Static loading state

### Empty State Animations
- **Container**: Fade in with upward motion
- **Icon**: Scale in with floating animation
- **Actions**: Staggered appearance

## Best Practices

### Do's
✅ Match skeleton structure to actual content
✅ Provide clear, actionable CTAs in empty states
✅ Use appropriate animation speeds (not too fast/slow)
✅ Include helpful descriptions
✅ Test with real loading scenarios
✅ Consider mobile viewports
✅ Implement progressive loading
✅ Use staggered animations for lists

### Don'ts
❌ Don't show skeletons for < 300ms loads
❌ Don't use generic error messages
❌ Don't forget secondary actions when helpful
❌ Don't create layout shift when content loads
❌ Don't overuse animations
❌ Don't show multiple empty states simultaneously

## Accessibility

### Screen Reader Support
- All skeletons include `aria-busy="true"`
- Empty states have descriptive text
- Loading states announce progress
- Error states provide recovery options

### Keyboard Navigation
- All actions are keyboard accessible
- Focus management during state changes
- Clear focus indicators

### Reduced Motion
```tsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<EmptyState 
  animated={!prefersReducedMotion}
  // ...
/>
```

## Performance Considerations

### Lazy Loading
```tsx
const EmptyState = dynamic(
  () => import('@/components/ui/empty-state'),
  { ssr: false }
);
```

### Memoization
```tsx
const MemoizedSkeleton = React.memo(SkeletonCard);
```

### Debouncing
```tsx
const [showSkeleton, setShowSkeleton] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => {
    if (loading) setShowSkeleton(true);
  }, 300);
  
  return () => clearTimeout(timer);
}, [loading]);
```

## Testing

### Unit Tests
```tsx
describe('EmptyState', () => {
  it('renders correct variant', () => {
    render(<EmptyState variant="no-wallet" />);
    expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
  });
  
  it('triggers action callback', () => {
    const handleClick = jest.fn();
    render(
      <EmptyState 
        variant="no-wallet"
        action={{ label: 'Connect', onClick: handleClick }}
      />
    );
    fireEvent.click(screen.getByText('Connect'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### E2E Tests
```typescript
test('shows empty state when no tokens', async ({ page }) => {
  await page.goto('/portfolio');
  await expect(page.locator('[data-testid="empty-state-no-tokens"]')).toBeVisible();
  await page.click('text=Buy Tokens');
  await expect(page).toHaveURL(/jupiter.ag/);
});
```

## Examples

### Complete Portfolio View
```tsx
function Portfolio() {
  const { publicKey } = useWallet();
  const { data, loading, error } = usePortfolioData(publicKey);
  
  // Not connected
  if (!publicKey) {
    return <EmptyState variant="no-wallet" />;
  }
  
  // Loading
  if (loading) {
    return <PortfolioSkeleton />;
  }
  
  // Error
  if (error) {
    return (
      <EmptyState 
        variant="error"
        description={error.message}
        action={{
          label: "Retry",
          onClick: () => window.location.reload()
        }}
      />
    );
  }
  
  // No data
  if (!data?.tokens?.length && !data?.positions?.length) {
    return <EmptyState variant="no-tokens" />;
  }
  
  // Has data
  return <PortfolioContent data={data} />;
}
```

## Customization

### Custom Theme
```css
:root {
  --skeleton-base: #1C1D26;
  --skeleton-highlight: #242530;
  --empty-state-icon: #9945FF;
}
```

### Custom Animations
```tsx
const customVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 200 }
  }
};

<motion.div variants={customVariants}>
  <EmptyState />
</motion.div>
```

## Troubleshooting

### Common Issues

1. **Layout Shift**: Ensure skeleton dimensions match loaded content
2. **Flash of Content**: Add minimum loading time for skeletons
3. **Animation Jank**: Use GPU-accelerated properties only
4. **Accessibility**: Test with screen readers and keyboard

## Related Components
- `/components/ui/empty-state.tsx` - Main empty state component
- `/components/ui/skeleton.tsx` - Skeleton loader components
- `/components/ui/empty-state-examples.tsx` - Usage examples
- `/app/components/empty-states/page.tsx` - Interactive showcase

## Support
For questions or issues, refer to the component showcase at `/components/empty-states` or consult the design system documentation.