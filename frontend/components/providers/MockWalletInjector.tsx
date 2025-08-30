'use client'

import { useEffect } from 'react'
import { injectMockWallet } from '@/lib/mockWallet'

export default function MockWalletInjector() {
  useEffect(() => {
    // Only inject mock wallet for E2E tests
    // E2E tests should set NEXT_PUBLIC_E2E_TEST_MODE=true
    const isE2ETest = process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true' ||
      (typeof window !== 'undefined' && (window as any).__E2E_TEST_MODE__)
    
    if (isE2ETest) {
      console.log('[MockWalletInjector] Injecting mock wallet for E2E testing')
      injectMockWallet()
    }
  }, [])
  
  return null
}