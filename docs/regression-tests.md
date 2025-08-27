# SolFolio Regression Test Suite

## Overview
This document defines the core regression test cases for SolFolio's frontend features. Each test case is designed to be executed manually and can be automated using Playwright or similar E2E testing frameworks.

## Test Environment Requirements
- Browser: Chrome/Firefox/Safari (latest versions)
- Network: Internet connection for Solana RPC and API calls
- Test Wallet: Phantom or Solflare wallet extension (optional for manual testing)
- Backend Services: Running on localhost:3001 or deployed environment

## Test Scenarios Summary

| Test ID | Feature Area | Test Case | Priority | Automation Ready |
|---------|--------------|-----------|----------|------------------|
| TC-001 | Wallet Connection | Connect wallet via modal | High | ✅ |
| TC-002 | Wallet Connection | Disconnect wallet | High | ✅ |
| TC-003 | Wallet Connection | Switch between wallets | Medium | ✅ |
| TC-004 | Wallet Connection | Persist wallet on refresh | High | ✅ |
| TC-005 | Portfolio View | View portfolio overview | High | ✅ |
| TC-006 | Portfolio View | Navigate to portfolio page | High | ✅ |
| TC-007 | Token List | Display token balances | High | ✅ |
| TC-008 | Token List | Sort tokens by value/amount | Medium | ✅ |
| TC-009 | Token List | Filter small balances | Low | ✅ |
| TC-010 | Token List | Refresh token balances | Medium | ✅ |
| TC-011 | DeFi Positions | View staking positions | High | ✅ |
| TC-012 | DeFi Positions | Display position metrics | High | ✅ |
| TC-013 | DeFi Positions | Refresh positions data | Medium | ✅ |
| TC-014 | Navigation | Navigate between pages | High | ✅ |
| TC-015 | Responsive | Mobile viewport compatibility | Medium | ✅ |

---

## Core User Flows

### 1. Wallet Connection Flow

#### TC-001: Connect Wallet via Modal
**Prerequisites:** 
- User is not connected to any wallet
- Application is loaded on home page

**Test Steps:**
1. Navigate to homepage (/)
2. Click "Connect Wallet" button (either in header or hero section)
3. Verify wallet selection modal appears
4. Verify modal displays available wallets: Phantom, Solflare, Ledger, Torus
5. Click on a wallet option (e.g., Phantom)
6. Handle wallet extension response (approve/reject in manual testing)

**Expected Results:**
- Wallet modal opens with smooth animation
- All supported wallets are visible
- Modal has close button (X) visible
- Clicking outside modal area closes it
- After connection: wallet button shows abbreviated address (e.g., "1a2b...3c4d")
- WalletInfo component appears on homepage showing full details

**Automation Notes:**
```typescript
// Mock wallet adapter for testing
await page.evaluate(() => {
  window.solana = { isPhantom: true };
});
```

---

#### TC-002: Disconnect Wallet
**Prerequisites:** 
- User has connected wallet
- Wallet address is displayed in header

**Test Steps:**
1. Click on connected wallet button in header
2. Verify dropdown menu appears
3. Click "Disconnect" option
4. Verify disconnection occurs

**Expected Results:**
- Dropdown shows: Copy Address, Switch Wallet, Disconnect options
- After disconnect: returns to "Connect Wallet" button
- Portfolio page shows connect prompt if navigated to
- Wallet info disappears from homepage

**Automation Notes:**
```typescript
await page.getByRole('button', { name: /0x.../ }).click();
await page.getByText('Disconnect').click();
```

---

#### TC-003: Switch Between Wallets
**Prerequisites:** 
- User has connected to Wallet A
- Multiple wallet extensions available

**Test Steps:**
1. Click connected wallet button
2. Select "Switch Wallet" from dropdown
3. Verify wallet modal reopens
4. Select different wallet (Wallet B)
5. Approve connection in wallet extension

**Expected Results:**
- Current wallet disconnects first
- Modal shows all wallet options again
- New wallet address displays after connection
- Portfolio data updates for new wallet

---

#### TC-004: Persist Wallet Connection on Refresh
**Prerequisites:**
- User has connected wallet
- LocalStorage is enabled

**Test Steps:**
1. Connect wallet successfully
2. Note the connected wallet address
3. Refresh the page (F5 or browser refresh)
4. Verify wallet remains connected
5. Check localStorage has 'walletName' key

**Expected Results:**
- Wallet stays connected after refresh
- Same wallet address displays
- No need to reconnect manually
- Portfolio data loads automatically

**Automation Notes:**
```typescript
const storage = await page.context().storageState();
expect(storage.origins[0].localStorage).toContainEqual(
  expect.objectContaining({ name: 'walletName' })
);
```

---

### 2. Portfolio Viewing Flow

#### TC-005: View Portfolio Overview
**Prerequisites:**
- Wallet is connected
- User is on portfolio page (/portfolio)

**Test Steps:**
1. Navigate to /portfolio
2. Wait for data to load
3. Verify Portfolio Overview card displays
4. Check for total value display
5. Verify token count shows
6. Check 24h change indicators (if available)

**Expected Results:**
- Portfolio Overview card shows:
  - Total Value in USD
  - Total Tokens count
  - 24h Change (when implemented)
- Loading skeleton appears while fetching
- Error message if API fails
- Values update without page refresh

---

#### TC-006: Navigate to Portfolio Page
**Prerequisites:**
- Application is loaded
- Wallet may or may not be connected

**Test Steps:**
1. Click "Portfolio" in navigation header
2. Verify URL changes to /portfolio
3. If wallet not connected: verify connect prompt
4. If wallet connected: verify portfolio loads

**Expected Results:**
- Smooth navigation without page reload
- Correct page title "My Portfolio"
- Appropriate content based on wallet state
- Back/forward browser navigation works

---

### 3. Token Management Flow

#### TC-007: Display Token Balances
**Prerequisites:**
- Wallet connected with tokens
- On portfolio page

**Test Steps:**
1. Scroll to Token Balances section
2. Verify token list card is visible
3. Check each token displays:
   - Token icon/logo
   - Symbol (e.g., SOL, USDC)
   - Name (if available)
   - Balance amount
   - USD value
   - Mint address (abbreviated)
4. Verify copy and explorer buttons

**Expected Results:**
- All wallet tokens listed
- Native SOL appears first if present
- Proper formatting of numbers (2 decimals)
- USD values calculated correctly
- Icons load or show fallback

**Automation Notes:**
```typescript
const tokenCard = page.locator('[data-testid="token-card"]').first();
await expect(tokenCard).toContainText('SOL');
await expect(tokenCard).toContainText('$');
```

---

#### TC-008: Sort Tokens by Value/Amount
**Prerequisites:**
- Token list displayed with multiple tokens

**Test Steps:**
1. Locate "Sort by" dropdown
2. Select "Value" option
3. Verify tokens reorder by USD value (highest first)
4. Select "Amount" option  
5. Verify tokens reorder by quantity
6. Select "Name" option
7. Verify alphabetical ordering

**Expected Results:**
- Dropdown has three options: Value, Amount, Name
- Sorting happens instantly without reload
- SOL remains at top when sorting by value (if present)
- Sort preference persists during session

---

#### TC-009: Filter Small Balances
**Prerequisites:**
- Token list with mix of large and small balances

**Test Steps:**
1. Locate "Hide small balances" checkbox
2. Check the checkbox
3. Verify tokens under $1 are hidden
4. Uncheck the checkbox
5. Verify all tokens show again

**Expected Results:**
- Checkbox clearly labeled "Hide small balances (< $1)"
- Filter applies immediately
- Token count updates in overview
- No tokens shown message if all filtered

---

#### TC-010: Refresh Token Balances
**Prerequisites:**
- Token list displayed

**Test Steps:**
1. Click refresh button (↻) in token list header
2. Verify refresh animation/spinner
3. Wait for completion
4. Check "Last updated" timestamp changes

**Expected Results:**
- Button shows spinning animation while loading
- Button disabled during refresh
- Success: new timestamp shows
- Error: error message appears with retry option
- Data updates if changes occurred

---

### 4. DeFi Positions Flow

#### TC-011: View Staking Positions
**Prerequisites:**
- Wallet with DeFi positions connected
- On portfolio page

**Test Steps:**
1. Scroll to "DeFi Positions" section
2. Verify position cards display
3. Check each card shows:
   - Protocol name and logo
   - Position type (Staking/Lending/LP)
   - Token symbol
   - Staked amount
   - USD value
   - APY percentage

**Expected Results:**
- All active positions listed
- Cards organized in grid layout
- Proper protocol identification
- Accurate value calculations
- "No positions found" message if empty

---

#### TC-012: Display Position Metrics
**Prerequisites:**
- DeFi positions displayed

**Test Steps:**
1. Locate position statistics cards above positions
2. Verify "Total Staked Value" card
3. Verify "Average APY" card  
4. Verify "Monthly Rewards" card
5. Check portfolio breakdown section

**Expected Results:**
- Three metric cards display:
  - Total Staked Value in USD
  - Average APY as percentage
  - Monthly/Daily rewards estimate
- Breakdown shows:
  - Staking/Lending/Liquidity percentages
  - Visual progress bars
  - USD values per category

---

#### TC-013: Refresh Positions Data
**Prerequisites:**
- Positions displayed on page

**Test Steps:**
1. Click "Refresh" button in positions header
2. Verify loading state
3. Wait for data update
4. Check if values updated

**Expected Results:**
- Refresh button with icon
- Spinning animation during load
- Positions reload without page refresh
- Error handling if API fails
- Cache indicator shows fresh data

---

### 5. Navigation & Layout Flow

#### TC-014: Navigate Between Pages
**Prerequisites:**
- Application loaded

**Test Steps:**
1. Click "Portfolio" in header → verify /portfolio loads
2. Click logo/home → verify / (home) loads  
3. Use browser back button → verify previous page
4. Use browser forward → verify forward navigation
5. Verify active page highlighted in nav

**Expected Results:**
- All navigation links work
- No 404 errors
- Active page highlighted in header
- URL updates correctly
- Page titles update
- Smooth transitions

---

#### TC-015: Mobile Viewport Compatibility
**Prerequisites:**
- Test on 375x667 viewport (iPhone SE)

**Test Steps:**
1. Set viewport to mobile size
2. Verify header collapses appropriately
3. Check wallet button remains accessible
4. Verify cards stack vertically
5. Test modal on mobile
6. Verify horizontal scroll not needed
7. Test touch interactions

**Expected Results:**
- Responsive layout without horizontal scroll
- All buttons/links tap-friendly (min 44x44px)
- Modals fit mobile screen
- Text remains readable
- Cards stack single column
- Navigation remains usable

---

## Error Handling Test Cases

### Network & API Errors

#### TC-E01: Handle API Timeout
**Test Steps:**
1. Simulate slow network (throttle to 2G)
2. Navigate to portfolio
3. Wait for timeout

**Expected Results:**
- Loading state shows initially
- Error message after timeout
- Retry button available
- App doesn't crash

#### TC-E02: Handle Invalid Wallet Address
**Test Steps:**
1. Manually navigate to /portfolio with invalid address in API call
2. Observe error handling

**Expected Results:**
- Graceful error message
- No console errors
- Ability to connect valid wallet

---

## Data Requirements for Testing

### Test Wallets
For comprehensive testing, use wallets with:
1. **Empty Wallet**: No tokens or positions
2. **Basic Wallet**: Only SOL balance
3. **Token-Rich Wallet**: 10+ different tokens
4. **DeFi Active Wallet**: Positions in Marinade, Kamino, etc.
5. **Mixed Portfolio**: Tokens + DeFi positions

### Mock Data Structure
```json
{
  "wallet": "11111111111111111111111111111111",
  "tokens": [
    {
      "mint": "So11111111111111111111111111111111111112",
      "symbol": "SOL",
      "balance": "10.5",
      "valueUSD": 525.00
    }
  ],
  "positions": [
    {
      "protocol": "marinade",
      "type": "staking",
      "amount": 100,
      "valueUSD": 5000,
      "apy": 7.2
    }
  ]
}
```

---

## Automation Implementation Notes

### Playwright Setup
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

### Test Helpers
```typescript
// e2e/helpers/wallet.ts
export async function connectMockWallet(page: Page, address: string) {
  await page.evaluate((addr) => {
    window.localStorage.setItem('walletName', 'Phantom');
    window.localStorage.setItem('walletAddress', addr);
  }, address);
  await page.reload();
}

export async function mockAPIResponse(page: Page, endpoint: string, data: any) {
  await page.route(`**/api/${endpoint}`, route => {
    route.fulfill({ json: data });
  });
}
```

### Example Test Implementation
```typescript
test('Complete portfolio viewing flow', async ({ page }) => {
  // Setup
  await mockAPIResponse(page, 'wallet/*/balances', mockBalanceData);
  await connectMockWallet(page, TEST_WALLET_ADDRESS);
  
  // Navigate to portfolio
  await page.goto('/portfolio');
  
  // Verify overview loads
  await expect(page.getByText('Total Value')).toBeVisible();
  await expect(page.getByText('$10,525.00')).toBeVisible();
  
  // Verify token list
  const tokenList = page.getByTestId('token-list');
  await expect(tokenList).toBeVisible();
  await expect(tokenList.locator('.token-item')).toHaveCount(5);
  
  // Test sorting
  await page.selectOption('[data-testid="sort-select"]', 'name');
  await expect(tokenList.locator('.token-item').first()).toContainText('Bonk');
});
```

---

## Test Execution Schedule

### Smoke Tests (Run on every commit)
- TC-001: Connect wallet
- TC-005: View portfolio
- TC-007: Display tokens

### Regression Suite (Run before release)
- All TC-001 through TC-015
- All error handling cases

### Performance Benchmarks
- Page load time < 2 seconds
- API response time < 1 second  
- Smooth animations (60 fps)

---

## Known Issues & Limitations

1. **Wallet Extension Detection**: Automated tests cannot fully test real wallet extensions
2. **WebSocket Testing**: Real-time updates require mock socket server
3. **Cross-Browser**: Some wallet adapters only work in Chrome/Firefox
4. **Rate Limiting**: API may throttle during repeated test runs

---

## Maintenance Notes

- Update test data when new tokens are added
- Verify mock responses match actual API structure
- Add new test cases for each new feature
- Review and update selectors if UI changes
- Keep test wallet addresses current