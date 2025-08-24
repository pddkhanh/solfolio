import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { WalletContextProvider } from '@/contexts/WalletContextProvider'
import WalletPersistenceProvider from '@/components/providers/WalletPersistenceProvider'
import WebSocketProvider from '@/contexts/WebSocketProvider'
import PositionChangeNotifications from '@/components/notifications/PositionChangeNotification'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SolFolio - Solana DeFi Portfolio Tracker',
  description: 'Track your DeFi positions across multiple Solana protocols in one unified dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          <WalletPersistenceProvider>
            <WebSocketProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <PositionChangeNotifications />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </WebSocketProvider>
          </WalletPersistenceProvider>
        </WalletContextProvider>
      </body>
    </html>
  )
}