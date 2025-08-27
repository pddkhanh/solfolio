# TC-001: Connect Wallet via Modal - E2E Test Summary

## Overview
This document summarizes the E2E test implementation for **TC-001: Connect Wallet via Modal** from the SolFolio regression test suite.

## Test Implementation
- **Test Files**: 
  - `frontend/e2e/tc-001-connect-wallet.spec.ts` - Main test with mocks
  - `frontend/e2e/tc-001-wallet-real.spec.ts` - Real connection test (detects bugs)
- **Test Cases**: 2 comprehensive tests + 1 bug detection test
- **Execution Time**: ~5 seconds
- **Browser**: Chromium (can be extended to Firefox, Safari)

## Test Coverage

### ✅ Test 1: Complete Wallet Modal Interactions and Display
Covers the main user flow for opening and interacting with the wallet connection modal:
- Verify Connect Wallet button is visible when not connected
- Click button to open wallet modal
- Verify modal appears with smooth animation (opacity: 1)
- Verify all 4 supported wallets are displayed:
  - Phantom
  - Solflare
  - Ledger
  - Torus
- Verify close button (X) is visible
- Verify wallet options are clickable

### ✅ Test 2: Modal Interaction Behaviors
Tests all ways to close the modal:
- Click outside modal (on overlay) → modal closes
- Click X button → modal closes
- Press ESC key → modal closes


## Running the Tests

### 🎬 Visual Mode (See Browser Actions)

#### Option 1: UI Mode (Recommended for Debugging)
```bash
cd frontend
pnpm test:e2e:ui tc-001-connect-wallet.spec.ts
```
**Features:**
- Visual test runner with timeline
- See each action as it happens
- Time travel debugging
- Watch mode for development
- Inspect DOM at each step
- View network requests and console logs

#### Option 2: Headed Mode (See Live Browser)
```bash
cd frontend
# Run with visible browser
pnpm playwright test tc-001-connect-wallet.spec.ts --headed
```

#### Option 3: Debug Mode (Step-by-Step Interactive)
```bash
cd frontend
# Opens Playwright Inspector for step-by-step debugging
pnpm playwright test tc-001-connect-wallet.spec.ts --debug
```
**Features:**
- ⏸️ Pause at any point
- ⏭️ Step through actions one by one
- 🔍 Inspect page state
- 📝 Live edit selectors
- 🎯 Pick selectors from page
- Press "Continue" to go to next action

#### Option 4: Trace Viewer (Post-Execution Analysis)
```bash
# Run test and record trace
pnpm playwright test tc-001-connect-wallet.spec.ts --trace on

# Open trace viewer to analyze
pnpm playwright show-trace
```
**Features:**
- Timeline of all actions
- Screenshots before/after each action
- Network activity
- Console logs
- Full DOM snapshots

### 🤖 Automated Mode (CI/CD)

#### Headless Mode (Default)
```bash
cd frontend
# Run in headless mode (no visible browser)
pnpm test:e2e tc-001-connect-wallet.spec.ts

# Or run all TC-001 tests
pnpm test:e2e --grep "TC-001"
```

#### Generate HTML Report
```bash
# Run tests and generate report
pnpm playwright test tc-001-connect-wallet.spec.ts --reporter=html

# Open the report
pnpm playwright show-report
```

### 🛠️ Development Commands

#### Watch Mode (Auto-run on File Changes)
```bash
# Watch specific test file
pnpm playwright test tc-001-connect-wallet.spec.ts --watch
```

#### Run Specific Test
```bash
# Run only one test by name
pnpm playwright test -g "should complete wallet modal interactions"
```

#### Different Browsers
```bash
# Firefox
pnpm playwright test tc-001-connect-wallet.spec.ts --project=firefox

# Safari (WebKit)
pnpm playwright test tc-001-connect-wallet.spec.ts --project=webkit

# All browsers
pnpm playwright test tc-001-connect-wallet.spec.ts --project=chromium --project=firefox --project=webkit
```

## Debug Options

### Speed Control in Debug Mode
When using debug mode (`--debug`), you can control test execution speed:
- Use the "Step over" button to go action by action
- Use "Continue" to run until next breakpoint
- Add `await page.pause()` in your test to create custom breakpoints

## Test Helpers & Fixtures

### Helper Functions (`e2e/helpers/wallet-helpers.ts`)
- `mockPhantomWallet()` - Injects mock Phantom wallet into browser
- `waitForWalletModal()` - Waits for modal visibility state
- `getWalletAddress()` - Gets connected wallet address from UI
- `isWalletConnected()` - Checks if wallet is connected

### Test Wallets (`e2e/fixtures/test-wallets.ts`)
```typescript
TEST_WALLET_EMPTY  = '11111111111111111111111111111111empty'
TEST_WALLET_BASIC  = '22222222222222222222222222222basic'
TEST_WALLET_TOKENS = '33333333333333333333333333333token'
TEST_WALLET_DEFI   = '44444444444444444444444444444defi4'
TEST_WALLET_WHALE  = '55555555555555555555555555555whale'
```

## Debugging Tips

### 1. Screenshot on Failure
Tests automatically capture screenshots on failure. Find them in:
```
frontend/test-results/tc-001-connect-wallet-*/test-failed-*.png
```

### 2. Video Recording
Enable video recording for all tests:
```bash
pnpm playwright test tc-001-connect-wallet.spec.ts --video=on
```
Videos saved in: `frontend/test-results/`

### 3. Console Logs
View browser console logs during test:
```javascript
// Add to test
page.on('console', msg => console.log('BROWSER:', msg.text()))
```

### 4. Network Monitoring
```javascript
// Add to test to log API calls
page.on('request', request => console.log('>>', request.method(), request.url()))
page.on('response', response => console.log('<<', response.status(), response.url()))
```

### 5. Pause at Specific Point
```javascript
// Add in test where you want to pause
await page.pause();  // Opens Playwright Inspector
```

## Test Results

### Current Status
- ✅ **2/2 tests passing** (with mocks)
- ❌ **1 test failing** (real connection test - bug detected!)
- ⏱️ **Execution time**: ~5 seconds
- 🌐 **Browser**: Chromium
- 🐛 **Bug Found**: Phantom click closes modal but doesn't connect

### What's Tested
1. **Wallet modal display and animations**
2. **All 4 wallet providers visible**
3. **Modal close interactions (X, overlay, ESC)**
4. **Button states and visibility**
5. **Real wallet connection behavior** (detects when connection fails)

### What's Not Tested (Requires Full Integration)
- Actual wallet connection flow
- Wallet address display after connection
- WalletInfo component display
- LocalStorage persistence
- Wallet switching

## Troubleshooting

### Common Issues

1. **Test runs too fast to see actions**
   - Use `--headed --slow-mo=1000` flag
   - Or use debug mode with `--debug`

2. **Can't see browser window**
   - Ensure using `--headed` flag
   - Check if running in Docker/CI (use xvfb)

3. **Tests fail locally but pass in CI**
   - Clear test cache: `rm -rf test-results/`
   - Check viewport size matches CI
   - Ensure same browser version

4. **Modal not appearing**
   - Check if dev server is running
   - Verify baseURL in playwright.config.ts
   - Check for JavaScript errors in console

## Next Steps

To implement full wallet connection testing:
1. Integrate Phantom test mode (see `docs/e2e-testing-strategy.md`)
2. Add real wallet extension automation
3. Implement remaining test cases (TC-002 to TC-004)
4. Add cross-browser testing
5. Set up CI/CD pipeline integration

## Related Documentation
- Test Case Definition: `docs/regression-tests.md` (lines 38-66)
- E2E Strategy: `docs/e2e-testing-strategy.md`
- Playwright Config: `frontend/playwright.config.ts`