# Wallet Adapter E2E Testing Setup Guide

## Overview
This guide explains how to set up wallet adapters for E2E testing in SolFolio. The goal is to enable automated testing of wallet connections without requiring real wallet extensions.

## The Problem
When running E2E tests, clicking on wallet options (like Phantom) in the modal doesn't work because:
1. The wallet adapter tries to connect to a real browser extension
2. In headless/test environments, these extensions aren't available
3. The adapter fails silently, just closing the modal without connecting

## The Solution: Test Mode Wallet Adapter

### Step 1: Create a Mock Wallet Adapter
Create a test-specific wallet adapter that simulates wallet behavior:

```typescript
// e2e/helpers/test-wallet-adapter.ts
import { WalletAdapter } from '@solana/wallet-adapter-base'

export class TestWalletAdapter extends WalletAdapter {
  constructor() {
    super()
    this.name = 'Test Wallet'
    this.url = 'https://test.wallet'
    this.icon = 'data:image/svg+xml;base64,...' // Optional icon
    this.readyState = WalletReadyState.Installed
    this.publicKey = null
    this.connecting = false
    this.connected = false
  }

  async connect(): Promise<void> {
    this.connecting = true
    this.emit('connect')
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Set test public key
    this.publicKey = new PublicKey('7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs')
    this.connected = true
    this.connecting = false
    
    this.emit('connect', this.publicKey)
  }

  async disconnect(): Promise<void> {
    this.publicKey = null
    this.connected = false
    this.emit('disconnect')
  }

  // Other required methods...
}
```

### Step 2: Inject Test Adapter in E2E Tests

#### Option A: Environment Variable Approach
Set up the wallet provider to use test adapter when in test mode:

```typescript
// contexts/WalletContextProvider.tsx
const wallets = useMemo(() => {
  // Check if we're in E2E test mode
  if (process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true') {
    return [new TestWalletAdapter()]
  }
  
  // Normal wallets for production
  return [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    // ...
  ]
}, [])
```

Run tests with:
```bash
NEXT_PUBLIC_E2E_TEST_MODE=true pnpm test:e2e
```

#### Option B: Window Object Injection
Inject test mode via window object in E2E tests:

```typescript
// In your E2E test
await page.addInitScript(() => {
  window.__E2E_TEST_MODE__ = true
  window.__TEST_WALLET_ADDRESS__ = '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs'
})

// In WalletContextProvider.tsx
const wallets = useMemo(() => {
  if (typeof window !== 'undefined' && window.__E2E_TEST_MODE__) {
    return [new TestWalletAdapter()]
  }
  // ... normal wallets
}, [])
```

### Step 3: Mock Wallet Standard API
For Phantom-specific testing, mock the Wallet Standard API:

```typescript
// e2e/helpers/mock-wallet-standard.ts
export async function injectMockWalletStandard(page: Page) {
  await page.addInitScript(() => {
    // Create mock wallet that follows Wallet Standard
    const mockWallet = {
      name: 'Phantom',
      icon: 'data:image/svg+xml;base64,...',
      chains: ['solana:mainnet', 'solana:testnet', 'solana:devnet'],
      features: {
        'standard:connect': {
          connect: async () => {
            return {
              accounts: [{
                address: '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs',
                publicKey: new Uint8Array(32).fill(1),
                chains: ['solana:devnet'],
                features: ['standard:connect', 'standard:disconnect']
              }]
            }
          }
        },
        'standard:disconnect': {
          disconnect: async () => {}
        }
      }
    }
    
    // Register with wallet standard
    window.addEventListener('wallet-standard:register', (event) => {
      event.detail.register(mockWallet)
    })
    
    // Trigger registration
    window.dispatchEvent(new CustomEvent('wallet-standard:app-ready'))
  })
}
```

### Step 4: Update E2E Test

```typescript
// e2e/tc-001-connect-wallet.spec.ts
import { test, expect } from '@playwright/test'
import { injectMockWalletStandard } from './helpers/mock-wallet-standard'

test('should connect to test wallet successfully', async ({ page }) => {
  // Inject mock wallet before page loads
  await injectMockWalletStandard(page)
  
  // Navigate to app
  await page.goto('/')
  
  // Click connect button
  await page.getByRole('button', { name: /connect wallet/i }).click()
  
  // Wait for modal
  await page.waitForSelector('.wallet-adapter-modal', { state: 'visible' })
  
  // Click Phantom
  await page.getByRole('button', { name: /phantom/i }).click()
  
  // Verify connection successful
  await expect(page.getByText(/7EYn...awMs/)).toBeVisible()
})
```

## Implementation Steps for SolFolio

### 1. Create Test Wallet Adapter
```bash
# Create the test adapter file
touch frontend/e2e/helpers/test-wallet-adapter.ts
```

### 2. Modify WalletContextProvider
Add support for test mode in `frontend/contexts/WalletContextProvider.tsx`:

```typescript
// Add at the top
import { TestWalletAdapter } from '@/e2e/helpers/test-wallet-adapter'

// Modify wallets array
const wallets = useMemo(() => {
  // E2E Test Mode
  if (process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true' || 
      (typeof window !== 'undefined' && window.__E2E_TEST_MODE__)) {
    return [new TestWalletAdapter()]
  }
  
  // Production wallets
  return [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new LedgerWalletAdapter(),
    new TorusWalletAdapter()
  ]
}, [])
```

### 3. Create Test Helper
```bash
# Create mock injection helper
touch frontend/e2e/helpers/inject-test-wallet.ts
```

### 4. Update package.json Scripts
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:testmode": "NEXT_PUBLIC_E2E_TEST_MODE=true playwright test",
    "test:e2e:ui": "NEXT_PUBLIC_E2E_TEST_MODE=true playwright test --ui",
    "test:e2e:debug": "NEXT_PUBLIC_E2E_TEST_MODE=true playwright test --debug"
  }
}
```

## Testing Workflow

### Development Testing
```bash
# Start dev server with test mode
NEXT_PUBLIC_E2E_TEST_MODE=true pnpm dev

# In another terminal, run tests
pnpm test:e2e:ui tc-001-connect-wallet.spec.ts
```

### CI/CD Testing
```bash
# Run in headless mode with test wallets
NEXT_PUBLIC_E2E_TEST_MODE=true pnpm test:e2e
```

### Debug Failed Connections
```bash
# Run with debug mode to see what's happening
NEXT_PUBLIC_E2E_TEST_MODE=true pnpm test:e2e:debug tc-001-connect-wallet.spec.ts
```

## Verification Checklist

- [ ] Test wallet adapter created
- [ ] WalletContextProvider supports test mode
- [ ] E2E tests inject test wallet
- [ ] Connect button opens modal
- [ ] Clicking wallet option connects successfully
- [ ] Connected state shows abbreviated address
- [ ] Disconnect works properly
- [ ] Tests pass in headless mode

## Common Issues and Solutions

### Issue: Wallet modal doesn't open
**Solution**: Check that wallet adapter CSS is imported:
```typescript
import '@solana/wallet-adapter-react-ui/styles.css'
```

### Issue: Clicking wallet does nothing
**Solution**: Ensure test adapter is properly registered and readyState is `Installed`

### Issue: Connection fails silently
**Solution**: Add console logging to adapter methods to debug

### Issue: Tests work locally but fail in CI
**Solution**: Ensure CI environment has `NEXT_PUBLIC_E2E_TEST_MODE=true`

## Next Steps

1. Implement the test wallet adapter
2. Update WalletContextProvider for test mode
3. Run TC-001 with test mode enabled
4. Verify connection works end-to-end
5. Add more test cases for wallet operations