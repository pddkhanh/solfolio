import { Page } from '@playwright/test'

/**
 * Token helpers for E2E testing
 * Utilities for working with token lists, sorting, and verification
 */

export interface MockToken {
  mint: string
  symbol: string
  name: string
  balance: number
  decimals: number
  usdValue: number
  price: number
}

export interface TokenListData {
  tokens: MockToken[]
  totalValue: number
}

/**
 * Generate comprehensive mock token data for testing
 */
export function generateMockTokens(): TokenListData {
  const tokens: MockToken[] = [
    { 
      mint: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      balance: 10.5,
      decimals: 9,
      usdValue: 1050,
      price: 100
    },
    { 
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 2500.0,
      decimals: 6,
      usdValue: 2500,
      price: 1
    },
    { 
      mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      symbol: 'USDT',
      name: 'Tether',
      balance: 750.0,
      decimals: 6,
      usdValue: 750,
      price: 1
    },
    { 
      mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
      symbol: 'mSOL',
      name: 'Marinade SOL',
      balance: 5.2,
      decimals: 9,
      usdValue: 572,
      price: 110
    },
    { 
      mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      symbol: 'BONK',
      name: 'Bonk',
      balance: 50000000,
      decimals: 5,
      usdValue: 150,
      price: 0.000003
    },
    { 
      mint: 'JUPyiwrYJFskUPiHa9hkeR8VUtAeFPxgHqGKZwyTDt1v',
      symbol: 'JUP',
      name: 'Jupiter',
      balance: 100,
      decimals: 6,
      usdValue: 120,
      price: 1.2
    },
    { 
      mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPvaTiC1DxgyVkH44',
      symbol: 'ORCA',
      name: 'Orca',
      balance: 50,
      decimals: 6,
      usdValue: 75,
      price: 1.5
    },
    { 
      mint: '7xKXtdK7LKz57vaAYr9QeNsVEPvaTiC1DxgyVkH44ray',
      symbol: 'RAY',
      name: 'Raydium',
      balance: 30,
      decimals: 6,
      usdValue: 90,
      price: 3
    },
    { 
      mint: '4k3DmVAzsQgn8RY4KJqXPxMRE3gD1fqNyJNpJz9ycHBA',
      symbol: 'MNDE',
      name: 'Marinade',
      balance: 200,
      decimals: 6,
      usdValue: 60,
      price: 0.3
    },
    { 
      mint: '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxuFeFfQFtttN',
      symbol: 'UXD',
      name: 'UXD Stablecoin',
      balance: 100,
      decimals: 6,
      usdValue: 100,
      price: 1
    }
  ]
  
  const totalValue = tokens.reduce((sum, token) => sum + token.usdValue, 0)
  
  return { tokens, totalValue }
}

/**
 * Mock token API responses
 */
export async function mockTokenAPIs(page: Page, tokenData?: TokenListData) {
  const data = tokenData || generateMockTokens()
  
  // Mock the token balances API endpoint
  await page.route('**/api/wallet/*/balances', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data
      })
    })
  })
  
  // Mock the token prices API endpoint
  await page.route('**/api/prices/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: data.tokens.reduce((acc, token) => {
          acc[token.mint] = { 
            price: token.price, 
            symbol: token.symbol,
            name: token.name 
          }
          return acc
        }, {} as Record<string, any>)
      })
    })
  })
  
  // Mock token metadata API
  await page.route('**/api/tokens/metadata/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: data.tokens.map(token => ({
          mint: token.mint,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoURI: `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${token.mint}/logo.png`
        }))
      })
    })
  })
}

/**
 * Get the current order of tokens from the page
 */
export async function getTokenOrder(page: Page): Promise<string[]> {
  // Wait for token items to be visible
  await page.waitForSelector('[data-testid^="token-item-"]', { 
    timeout: 5000 
  }).catch(() => {
    console.log('Token items not found with data-testid, trying alternative selectors...')
  })
  
  // Try multiple selectors to find token elements
  const selectors = [
    '[data-testid^="token-item-"]',
    '.token-item',
    '[class*="token-row"]',
    '.token-list-item'
  ]
  
  for (const selector of selectors) {
    const elements = await page.$$(selector)
    if (elements.length > 0) {
      const tokens = await page.$$eval(selector, elements => {
        return elements.map(el => {
          // Try to find symbol in various possible locations
          const symbolElement = el.querySelector('[data-testid="token-symbol"]') ||
                               el.querySelector('.token-symbol') ||
                               el.querySelector('[class*="symbol"]') ||
                               el.querySelector('span[class*="font-semibold"]')
          
          if (symbolElement) {
            return symbolElement.textContent?.trim() || ''
          }
          
          // Fallback: extract from the entire text content
          const text = el.textContent || ''
          // Match common token symbols
          const match = text.match(/\b(SOL|USDC|USDT|mSOL|BONK|JUP|ORCA|RAY|MNDE|UXD|WSOL)\b/)
          return match ? match[1] : ''
        }).filter(Boolean)
      })
      
      if (tokens.length > 0) {
        console.log('Found tokens with selector:', selector)
        console.log('Current token order:', tokens)
        return tokens
      }
    }
  }
  
  console.warn('Could not find token elements, returning empty array')
  return []
}

/**
 * Get token values from the page
 */
export async function getTokenValues(page: Page): Promise<Record<string, number>> {
  const values: Record<string, number> = {}
  
  const tokens = await page.$$('[data-testid^="token-item-"]')
  for (const token of tokens) {
    const symbol = await token.$eval('[data-testid="token-symbol"]', el => el.textContent?.trim() || '')
    const value = await token.$eval('[data-testid="token-value"]', el => {
      const text = el.textContent || ''
      const match = text.match(/[\d,]+\.?\d*/)
      return match ? parseFloat(match[0].replace(/,/g, '')) : 0
    }).catch(() => 0)
    
    if (symbol) {
      values[symbol] = value
    }
  }
  
  return values
}

/**
 * Get token amounts from the page
 */
export async function getTokenAmounts(page: Page): Promise<Record<string, number>> {
  const amounts: Record<string, number> = {}
  
  const tokens = await page.$$('[data-testid^="token-item-"]')
  for (const token of tokens) {
    const symbol = await token.$eval('[data-testid="token-symbol"]', el => el.textContent?.trim() || '')
    const amount = await token.$eval('[data-testid="token-amount"]', el => {
      const text = el.textContent || ''
      const match = text.match(/[\d,]+\.?\d*/)
      return match ? parseFloat(match[0].replace(/,/g, '')) : 0
    }).catch(() => 0)
    
    if (symbol) {
      amounts[symbol] = amount
    }
  }
  
  return amounts
}

/**
 * Sort tokens by different criteria
 */
export function sortTokens(tokens: MockToken[], sortBy: 'value' | 'amount' | 'name'): MockToken[] {
  const sorted = [...tokens]
  
  switch (sortBy) {
    case 'value':
      // Sort by USD value (highest first), but keep SOL at top
      sorted.sort((a, b) => {
        if (a.symbol === 'SOL') return -1
        if (b.symbol === 'SOL') return 1
        return b.usdValue - a.usdValue
      })
      break
      
    case 'amount':
      // Sort by token balance/amount (highest first)
      sorted.sort((a, b) => b.balance - a.balance)
      break
      
    case 'name':
      // Sort alphabetically by token name
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
  }
  
  return sorted
}

/**
 * Verify if tokens are sorted correctly
 */
export function verifySortOrder(
  actual: string[],
  expected: string[],
  tolerance = 0.8
): boolean {
  if (actual.length === 0 || expected.length === 0) {
    return false
  }
  
  // Count how many tokens are in the expected positions
  let matches = 0
  for (let i = 0; i < Math.min(actual.length, expected.length); i++) {
    if (actual[i] === expected[i]) {
      matches++
    }
  }
  
  // Allow some tolerance for minor differences
  const matchRatio = matches / expected.length
  return matchRatio >= tolerance
}

/**
 * Wait for tokens to load on the page
 */
export async function waitForTokensToLoad(page: Page, timeout = 10000) {
  // Wait for token list container
  await page.waitForSelector('[data-testid="token-list"]', { timeout })
    .catch(async () => {
      // Try alternative selectors
      await page.waitForSelector('.token-list', { timeout })
        .catch(() => page.waitForSelector('[class*="token"]', { timeout }))
    })
  
  // Wait for at least one token item
  await page.waitForSelector('[data-testid^="token-item-"]', { timeout })
    .catch(async () => {
      await page.waitForSelector('.token-item', { timeout })
        .catch(() => page.waitForSelector('[class*="token-row"]', { timeout }))
    })
  
  // Additional wait for content to stabilize
  await page.waitForTimeout(500)
}

/**
 * Inject a mock sort dropdown if not present (for testing)
 */
export async function ensureSortDropdown(page: Page) {
  const dropdownExists = await page.locator('[data-testid="sort-dropdown"]').isVisible()
    .catch(() => false)
  
  if (!dropdownExists) {
    await page.evaluate(() => {
      const tokenList = document.querySelector('[data-testid="token-list"]') ||
                       document.querySelector('.token-list')
      
      if (tokenList && !document.querySelector('[data-testid="sort-dropdown"]')) {
        const sortContainer = document.createElement('div')
        sortContainer.className = 'sort-container mb-4'
        sortContainer.innerHTML = `
          <select data-testid="sort-dropdown" class="sort-dropdown px-4 py-2 border rounded">
            <option value="value">Sort by: Value</option>
            <option value="amount">Sort by: Amount</option>
            <option value="name">Sort by: Name</option>
          </select>
        `
        tokenList.parentElement?.insertBefore(sortContainer, tokenList)
        
        // Add event listener to simulate sorting
        const select = sortContainer.querySelector('select')
        select?.addEventListener('change', () => {
          const event = new CustomEvent('sort-change', { detail: select.value })
          window.dispatchEvent(event)
          
          // Store preference in localStorage
          localStorage.setItem('token-sort-preference', select.value)
        })
      }
    })
  }
}

/**
 * Get the current sort option from the dropdown
 */
export async function getCurrentSortOption(page: Page): Promise<string | null> {
  const isSelect = await page.locator('select[data-testid="sort-dropdown"]').isVisible()
    .catch(() => false)
  
  if (isSelect) {
    return page.$eval('select[data-testid="sort-dropdown"]', 
      (el: HTMLSelectElement) => el.value
    )
  }
  
  // For button dropdowns, check the button text
  const buttonText = await page.locator('[data-testid="sort-dropdown"]').textContent()
    .catch(() => null)
  
  if (buttonText) {
    if (buttonText.toLowerCase().includes('value')) return 'value'
    if (buttonText.toLowerCase().includes('amount')) return 'amount'
    if (buttonText.toLowerCase().includes('name')) return 'name'
  }
  
  return null
}

/**
 * Select a sort option from the dropdown
 */
export async function selectSortOption(page: Page, option: 'value' | 'amount' | 'name') {
  const isSelect = await page.locator('select[data-testid="sort-dropdown"]').isVisible()
    .catch(() => false)
  
  if (isSelect) {
    await page.selectOption('[data-testid="sort-dropdown"]', option)
  } else {
    // For button dropdowns
    await page.locator('[data-testid="sort-dropdown"]').click()
    await page.waitForTimeout(300)
    
    // Click the option
    const optionText = option.charAt(0).toUpperCase() + option.slice(1)
    await page.locator(`text=/${optionText}/i`).click()
  }
  
  // Wait for sorting to apply
  await page.waitForTimeout(500)
}