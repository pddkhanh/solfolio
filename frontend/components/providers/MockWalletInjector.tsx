'use client'

import { useEffect } from 'react'
import { injectMockWallet } from '@/lib/mockWallet'

export default function MockWalletInjector() {
  useEffect(() => {
    // Check if we should inject mock wallet
    const shouldMock = process.env.NEXT_PUBLIC_MOCK_WALLET === 'true' ||
      process.env.NODE_ENV === 'development'
    
    if (shouldMock) {
      console.log('[MockWalletInjector] Injecting mock wallet for development')
      injectMockWallet()
    }
  }, [])
  
  return null
}