'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import dynamic from 'next/dynamic'

const WalletInfo = dynamic(
  () => import('@/components/wallet/WalletInfo'),
  { ssr: false }
)

export default function Home() {
  const { connected } = useWallet()
  const { setVisible } = useWalletModal()

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Show wallet info if connected */}
      {connected && (
        <section className="mb-16 max-w-2xl mx-auto">
          <WalletInfo />
        </section>
      )}

      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="relative inline-block">
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 opacity-30 rounded-full"></div>
          <h1 className="relative text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Solana DeFi Portfolio Tracker
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Track all your DeFi positions across Marinade, Kamino, Orca, Raydium and more in one unified dashboard.
        </p>
        {!connected && (
          <button 
            onClick={() => setVisible(true)}
            className="inline-flex items-center justify-center rounded-md text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8"
          >
            Connect Wallet to Get Started
          </button>
        )}
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
          <div className="mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
            1
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
          <p className="text-sm text-muted-foreground">
            Securely connect your Solana wallet to start tracking your DeFi positions.
          </p>
        </div>

        <div className="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
          <div className="mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
            2
          </div>
          <h3 className="text-lg font-semibold mb-2">Auto-Detection</h3>
          <p className="text-sm text-muted-foreground">
            Automatically detect and display all your positions across supported protocols.
          </p>
        </div>

        <div className="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
          <div className="mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-bold">
            3
          </div>
          <h3 className="text-lg font-semibold mb-2">Real-Time Updates</h3>
          <p className="text-sm text-muted-foreground">
            Monitor your portfolio with live price updates and position changes.
          </p>
        </div>

        <div className="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
          <div className="mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
            4
          </div>
          <h3 className="text-lg font-semibold mb-2">Export & Analyze</h3>
          <p className="text-sm text-muted-foreground">
            Export your data for tax reporting and deeper portfolio analysis.
          </p>
        </div>
      </section>

      {/* Supported Protocols */}
      <section className="text-center">
        <h2 className="text-3xl font-bold mb-8">Supported Protocols</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {['Marinade', 'Kamino', 'Orca', 'Raydium', 'Jito', 'Marginfi', 'Drift', 'Meteora'].map((protocol) => (
            <div key={protocol} className="rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mx-auto mb-2"></div>
              <p className="text-sm font-medium">{protocol}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}