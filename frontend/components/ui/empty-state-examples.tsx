/**
 * Empty State Usage Examples
 * 
 * This file provides comprehensive examples of how to use the EmptyState component
 * in different scenarios throughout the SolFolio application.
 */

import { EmptyState } from './empty-state';

// Example 1: No Wallet Connected (Landing state)
export function NoWalletExample() {
  return (
    <EmptyState
      variant="no-wallet"
      action={{
        label: "Connect Wallet",
        onClick: () => {
          // Trigger wallet connect modal
          const connectButton = document.querySelector('[data-testid="wallet-connect-button"]');
          if (connectButton) (connectButton as HTMLElement).click();
        },
      }}
    />
  );
}

// Example 2: No Tokens Found (Empty wallet)
export function NoTokensExample() {
  return (
    <EmptyState
      variant="no-tokens"
      action={{
        label: "Get Started",
        onClick: () => window.open('https://jupiter.ag', '_blank'),
      }}
      secondaryAction={{
        label: "Learn More",
        onClick: () => window.open('https://docs.solana.com', '_blank'),
      }}
    />
  );
}

// Example 3: No DeFi Positions (Onboarding)
export function NoPositionsExample() {
  return (
    <EmptyState
      variant="no-positions"
      action={{
        label: "Explore Protocols",
        onClick: () => console.log('Navigate to protocols page'),
      }}
      secondaryAction={{
        label: "View Tutorials",
        onClick: () => console.log('Open tutorials'),
      }}
    />
  );
}

// Example 4: Search No Results (Filtered empty)
export function NoResultsExample({ 
  searchQuery,
  onClearFilters
}: { 
  searchQuery?: string; 
  onClearFilters: () => void;
}) {
  return (
    <EmptyState
      variant="no-results"
      description={
        searchQuery 
          ? `No results found for "${searchQuery}". Try adjusting your search terms or filters.`
          : "No results match your current filters. Try broadening your search criteria."
      }
      action={{
        label: "Clear Filters",
        onClick: onClearFilters,
      }}
    />
  );
}

// Example 5: Transaction History Empty
export function NoHistoryExample() {
  return (
    <EmptyState
      variant="no-history"
      title="No Transaction History"
      description="Your transaction history is empty. Start interacting with DeFi protocols to see your transactions here."
      action={{
        label: "Explore Protocols",
        onClick: () => console.log('Navigate to protocols'),
      }}
    />
  );
}

// Example 6: Network Connection Error
export function NetworkErrorExample({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      variant="network-error"
      action={{
        label: "Retry Connection",
        onClick: onRetry,
      }}
      secondaryAction={{
        label: "Switch RPC",
        onClick: () => console.log('Open RPC settings'),
      }}
      showRetryAfter={30} // Auto-retry in 30 seconds
    />
  );
}

// Example 7: Maintenance Mode
export function MaintenanceExample() {
  return (
    <EmptyState
      variant="maintenance"
      action={{
        label: "Check Status",
        onClick: () => window.open('https://status.solfolio.app', '_blank'),
      }}
      showRetryAfter={300} // Show countdown for 5 minutes
    />
  );
}

// Example 8: Generic Error State
export function GenericErrorExample({ 
  error, 
  onRetry 
}: { 
  error?: string; 
  onRetry: () => void; 
}) {
  return (
    <EmptyState
      variant="error"
      description={
        error || 
        "An unexpected error occurred while loading your data. Please try again."
      }
      action={{
        label: "Try Again",
        onClick: onRetry,
      }}
      secondaryAction={{
        label: "Report Issue",
        onClick: () => console.log('Open support form'),
      }}
    />
  );
}

// Example 9: Loading State (with progress)
export function LoadingExample() {
  return (
    <EmptyState
      variant="loading"
      title="Loading Your Portfolio"
      description="Fetching positions from Marinade, Kamino, Orca, and other protocols..."
      animated={true}
    />
  );
}

// Example 10: Custom Empty State
export function CustomExample({
  title,
  description,
  icon,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <EmptyState
      variant="custom"
      title={title}
      description={description}
      icon={icon}
      action={actionLabel && onAction ? {
        label: actionLabel,
        onClick: onAction,
      } : undefined}
      animated={true}
    />
  );
}

// Example 11: Inline Usage (for compact spaces)
import { EmptyStateInline } from './empty-state';

export function InlineExample() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Activity</h3>
      
      {/* Use inline empty state for compact spaces */}
      <EmptyStateInline 
        message="No recent activity"
        className="py-12"
      />
    </div>
  );
}

// Example 12: Error Boundary Integration
export function ErrorBoundaryExample({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void; 
}) {
  return (
    <EmptyState
      variant="error"
      title="Something went wrong"
      description={
        process.env.NODE_ENV === 'development' 
          ? error.message 
          : "An unexpected error occurred. Please refresh the page and try again."
      }
      action={{
        label: "Try Again",
        onClick: resetError,
      }}
      secondaryAction={{
        label: "Refresh Page",
        onClick: () => window.location.reload(),
      }}
    />
  );
}

// Example 13: Conditional Empty States
export function ConditionalEmptyState({
  isConnected,
  hasTokens,
  hasPositions,
  isLoading,
  error,
  onConnect,
  onRetry
}: {
  isConnected: boolean;
  hasTokens: boolean;
  hasPositions: boolean;
  isLoading: boolean;
  error?: string;
  onConnect: () => void;
  onRetry: () => void;
}) {
  // Show loading state
  if (isLoading) {
    return <LoadingExample />;
  }

  // Show error state
  if (error) {
    return <GenericErrorExample error={error} onRetry={onRetry} />;
  }

  // Show wallet connection state
  if (!isConnected) {
    return (
      <EmptyState
        variant="no-wallet"
        action={{
          label: "Connect Wallet",
          onClick: onConnect,
        }}
      />
    );
  }

  // Show no tokens state
  if (!hasTokens) {
    return <NoTokensExample />;
  }

  // Show no positions state
  if (!hasPositions) {
    return <NoPositionsExample />;
  }

  // Default fallback
  return null;
}

/**
 * Usage Guidelines:
 * 
 * 1. Always provide meaningful actions that help users progress
 * 2. Use appropriate variants for different scenarios
 * 3. Include secondary actions when helpful
 * 4. Keep descriptions concise but informative
 * 5. Test with real data scenarios
 * 6. Ensure animations are smooth and purposeful
 * 7. Consider mobile viewport when designing actions
 * 8. Use showRetryAfter for temporary error states
 * 9. Provide clear next steps for users
 * 10. Test accessibility with screen readers
 */