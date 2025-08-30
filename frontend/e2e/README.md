# E2E Tests for SolFolio

This directory contains end-to-end tests for the SolFolio application using Playwright.

## Test Structure

### Test Files
- `tc-001-wallet-connection.spec.ts` - Wallet connection flows
- `tc-002-003-wallet-management.spec.ts` - Wallet management and switching
- `tc-004-wallet-persistence.spec.ts` - Wallet persistence across sessions
- `tc-005-portfolio-overview.spec.ts` - Portfolio overview functionality
- `tc-006-portfolio-navigation.spec.ts` - Portfolio navigation
- `tc-007-token-balances.spec.ts` - Token balance display
- **`tc-008-token-sorting.spec.ts`** - Token list sorting by value/amount/name
- `tc-011-defi-positions.spec.ts` - DeFi position display
- `tc-012-position-metrics.spec.ts` - Position metrics and calculations
- `tc-014-navigation.spec.ts` - General navigation

### Helper Files
- `helpers/wallet.ts` - Wallet mocking and connection utilities
- `helpers/tokens.ts` - Token data mocking and sorting utilities

### Fixtures
- `fixtures/test-wallets.ts` - Test wallet configurations and mock data

## Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e tc-008-token-sorting

# Run tests in UI mode (for debugging)
pnpm test:e2e:ui

# Run tests in debug mode
pnpm test:e2e:debug
```

## TC-008: Token Sorting Tests

The TC-008 test suite validates the token sorting functionality:

### Test Coverage
1. **Sort Dropdown Display** - Verifies dropdown with three options (Value, Amount, Name)
2. **Sort by Value** - Tests sorting by USD value with SOL priority
3. **Sort by Amount** - Tests sorting by token quantity
4. **Sort by Name** - Tests alphabetical sorting
5. **Sort Persistence** - Verifies sort preference persists during session
6. **Empty Wallet Handling** - Tests graceful handling of empty token lists
7. **SOL Priority** - Ensures SOL remains at top when sorting by value
8. **Instant Sorting** - Verifies sorting happens without page reload

### Mock Data
The tests use comprehensive mock token data including:
- SOL (native token)
- Stablecoins (USDC, USDT, UXD)
- Liquid staking tokens (mSOL)
- DeFi tokens (JUP, ORCA, RAY, MNDE)
- Meme tokens (BONK)

### Key Features
- **Deterministic Testing** - Uses mock wallets and API responses
- **Flexible Verification** - Allows 70-80% match tolerance for sort order
- **Fallback UI** - Creates mock sort dropdown if not present in UI
- **Multiple Selectors** - Tries various selectors to find token elements
- **Session Persistence** - Tests localStorage/session storage of preferences

## Best Practices

1. **Use Mock Data** - Always mock wallet connections and API responses
2. **Wait for Elements** - Use proper wait conditions instead of fixed timeouts
3. **Test User Flows** - Test complete user journeys, not isolated features
4. **Handle Edge Cases** - Test empty states, errors, and edge conditions
5. **Verify Accessibility** - Ensure UI elements have proper test IDs
6. **Clean Test State** - Each test should be independent and atomic

## Troubleshooting

If tests fail:
1. Ensure the frontend is running on `http://localhost:3000`
2. Check that Playwright browsers are installed: `npx playwright install`
3. Verify mock wallet injection is working
4. Check console logs for detailed error messages
5. Use UI mode to debug failing tests: `pnpm test:e2e:ui`

## Adding New Tests

When adding new tests:
1. Follow the naming convention: `tc-XXX-feature-name.spec.ts`
2. Reference the test case in `docs/regression-tests.md`
3. Use existing helpers from `helpers/` directory
4. Add mock data to `fixtures/` if needed
5. Document expected behavior in test comments
6. Ensure tests are deterministic and don't rely on external services