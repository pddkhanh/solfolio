import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-3">About SolFolio</h3>
            <p className="text-sm text-muted-foreground">
              Track your DeFi positions across multiple Solana protocols in one unified dashboard.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/portfolio" className="text-muted-foreground hover:text-foreground transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/protocols" className="text-muted-foreground hover:text-foreground transition-colors">
                  Protocols
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Supported Protocols */}
          <div>
            <h3 className="font-semibold mb-3">Supported Protocols</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Marinade Finance</li>
              <li>Kamino Finance</li>
              <li>Orca</li>
              <li>Raydium</li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-muted-foreground hover:text-foreground transition-colors">
                  API
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/pddkhanh/solfolio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 SolFolio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}