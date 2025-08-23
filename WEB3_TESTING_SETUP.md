# Web3 Testing Setup Guide for SolFolio

## Table of Contents
1. [Overview](#overview)
2. [Wallet Setup for Testing](#wallet-setup-for-testing)
3. [API Keys and Configuration](#api-keys-and-configuration)
4. [Testing Your Wallet Connection](#testing-your-wallet-connection)
5. [Running Tests](#running-tests)
6. [Troubleshooting](#troubleshooting)

---

## Overview

This guide will help you set up everything needed to test SolFolio's Web3 functionality. As someone new to Web3 development, you'll learn how to:
- Set up a test wallet (separate from your production wallet)
- Configure the necessary API keys
- Test wallet connections safely
- Run automated tests

**Important:** Never use your production wallet for testing! We'll create a separate test wallet.

---

## Wallet Setup for Testing

### Why Use a Test Wallet?

- **Safety**: Test wallets have no real funds, so there's no risk
- **Isolation**: Keeps your production assets separate from development
- **Network**: We use Solana Devnet (test network) where tokens have no real value

### Step 1: Install Phantom Wallet

1. Go to [phantom.app](https://phantom.app)
2. Click "Download" and install the browser extension
3. Choose your browser (Chrome, Firefox, Brave, or Edge)

### Step 2: Create a Test Wallet

1. **Open Phantom** extension in your browser
2. Click **"Create a new wallet"**
3. **IMPORTANT**: Write down your recovery phrase and store it safely (even for test wallets)
4. Set a password for the wallet
5. Complete the setup

### Step 3: Switch to Devnet

This is crucial for testing:

1. **Open Phantom** wallet
2. Click the **settings icon** (gear icon)
3. Go to **"Developer Settings"**
4. Toggle ON **"Testnet Mode"**
5. In **"Network"**, select **"Devnet"**
6. You should see "Devnet" in the top-left of your wallet

### Step 4: Get Free Test SOL

You need test SOL for transactions:

1. **Copy your wallet address** (click the address at the top of Phantom)
2. Go to [Solana Faucet](https://faucet.solana.com/)
3. Paste your wallet address
4. Select "Devnet" as the network
5. Click "Request Airdrop"
6. You should receive 2 SOL (test tokens) within seconds

**Alternative method using CLI:**
```bash
# If you have Solana CLI installed
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

---

## API Keys and Configuration

### Required Services

For full functionality, you'll need accounts with these services (all have free tiers):

#### 1. Helius RPC (Recommended)

Helius provides fast, reliable RPC access to Solana:

1. **Sign up** at [helius.dev](https://helius.dev)
2. **Create a new project**
3. **Get your API key** from the dashboard
4. **Select "Devnet"** as your network

#### 2. Environment Configuration

Create/update the `.env.local` file in the `frontend` directory:

```bash
# frontend/.env.local

# Network Configuration (use 'devnet' for testing)
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Helius RPC URL (recommended for better performance)
# Get your key from https://helius.dev
NEXT_PUBLIC_HELIUS_RPC_URL=https://rpc-devnet.helius.xyz/?api-key=YOUR_HELIUS_API_KEY_HERE

# Alternative: Use public Solana RPC (slower, may have rate limits)
# NEXT_PUBLIC_CUSTOM_RPC_URL=https://api.devnet.solana.com

# Future: Jupiter Price API (for token prices)
# No API key needed, but included for reference
NEXT_PUBLIC_JUPITER_API_URL=https://price.jup.ag/v4
```

**Note:** Never commit `.env.local` to git! It's already in `.gitignore`.

---

## Testing Your Wallet Connection

### Manual Testing Steps

#### 1. Start the Development Environment

```bash
# Using Docker (recommended)
make dev

# Or run directly
cd frontend
pnpm dev
```

#### 2. Access the Application

Open your browser and go to: `http://localhost:3000`

#### 3. Connect Your Test Wallet

1. **Click "Connect Wallet"** button
2. **Select Phantom** from the modal
3. **Phantom will pop up** - review the connection request
4. **Check the following**:
   - It shows "Devnet" in Phantom
   - The website is localhost:3000
   - No real funds are at risk
5. **Click "Connect"** in Phantom

#### 4. Verify Connection

After connecting, you should see:
- Your wallet address (formatted as "1234...5678")
- A dropdown menu when clicking the address
- Your test SOL balance
- Wallet info card on the homepage

#### 5. Test Features

Try these actions:
- **Copy Address**: Click dropdown → "Copy Address"
- **View on Explorer**: Click the external link icon
- **Switch Wallet**: Disconnect and connect a different wallet
- **Disconnect**: Click dropdown → "Disconnect"
- **Refresh Page**: Connection should persist

### What Success Looks Like

✅ **Successful connection shows:**
- Wallet button changes to show your address
- No error messages
- Wallet info card displays with balance
- All dropdown menu items work

❌ **If you see errors:**
- "Unable to add filesystem" - Clear browser cache and restart
- "Wallet not found" - Make sure Phantom is installed
- "Network error" - Check you're on Devnet
- Connection rejected - You clicked "Cancel" in Phantom

---

## Running Tests

### Unit Tests

```bash
cd frontend

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

### E2E Tests

```bash
cd frontend

# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npx playwright test

# Run in UI mode (recommended for debugging)
npx playwright test --ui

# Run specific test file
npx playwright test e2e/wallet-connection.spec.ts

# Run with specific browser
npx playwright test --project=chromium
```

### Testing in Docker

```bash
# Run tests in Docker container
docker-compose -f docker-compose.dev.yml exec frontend pnpm test
docker-compose -f docker-compose.dev.yml exec frontend npx playwright test
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Unable to add filesystem: <illegal path>"

**Cause**: Docker/browser security conflict
**Solution**:
- Clear browser cache and cookies for localhost:3000
- Restart Docker containers: `make restart`
- Try incognito/private browsing mode

#### 2. "Wallet not found" or "Phantom is not installed"

**Cause**: Extension not detected
**Solution**:
- Refresh the page
- Check Phantom is enabled for localhost
- Try a different browser
- Disable other wallet extensions temporarily

#### 3. "Transaction failed" or "Insufficient funds"

**Cause**: No test SOL in wallet
**Solution**:
- Check you're on Devnet (not Mainnet)
- Request airdrop from faucet
- Wait a few seconds for transaction to confirm

#### 4. "RPC Error" or "Network request failed"

**Cause**: RPC endpoint issues
**Solution**:
- Check your Helius API key is valid
- Try switching to public RPC
- Check network connectivity
- Verify you're using devnet URLs

#### 5. Connection doesn't persist after refresh

**Cause**: LocalStorage blocked or cleared
**Solution**:
- Check browser doesn't block third-party storage
- Don't use incognito mode for persistence testing
- Check browser console for localStorage errors

### Debug Mode

To see detailed logs:

```javascript
// In browser console
localStorage.setItem('debug', 'solana:*')

// Then refresh the page
```

### Getting Help

If you encounter issues:

1. **Check browser console** (F12 → Console tab)
2. **Check Docker logs**: `docker-compose logs frontend`
3. **Review this guide** for missed steps
4. **Search error messages** - most Solana errors are well-documented
5. **Ask in Solana Discord** (#developers channel)

---

## Security Best Practices

### DO's ✅
- Always use test wallets for development
- Keep test and production wallets separate
- Use Devnet for all testing
- Store recovery phrases securely (even for test wallets)
- Clear browser data after testing sessions

### DON'Ts ❌
- Never share recovery phrases
- Never use production wallet for testing
- Never send real SOL to test wallets
- Never commit API keys to git
- Never test on Mainnet unless absolutely necessary

---

## Next Steps

After successful setup:

1. **Test all wallet features** manually first
2. **Run the E2E test suite** to verify everything works
3. **Implement new features** using test-driven development
4. **Keep test wallet funded** with test SOL
5. **Document any new testing procedures** you discover

Remember: Testing in Web3 is about safety first. Always use test networks and test wallets!

---

## Quick Reference

### Commands
```bash
# Start development
make dev

# Run tests
pnpm test
npx playwright test

# Get test SOL
# Visit: https://faucet.solana.com/
```

### Important URLs
- **Local App**: http://localhost:3000
- **Solana Faucet**: https://faucet.solana.com/
- **Helius Dashboard**: https://dev.helius.xyz/
- **Solana Explorer (Devnet)**: https://explorer.solana.com/?cluster=devnet
- **Phantom Wallet**: https://phantom.app/

### Network Settings
- **Network**: Devnet (for testing)
- **RPC**: Helius or public Solana Devnet
- **Tokens**: Test SOL (no real value)
- **Transactions**: Free on Devnet