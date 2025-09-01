# Real-time Updates Implementation (TASK-UI-023)

## Overview
This directory contains all components and utilities for real-time updates in SolFolio, including WebSocket connections, price tickers, transaction alerts, and smooth 60 FPS animations.

## Components

### 🔌 ConnectionStatus
Displays WebSocket connection state with visual indicators and animations.

```tsx
import { ConnectionStatus } from '@/components/realtime';

<ConnectionStatus
  status="connected"
  reconnectAttempt={2}
  maxReconnectAttempts={5}
  onReconnect={handleReconnect}
  showDetails
/>
```

**Features:**
- Visual connection states (connecting, connected, disconnected, error)
- Animated indicators (pulse, spin)
- Reconnection attempt counter
- Manual reconnect button

### 💹 PriceTicker
Animated price display with real-time updates and trend indicators.

```tsx
import { PriceTicker } from '@/components/realtime';

<PriceTicker
  symbol="SOL"
  price={98.45}
  previousPrice={95.20}
  changePercent24h={3.41}
  showTrend
/>
```

**Features:**
- Smooth price transitions
- Color-coded changes (green up, red down)
- Percentage change badges
- Flash effects on updates

### 🔔 TransactionAlert
Toast notifications for blockchain transactions with status tracking.

```tsx
import { useTransactionAlerts } from '@/components/realtime';

const { showTransaction, updateTransaction } = useTransactionAlerts();

// Show pending transaction
const txId = showTransaction({
  type: 'swap',
  status: 'pending',
  amount: 10,
  token: 'SOL',
  message: 'Swapping SOL for USDC'
});

// Update to success
updateTransaction(txId, { status: 'success' });
```

**Features:**
- Multiple transaction types (send, receive, swap, stake, etc.)
- Status tracking (pending, success, error)
- Auto-dismiss on completion
- Explorer links

### 📍 UpdateIndicator
Visual indicators for data updates with various animation styles.

```tsx
import { UpdateIndicator } from '@/components/realtime';

<UpdateIndicator
  isUpdating={true}
  lastUpdateTime={new Date()}
  type="pulse"
  color="green"
  showTime
/>
```

**Animation Types:**
- `pulse` - Expanding ring animation
- `glow` - Shadow glow effect
- `spin` - Rotating refresh icon
- `badge` - Activity badge

### 💰 ValueUpdateAnimation
Smooth number animations for portfolio values with change indicators.

```tsx
import { ValueUpdateAnimation } from '@/components/realtime';

<ValueUpdateAnimation
  value={10234.56}
  previousValue={9876.54}
  format="currency"
  showChange
  size="xl"
/>
```

**Features:**
- Count-up animations
- Format options (currency, percent, compact)
- Change indicators with percentages
- Color-coded directions

## Hooks

### useWebSocket
Main WebSocket connection management hook.

```tsx
import { useWebSocket } from '@/hooks/useWebSocket';

const {
  connectionStatus,
  isConnected,
  subscribeToPrices,
  onPriceUpdate,
  reconnect
} = useWebSocket();
```

### useAnimationPerformance
Monitor animation performance and ensure 60 FPS.

```tsx
import { useAnimationPerformance } from '@/hooks/useAnimationPerformance';

const { fps, isSmooth, droppedFrames } = useAnimationPerformance();
```

## Context Provider

### WebSocketProvider
Global WebSocket context for real-time data.

```tsx
import { WebSocketProvider } from '@/contexts/WebSocketContext';

<WebSocketProvider>
  <App />
</WebSocketProvider>
```

## Performance Optimizations

### 60 FPS Guidelines
1. **Use transform and opacity only** - GPU-accelerated properties
2. **Batch DOM updates** - Use React's batching
3. **Throttle high-frequency updates** - Limit to 60 updates/second
4. **Virtual scrolling** - For large lists
5. **will-change CSS** - Hint browser about animations

### Animation Best Practices
```tsx
// ✅ Good - GPU accelerated
animate={{ x: 100, opacity: 0.5 }}

// ❌ Bad - Triggers layout
animate={{ left: 100, width: 200 }}
```

### Reduced Motion Support
```tsx
const reducedMotion = useReducedMotion();
const animations = reducedMotion ? {} : {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};
```

## WebSocket Events

### Client → Server
- `subscribe:prices` - Subscribe to price updates
- `subscribe:wallet` - Subscribe to wallet updates
- `unsubscribe:prices` - Unsubscribe from prices
- `unsubscribe:wallet` - Unsubscribe from wallet

### Server → Client
- `price:update` - Token price updates
- `wallet:update` - Wallet balance/transaction updates
- `position:update` - DeFi position updates
- `subscription:confirmed` - Subscription acknowledged

## Usage Example

```tsx
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { 
  ConnectionStatus,
  PriceTicker,
  TransactionAlert,
  ValueUpdateAnimation 
} from '@/components/realtime';

function Portfolio() {
  const { connectionStatus, prices } = useWebSocketContext();
  const { showTransaction } = useTransactionAlerts();
  
  return (
    <div>
      <ConnectionStatus status={connectionStatus} />
      
      <ValueUpdateAnimation
        value={portfolioValue}
        format="currency"
        showChange
      />
      
      {tokens.map(token => (
        <PriceTicker
          key={token.mint}
          symbol={token.symbol}
          price={prices.get(token.mint)?.price || 0}
          showTrend
        />
      ))}
    </div>
  );
}

export default function App() {
  return (
    <WebSocketProvider>
      <Portfolio />
      <Toaster position="bottom-right" />
    </WebSocketProvider>
  );
}
```

## Testing

### Performance Testing
```bash
# Run with performance monitor
npm run dev
# Navigate to /demo/realtime
# Enable performance monitor in DevTools
```

### Animation Testing
1. Check FPS meter in Chrome DevTools
2. Use Performance tab to record animations
3. Verify no dropped frames
4. Test on low-end devices

### WebSocket Testing
```bash
# Mock WebSocket server
npm run mock:ws

# Test reconnection
# 1. Start app
# 2. Stop mock server
# 3. Verify reconnection attempts
# 4. Restart server
# 5. Verify auto-reconnect
```

## Configuration

### Environment Variables
```env
# WebSocket server URL
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Enable performance monitoring
NEXT_PUBLIC_ENABLE_PERF_MONITOR=true

# Animation quality (high, medium, low)
NEXT_PUBLIC_ANIMATION_QUALITY=high
```

### Animation Settings
```tsx
// lib/animations/config.ts
export const animationConfig = {
  duration: {
    fast: 0.15,
    normal: 0.25,
    slow: 0.35,
  },
  ease: {
    default: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
  spring: {
    default: { stiffness: 500, damping: 30 },
  },
};
```

## Troubleshooting

### Low FPS
- Reduce animation complexity
- Enable hardware acceleration
- Check for memory leaks
- Use `will-change` CSS property

### WebSocket Issues
- Check server URL configuration
- Verify CORS settings
- Check firewall/proxy settings
- Monitor network tab in DevTools

### Memory Leaks
- Cleanup effect dependencies
- Unsubscribe from events
- Cancel animation frames
- Clear timers/intervals

## Browser Support
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

## License
MIT