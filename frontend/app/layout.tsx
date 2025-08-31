import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { WalletContextProvider } from '@/contexts/WalletContextProvider'
import WalletPersistenceProvider from '@/components/providers/WalletPersistenceProvider'
import WebSocketProvider from '@/contexts/WebSocketProvider'
import PositionChangeNotifications from '@/components/notifications/PositionChangeNotification'
import WalletErrorBoundary from '@/components/wallet/WalletErrorBoundary'
import MockWalletInjector from '@/components/providers/MockWalletInjector'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary'
import { PageTransition } from '@/components/layout/PageTransition'
import { SkipNavigation } from '@/components/ui/skip-navigation'

// Configure Inter font with all required weights
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

// Configure JetBrains Mono for code/addresses/numbers
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={inter.className}>
        <ThemeProvider>
          <GlobalErrorBoundary>
            <MockWalletInjector />
            <WalletErrorBoundary>
              <WalletContextProvider>
                <WalletPersistenceProvider>
                  <WebSocketProvider>
                    <div className="relative flex min-h-screen flex-col">
                      <SkipNavigation />
                      <Header />
                      <PositionChangeNotifications />
                      <main 
                        id="main-content"
                        className="flex-1"
                        role="main"
                        aria-label="Main content"
                      >
                        <PageTransition>
                          {children}
                        </PageTransition>
                      </main>
                      <Footer />
                    </div>
                  </WebSocketProvider>
                </WalletPersistenceProvider>
              </WalletContextProvider>
            </WalletErrorBoundary>
          </GlobalErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}