# SolFolio Prototype

A beautiful, production-ready prototype for the SolFolio Solana DeFi portfolio tracker application.

## Features

### Dashboard
- **Portfolio Overview**: Total value, 24h/7d/30d changes with live updates
- **Asset Allocation**: Interactive pie chart showing token distribution
- **Protocol Distribution**: Bar chart displaying value across different protocols
- **Active Positions**: Detailed list of all DeFi positions with expandable details
- **Recent Activity**: Transaction history with type indicators

### Positions Page
- Comprehensive list of all positions
- Filter by position type (staking, lending, LP)
- Quick stats overview
- Export functionality

### Yield Compare
- Browse yield opportunities across Solana DeFi
- Filter by risk level (low, medium, high)
- Sort by APY, TVL, or risk
- Detailed information for each opportunity

### Settings
- Notification preferences
- Display customization (currency, language, theme)
- Privacy & security controls
- Data management options

## Design Features

- **Modern DeFi Aesthetics**: Glass morphism effects, gradient overlays, smooth animations
- **Dark Mode First**: Optimized for dark theme with optional light mode
- **Responsive Design**: Mobile-first approach, works perfectly on all devices
- **Real-time Updates**: Simulated live data with smooth transitions
- **Interactive Charts**: Beautiful data visualizations using Recharts
- **Micro-interactions**: Hover effects, loading states, and animated transitions

## Tech Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Shadcn UI**: Beautiful, accessible components
- **Framer Motion**: Smooth animations
- **Recharts**: Data visualization

## Getting Started

### Prerequisites
- Node.js 22+ 
- npm or yarn

### Installation

1. Navigate to the prototype directory:
```bash
cd prototype
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
# or
npx next dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
prototype/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Dashboard
│   ├── positions/         # Positions page
│   ├── yield/            # Yield comparison
│   └── settings/         # Settings page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── *.tsx            # Feature components
├── lib/                  # Utilities and mock data
│   ├── mock-data/       # Mock data generators
│   └── utils.ts         # Helper functions
└── public/              # Static assets
```

## Mock Data

The prototype uses comprehensive mock data that simulates:
- Multiple DeFi protocols (Marinade, Kamino, Orca, etc.)
- Various position types (staking, lending, LP, farming)
- Real token prices and APYs
- Transaction history
- Yield opportunities

## Features Demonstrated

1. **Wallet Connection Flow**: Simulated wallet connection with dropdown menu
2. **Portfolio Tracking**: Complete overview of positions across protocols
3. **Data Visualization**: Interactive charts for asset allocation
4. **Responsive Tables**: Position lists that adapt to mobile screens
5. **Real-time Updates**: Simulated live price and value updates
6. **Export Functionality**: CSV export buttons (UI only)
7. **Settings Management**: Comprehensive preferences system

## Customization

The prototype is built with customization in mind:
- Colors can be adjusted in `tailwind.config.ts`
- Mock data can be modified in `lib/mock-data/generators.ts`
- Components are modular and easily extendable

## Production Considerations

This prototype demonstrates the UI/UX for SolFolio. For production:
1. Replace mock data with real blockchain integrations
2. Implement actual wallet adapter functionality
3. Add backend API connections
4. Implement data caching strategies
5. Add authentication if required
6. Set up monitoring and analytics

## Notes

- All data shown is mock data for demonstration purposes
- Wallet connection is simulated
- Export and claim functions are UI-only
- Optimized for modern browsers