# E2E Testing Strategy for SolFolio

## Overview

This document outlines our end-to-end testing strategy for SolFolio, with a focus on achieving realistic user behavior testing while maintaining stable and deterministic test results. Our primary goal is to test actual wallet interactions as users would experience them, not just mock implementations.

## Testing Philosophy

### Core Principles
1. **Realism First**: Test actual wallet flows whenever possible
2. **Deterministic Results**: Use test modes and controlled environments
3. **Progressive Enhancement**: Start with basic flows, add complexity gradually
4. **Fail Fast**: Quick feedback on critical user paths
5. **Maintainability**: Tests should be resilient to UI changes

### Testing Pyramid for Web3
```
         /\
        /  \  E2E with Real Wallets (10%)
       /    \  - Critical user journeys
      /______\ - Release validation
     /        \
    /  E2E     \ E2E with Test Mode (30%)
   /  Mocked    \ - Most wallet interactions
  /______________\ - Feature testing
 /                \
/  Integration     \ Integration Tests (40%)
/__________________\ - API, Components
       Unit Tests (20%)
       - Utils, Pure functions
```

## Wallet Testing Approaches

### 1. Phantom Test Mode (Preferred)
Phantom provides a test environment that allows automated testing without manual approval.

**How it works:**
- Phantom can be configured with a test RPC endpoint
- Pre-funded test wallets with known private keys
- Auto-approval mode for test networks
- Deterministic transaction results

**Setup Requirements:**
```javascript
// Environment variables
PHANTOM_TEST_PRIVATE_KEY="[test-private-key]"
PHANTOM_TEST_RPC="https://api.devnet.solana.com"
PHANTOM_AUTO_APPROVE="true"
```

**Pros:**
- Real Phantom extension behavior
- Tests actual connection flow
- Validates Phantom-specific features
- No manual intervention needed

**Cons:**
- Requires Phantom installed
- May break with Phantom updates
- Slower than pure mocks

### 2. Browser Extension Automation (Fallback)
For wallets without test modes, we automate the actual extension.

**Approach:**
- Pre-configure browser profile with wallet extension
- Import test seed phrase on setup
- Use Playwright to interact with extension popups
- Handle approval dialogs programmatically

**Implementation Steps:**
1. Create persistent browser context with extension
2. Import wallet using seed phrase via automation
3. Navigate to app and trigger wallet connection
4. Detect and interact with extension popup
5. Verify connection success

### 3. Hybrid Mock Approach (Development)
For rapid development and CI environments without extensions.

**When to use:**
- Local development testing
- CI pipelines without extension support
- Testing error scenarios
- Load testing

## Implementation Strategy

### Phase 1: Foundation (Current)
```typescript
// e2e/wallet-connection.spec.ts
describe('Basic Wallet UI', () => {
  test('Connect button visible')
  test('Modal opens on click')
  test('Wallet options displayed')
})
```

### Phase 2: Test Mode Integration
```typescript
// e2e/wallet-test-mode.spec.ts
describe('Phantom Test Mode', () => {
  beforeAll(async () => {
    await setupPhantomTestMode()
  })
  
  test('Connect with auto-approval')
  test('Display connected address')
  test('Persist connection on refresh')
  test('Sign message')
  test('Disconnect wallet')
})
```

### Phase 3: Real Wallet Flows
```typescript
// e2e/wallet-real-flow.spec.ts
describe('Complete Wallet Journey', () => {
  test('New user onboarding')
  test('Connect → View Portfolio → Refresh')
  test('Multiple wallet switching')
  test('Error recovery flows')
})
```

## Test Wallet Configuration

### Deterministic Test Wallets
We maintain a set of test wallets with known states:

| Wallet ID | Purpose | Address | Characteristics |
|-----------|---------|---------|-----------------|
| TEST_WALLET_EMPTY | Empty wallet testing | `11111...empty` | No SOL, no tokens |
| TEST_WALLET_BASIC | Basic user | `11111...basic` | 10 SOL, no tokens |
| TEST_WALLET_TOKENS | Token holder | `11111...tokens` | 5 SOL, 10+ tokens |
| TEST_WALLET_DEFI | DeFi user | `11111...defi` | Staking positions |
| TEST_WALLET_WHALE | High value | `11111...whale` | Large balances |

### Seed Phrases (Test Network Only)
```bash
# .env.e2e.local (NEVER commit real seed phrases)
TEST_SEED_EMPTY="test test test test test test test test test test test junk"
TEST_SEED_BASIC="basic basic basic basic basic basic basic basic basic basic basic junk"
```

## Playwright Configuration

### Browser Context Setup
```typescript
// e2e/fixtures/wallet-fixture.ts
import { test as base, chromium } from '@playwright/test';
import path from 'path';

export const test = base.extend({
  context: async ({}, use) => {
    // Path to extension (Phantom)
    const pathToExtension = path.join(__dirname, '../extensions/phantom');
    
    // Launch browser with extension
    const context = await chromium.launchPersistentContext('', {
      headless: false, // Extensions require headed mode
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--no-sandbox'
      ],
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
    });

    // Wait for extension to load
    await context.waitForEvent('page');
    
    await use(context);
    await context.close();
  },
  
  extensionId: async ({ context }, use) => {
    // Get extension ID dynamically
    const extensions = await context.pages();
    const extensionPage = extensions.find(page => 
      page.url().startsWith('chrome-extension://')
    );
    const extensionId = extensionPage?.url().split('/')[2];
    await use(extensionId);
  }
});
```

### Wallet Helper Functions
```typescript
// e2e/helpers/wallet-helpers.ts

export async function setupPhantomTestMode(page: Page) {
  // Inject test configuration
  await page.addInitScript(() => {
    window.localStorage.setItem('phantom_test_mode', 'true');
    window.localStorage.setItem('phantom_auto_approve', 'true');
    window.localStorage.setItem('phantom_network', 'devnet');
  });
}

export async function connectWalletWithExtension(page: Page, extensionId: string) {
  // Click connect button
  await page.getByRole('button', { name: /connect wallet/i }).click();
  
  // Click Phantom option
  await page.getByText('Phantom').click();
  
  // Handle extension popup
  const popup = await page.context().waitForEvent('page', {
    predicate: p => p.url().includes(extensionId)
  });
  
  // Auto-approve in test mode or click approve
  if (process.env.PHANTOM_AUTO_APPROVE !== 'true') {
    await popup.getByRole('button', { name: /connect/i }).click();
  }
  
  // Wait for connection
  await page.waitForSelector('[data-testid="wallet-connected"]');
  
  return popup;
}

export async function importWalletSeed(extensionPage: Page, seedPhrase: string) {
  // Navigate to import screen
  await extensionPage.goto('chrome-extension://[id]/onboarding.html');
  await extensionPage.getByText('Import Wallet').click();
  
  // Enter seed phrase
  const words = seedPhrase.split(' ');
  for (let i = 0; i < words.length; i++) {
    await extensionPage.fill(`input[name="word-${i}"]`, words[i]);
  }
  
  // Set password
  await extensionPage.fill('input[name="password"]', 'TestPassword123!');
  await extensionPage.fill('input[name="confirm-password"]', 'TestPassword123!');
  
  // Complete import
  await extensionPage.getByRole('button', { name: /import/i }).click();
}
```

## Test Scenarios

### Critical Path Tests (Must Pass)
These run on every commit with test mode wallets:

1. **First Time User Flow**
   - Land on homepage → Connect wallet → View empty portfolio → See onboarding

2. **Returning User Flow**
   - Visit with connected wallet → Auto-load portfolio → Refresh data

3. **Portfolio Viewing**
   - Connect wallet → Load balances → View positions → Sort/filter tokens

4. **Wallet Switching**
   - Connect Wallet A → View data → Switch to Wallet B → Verify data changes

### Extended Test Suite
These run nightly with real wallet extensions:

1. **Multi-Wallet Support**
   - Test Phantom → Solflare → Ledger connections
   - Verify each wallet's unique UI elements

2. **Error Recovery**
   - Network timeout during connection
   - Wallet rejection handling
   - Invalid RPC responses

3. **Session Persistence**
   - Connect → Close browser → Reopen → Still connected
   - Clear site data → Requires reconnection

## Running E2E Tests

### Local Development
```bash
# Install dependencies
pnpm install
npx playwright install chromium

# Download Phantom extension
pnpm run e2e:setup-extensions

# Run with test mode (fast, stable)
pnpm run test:e2e:test-mode

# Run with real extension (slower, realistic)
pnpm run test:e2e:extension

# Run specific test file
pnpm run test:e2e wallet-connection.spec.ts

# Debug mode with browser UI
pnpm run test:e2e:debug
```

### CI/CD Pipeline
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test-mode:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: npx playwright install chromium
      - run: pnpm run test:e2e:test-mode
      
  extension-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' # Only on main
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm run e2e:setup-extensions
      - run: pnpm run test:e2e:extension
```

## Test Data Management

### Mock API Responses
```typescript
// e2e/mocks/api-mocks.ts
export const mockBalanceResponse = {
  wallet: TEST_WALLET_TOKENS,
  tokens: [
    { mint: 'SOL', balance: 5.5, valueUSD: 275 },
    { mint: 'USDC', balance: 100, valueUSD: 100 }
  ],
  totalValueUSD: 375
};

export async function mockAPIEndpoints(page: Page) {
  await page.route('**/api/wallet/*/balances', route => {
    route.fulfill({ json: mockBalanceResponse });
  });
}
```

### Database Seeding
For integration tests that need consistent backend state:

```typescript
// e2e/setup/seed-database.ts
export async function seedTestData() {
  // Connect to test database
  const db = await getTestDatabase();
  
  // Clear existing data
  await db.clear();
  
  // Insert test wallet data
  await db.wallets.insert(TEST_WALLETS);
  await db.positions.insert(TEST_POSITIONS);
}
```

## Debugging E2E Tests

### Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Extension not loading | Wrong path or permissions | Verify extension path, run headed mode |
| Popup not detected | Timing issue | Add explicit waits, increase timeout |
| Auto-approve not working | Test mode not enabled | Check environment variables |
| Flaky tests | Network delays | Use test mode, add retries |
| Different CI results | Browser differences | Use same browser version |

### Debug Techniques
```typescript
// Add screenshots on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    await page.screenshot({ 
      path: `screenshots/${testInfo.title}.png`,
      fullPage: true 
    });
  }
});

// Verbose logging
test('debug wallet connection', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('PAGE:', msg.text()));
  
  // Log network requests
  page.on('request', req => console.log('REQ:', req.url()));
  
  // Add debug breakpoint
  await page.pause(); // Opens Playwright Inspector
});
```

## Best Practices

### DO's
✅ Use test mode for most tests (stable, fast)  
✅ Test real extensions for release validation  
✅ Maintain separate test wallets per scenario  
✅ Add explicit waits for wallet operations  
✅ Screenshot on failures for debugging  
✅ Run tests in parallel when possible  
✅ Use data-testid attributes for selectors  

### DON'Ts
❌ Don't use production wallets in tests  
❌ Don't hardcode delays (use proper waits)  
❌ Don't skip error scenarios  
❌ Don't mix test and production data  
❌ Don't ignore flaky tests (fix them)  
❌ Don't test implementation details  
❌ Don't rely on external services unnecessarily  

## Maintenance

### Monthly Tasks
- Update Phantom extension version
- Verify test wallets still valid
- Review and fix flaky tests
- Update mock data to match API changes

### Quarterly Tasks
- Audit test coverage
- Performance benchmark tests
- Update browser versions
- Review CI pipeline efficiency

## Future Enhancements

### Phase 4: Advanced Testing
- Transaction simulation tests
- Multi-signature wallet testing
- Hardware wallet integration tests
- Load testing with multiple wallets

### Phase 5: Cross-Browser
- Safari with Phantom mobile extension
- Firefox with different wallets
- Mobile browser testing with WalletConnect

### Phase 6: Security Testing
- XSS attack prevention
- Wallet spoofing attempts
- Replay attack prevention
- Rate limiting validation

## Resources

### Documentation
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Phantom Developer Docs](https://docs.phantom.app)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

### Example Repositories
- [Solana dApp Scaffold E2E](https://github.com/solana-labs/dapp-scaffold)
- [Phantom Test Examples](https://github.com/phantom-labs/sandbox)

### Tools
- [Playwright Test Generator](https://playwright.dev/docs/codegen)
- [Chrome Extension Source Viewer](https://chrome.google.com/webstore/detail/chrome-extension-source-v/jifpbeccnghkjeaalbbjmodiffmgedin)
- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)