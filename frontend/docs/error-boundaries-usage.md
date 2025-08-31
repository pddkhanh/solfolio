# Error Boundaries & Page Transitions Usage Guide

## Overview
This guide documents the comprehensive error handling and page transition system implemented for SolFolio, including error boundaries, error states, and smooth page transitions.

## Error Boundary Components

### 1. Global Error Boundary
Wraps the entire application to catch unhandled errors.

**Location**: Already integrated in `app/layout.tsx`

```tsx
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';

// Automatically wraps the entire app in layout.tsx
<GlobalErrorBoundary>
  {/* App content */}
</GlobalErrorBoundary>
```

### 2. Component Error Boundary
For wrapping individual components that might throw errors.

```tsx
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

<ErrorBoundary
  level="component"
  showDetails={process.env.NODE_ENV === 'development'}
  onError={(error, errorInfo) => {
    // Custom error handling
    console.error('Component error:', error);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### 3. Section-Specific Error Boundaries
Pre-configured boundaries for different sections of the app.

```tsx
import {
  WalletErrorBoundary,
  PortfolioErrorBoundary,
  PositionsErrorBoundary,
  ChartErrorBoundary,
} from '@/components/error/SectionErrorBoundary';

// Wallet section
<WalletErrorBoundary>
  <WalletConnection />
</WalletErrorBoundary>

// Portfolio section
<PortfolioErrorBoundary>
  <PortfolioOverview />
</PortfolioErrorBoundary>

// DeFi positions
<PositionsErrorBoundary>
  <PositionsList />
</PositionsErrorBoundary>

// Charts
<ChartErrorBoundary>
  <PortfolioPieChart />
</ChartErrorBoundary>
```

### 4. HOC Pattern
Wrap components using the higher-order component pattern.

```tsx
import { withErrorBoundary } from '@/components/error/ErrorBoundary';

const SafeComponent = withErrorBoundary(YourComponent, {
  level: 'component',
  showDetails: true,
});

// Use it like a normal component
<SafeComponent />
```

## Error State Components

### 1. Generic Error State
Flexible error state component for various scenarios.

```tsx
import { ErrorState } from '@/components/error/ErrorState';

<ErrorState
  type="network" // 'network' | 'server' | 'permission' | 'not-found' | 'timeout' | 'generic'
  title="Custom Error Title" // Optional
  message="Custom error message" // Optional
  onRetry={() => handleRetry()}
  onGoBack={() => navigate(-1)}
  onGoHome={() => navigate('/')}
  showDetails={true}
  details="Error stack trace or details"
  compact={false} // Use compact mode for smaller spaces
/>
```

### 2. Pre-configured Error States

```tsx
import {
  NetworkErrorState,
  ServerErrorState,
  PermissionErrorState,
  NotFoundErrorState,
} from '@/components/error/ErrorState';

// Network error
<NetworkErrorState onRetry={() => refetch()} />

// Server error
<ServerErrorState onRetry={() => refetch()} />

// Permission denied
<PermissionErrorState 
  onGoBack={() => navigate(-1)}
  onGoHome={() => navigate('/')}
/>

// 404 Not Found
<NotFoundErrorState onGoHome={() => navigate('/')} />
```

### 3. Inline Error Messages

```tsx
import { InlineError } from '@/components/error/ErrorState';

<InlineError
  message="Failed to fetch wallet balance"
  onRetry={() => refetch()}
  className="mb-4"
/>
```

### 4. Error Banner
Global error banner for app-wide notifications.

```tsx
import { ErrorBanner } from '@/components/error/ErrorState';

<ErrorBanner
  message="Network connection lost. Some features may be unavailable."
  onDismiss={() => setShowBanner(false)}
  onRetry={() => reconnect()}
/>
```

## Page Transitions

### 1. Page Transition Wrapper
Already integrated in `app/layout.tsx` for automatic page transitions.

```tsx
import { PageTransition } from '@/components/layout/PageTransition';

// Automatically applied to all pages
<PageTransition>
  {children}
</PageTransition>
```

### 2. Section Transitions
For animating sections within a page.

```tsx
import { SectionTransition } from '@/components/layout/PageTransition';

<SectionTransition delay={0.1}>
  <section>
    {/* Section content with staggered child animations */}
  </section>
</SectionTransition>
```

### 3. Individual Transition Components

```tsx
import {
  FadeTransition,
  SlideTransition,
  ScaleTransition,
} from '@/components/layout/PageTransition';

// Fade transition
<FadeTransition duration={0.3}>
  <Component />
</FadeTransition>

// Slide transition
<SlideTransition direction="up" distance={30}>
  <Component />
</SlideTransition>

// Scale transition
<ScaleTransition scale={0.95}>
  <Component />
</ScaleTransition>
```

## Error Logging

The error logging system automatically captures and logs errors.

```tsx
import { logError, logWarning, logInfo } from '@/lib/error-logger';

// Log an error
try {
  // risky operation
} catch (error) {
  logError(error, {
    userId: user.id,
    walletAddress: wallet.publicKey.toString(),
    action: 'fetch_portfolio',
    metadata: { additional: 'data' }
  });
}

// Log a warning
logWarning('API rate limit approaching', {
  action: 'api_call',
  metadata: { remaining: 10 }
});

// Log info
logInfo('User connected wallet', {
  walletAddress: wallet.publicKey.toString()
});
```

## Best Practices

### 1. Error Boundary Placement
- Use `GlobalErrorBoundary` at the app level (already in place)
- Use `SectionErrorBoundary` for major UI sections
- Use component-level boundaries for risky operations
- Don't overuse - not every component needs a boundary

### 2. Error Recovery
- Always provide retry mechanisms where appropriate
- Include user-friendly error messages
- Offer alternative actions (go back, go home)
- Log errors for debugging and monitoring

### 3. Development vs Production
```tsx
// Show detailed errors only in development
showDetails={process.env.NODE_ENV === 'development'}

// Different error handling for environments
onError={(error, errorInfo) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service
    sendToSentry(error, errorInfo);
  } else {
    // Log to console in development
    console.error(error, errorInfo);
  }
}}
```

### 4. Animation Performance
- Page transitions respect `prefers-reduced-motion`
- Use CSS transforms for optimal performance
- Keep animations under 60 FPS target
- Test on lower-end devices

### 5. Testing Error Boundaries
```tsx
// Component that throws an error for testing
function TestError() {
  throw new Error('Test error');
  return null;
}

// Use in development to test error boundaries
{process.env.NODE_ENV === 'development' && showTestError && <TestError />}
```

## Demo Page

Visit `/demo/error-boundary` to see all error boundary features in action:
- Component error boundaries
- Section error boundaries
- Error state components
- Page transition effects
- Error recovery mechanisms

## Integration Checklist

- [x] Global error boundary in `app/layout.tsx`
- [x] Page transitions in `app/layout.tsx`
- [x] Error logging service configured
- [x] Next.js error.tsx and global-error.tsx files
- [ ] Sentry or similar error tracking (production)
- [ ] Custom error pages (404, 500)
- [ ] E2E tests for error scenarios

## TypeScript Types

```tsx
interface ErrorContext {
  userId?: string;
  walletAddress?: string;
  action?: string;
  metadata?: Record<string, any>;
}

type ErrorType = 
  | 'network' 
  | 'server' 
  | 'permission' 
  | 'not-found' 
  | 'timeout' 
  | 'generic';

type ErrorBoundaryLevel = 'page' | 'section' | 'component';
```

## Troubleshooting

### Error boundary not catching errors
- Ensure the error is thrown during render, not in event handlers
- For async errors, use try-catch and state management
- Check that the error boundary is properly wrapping the component

### Page transitions not working
- Verify Framer Motion is installed
- Check that PageTransition wraps the content in layout.tsx
- Ensure pages have unique keys (pathname)

### Error logging not working
- Check network tab for API calls to `/api/errors`
- Verify error logger is initialized
- Check console for development logs

## Resources

- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)