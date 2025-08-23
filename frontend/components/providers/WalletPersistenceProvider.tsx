'use client'

import { useWalletPersistence } from '@/hooks/useWalletPersistence'

export default function WalletPersistenceProvider({ children }: { children: React.ReactNode }) {
  useWalletPersistence()
  return <>{children}</>
}