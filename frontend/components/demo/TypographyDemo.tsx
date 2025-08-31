'use client'

import React from 'react'

export default function TypographyDemo() {
  const walletAddress = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV'
  const balance = '1,234.567890'
  const percentageChange = '+12.34%'

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Typography Scale Section */}
        <section className="space-y-8">
          <h1 className="text-h1 text-gradient-primary">Typography System</h1>
          
          <div className="space-y-6 rounded-lg bg-bg-secondary p-8">
            <h2 className="text-h2 text-text-secondary">Font Scale</h2>
            
            <div className="space-y-4">
              <div className="flex items-baseline gap-4">
                <span className="text-caption w-24">Display</span>
                <p className="text-display">64px Display Text</p>
              </div>
              
              <div className="flex items-baseline gap-4">
                <span className="text-caption w-24">Heading 1</span>
                <h1 className="text-h1">48px Heading One</h1>
              </div>
              
              <div className="flex items-baseline gap-4">
                <span className="text-caption w-24">Heading 2</span>
                <h2 className="text-h2">36px Heading Two</h2>
              </div>
              
              <div className="flex items-baseline gap-4">
                <span className="text-caption w-24">Heading 3</span>
                <h3 className="text-h3">30px Heading Three</h3>
              </div>
              
              <div className="flex items-baseline gap-4">
                <span className="text-caption w-24">Heading 4</span>
                <h4 className="text-h4">24px Heading Four</h4>
              </div>
              
              <div className="flex items-baseline gap-4">
                <span className="text-caption w-24">Heading 5</span>
                <h5 className="text-h5">20px Heading Five</h5>
              </div>
              
              <div className="flex items-baseline gap-4">
                <span className="text-caption w-24">Heading 6</span>
                <h6 className="text-h6">18px Heading Six</h6>
              </div>
            </div>
          </div>
        </section>

        {/* Body Text Section */}
        <section className="space-y-6 rounded-lg bg-bg-secondary p-8">
          <h2 className="text-h2 text-text-secondary">Body Text</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-caption mb-2">Body Large (18px)</p>
              <p className="text-body-lg">
                This is large body text at 18px. Perfect for important paragraphs and primary content that needs emphasis.
              </p>
            </div>
            
            <div>
              <p className="text-caption mb-2">Body Default (16px)</p>
              <p className="text-body">
                This is default body text at 16px. The standard size for most content, ensuring optimal readability across all devices.
              </p>
            </div>
            
            <div>
              <p className="text-caption mb-2">Body Small (14px)</p>
              <p className="text-body-sm">
                This is small body text at 14px. Used for secondary information, descriptions, and supporting content.
              </p>
            </div>
            
            <div>
              <p className="text-caption mb-2">Body Extra Small (12px)</p>
              <p className="text-body-xs">
                This is extra small body text at 12px. Reserved for timestamps, labels, and tertiary information.
              </p>
            </div>
          </div>
        </section>

        {/* Special Styles Section */}
        <section className="space-y-6 rounded-lg bg-bg-secondary p-8">
          <h2 className="text-h2 text-text-secondary">Special Styles</h2>
          
          <div className="space-y-6">
            {/* Caption */}
            <div>
              <p className="text-caption">CAPTION TEXT - UPPERCASE 12PX</p>
              <p className="text-body-sm text-text-muted">Used for labels and metadata</p>
            </div>
            
            {/* Code/Monospace */}
            <div>
              <p className="text-caption mb-2">Code & Monospace</p>
              <code className="text-code block rounded bg-bg-tertiary p-3">
                const solanaRPC = &quot;https://api.mainnet-beta.solana.com&quot;
              </code>
            </div>
            
            {/* Wallet Address */}
            <div>
              <p className="text-caption mb-2">Wallet Address</p>
              <p className="wallet-address rounded bg-bg-tertiary p-3">
                {walletAddress}
              </p>
            </div>
            
            {/* Numbers */}
            <div>
              <p className="text-caption mb-2">Number Display</p>
              <div className="flex items-baseline gap-6">
                <span className="number-display text-2xl">{balance}</span>
                <span className="value-display text-lg text-success">{percentageChange}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Font Weights Section */}
        <section className="space-y-6 rounded-lg bg-bg-secondary p-8">
          <h2 className="text-h2 text-text-secondary">Font Weights</h2>
          
          <div className="space-y-3 text-body-lg">
            <p className="font-normal">Regular (400) - Default body text weight</p>
            <p className="font-medium">Medium (500) - Slightly emphasized text</p>
            <p className="font-semibold">Semibold (600) - Moderately bold text</p>
            <p className="font-bold">Bold (700) - Strong emphasis text</p>
          </div>
        </section>

        {/* Text Colors Section */}
        <section className="space-y-6 rounded-lg bg-bg-secondary p-8">
          <h2 className="text-h2 text-text-secondary">Text Colors</h2>
          
          <div className="space-y-3 text-body-lg">
            <p className="text-primary">Primary text color - Main content</p>
            <p className="text-secondary">Secondary text color - Supporting content</p>
            <p className="text-muted">Muted text color - Disabled or tertiary</p>
            <p className="text-disabled">Disabled text color - Inactive elements</p>
          </div>
        </section>

        {/* Gradient Text Section */}
        <section className="space-y-6 rounded-lg bg-bg-secondary p-8">
          <h2 className="text-h2 text-text-secondary">Gradient Text</h2>
          
          <div className="space-y-4">
            <h3 className="text-h3 text-gradient-purple">Purple Gradient Text</h3>
            <h3 className="text-h3 text-gradient-green">Green Gradient Text</h3>
            <h3 className="text-h3 text-gradient-primary">Primary Gradient Text</h3>
          </div>
        </section>

        {/* Links Section */}
        <section className="space-y-6 rounded-lg bg-bg-secondary p-8">
          <h2 className="text-h2 text-text-secondary">Links</h2>
          
          <div className="space-y-3 text-body-lg">
            <p>
              This is a paragraph with a <a href="#" className="link">standard link</a> that shows the primary link style.
            </p>
            <p>
              This paragraph contains a <a href="#" className="link-subtle">subtle link</a> for less prominent navigation.
            </p>
          </div>
        </section>

        {/* Text Truncation Section */}
        <section className="space-y-6 rounded-lg bg-bg-secondary p-8">
          <h2 className="text-h2 text-text-secondary">Text Truncation</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-caption mb-2">Single Line Truncation</p>
              <p className="text-truncate text-body">
                This is a very long text that will be truncated with an ellipsis when it exceeds the container width. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
            
            <div>
              <p className="text-caption mb-2">Two Line Truncation</p>
              <p className="text-truncate-2 text-body">
                This is a longer paragraph that will be truncated after two lines. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
              </p>
            </div>
            
            <div>
              <p className="text-caption mb-2">Three Line Truncation</p>
              <p className="text-truncate-3 text-body">
                This is an even longer paragraph that will be truncated after three lines. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
              </p>
            </div>
          </div>
        </section>

        {/* Responsive Typography */}
        <section className="space-y-6 rounded-lg bg-bg-secondary p-8">
          <h2 className="text-h2 text-text-secondary">Responsive Typography</h2>
          
          <div className="space-y-4">
            <p className="text-caption">Resize browser to see responsive adjustments</p>
            <h1 className="text-display">
              <span className="block text-body-sm text-text-muted sm:hidden">Mobile: 64px</span>
              <span className="hidden text-body-sm text-text-muted sm:block">Desktop: 72px</span>
              Display Text
            </h1>
          </div>
        </section>
      </div>
    </div>
  )
}