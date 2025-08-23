# Product Requirements Document (PRD)
## Solana DeFi Portfolio Tracker

### 1. Executive Summary

**Product Name:** SolFolio (working title)

**Vision:** Build a comprehensive web application that enables Solana users to track all their DeFi positions across multiple protocols in one unified dashboard, solving the problem of fragmented asset visibility and helping users optimize their yield strategies.

**Problem Statement:** Solana DeFi users currently have no single place to view all their positions across different protocols. When users stake SOL on Marinade, deposit USDC in Kamino, or provide liquidity on Orca, these positions are scattered and easy to lose track of. Users need to visit multiple protocols individually to understand their complete portfolio composition and performance.

**Target Users:** 
- Active DeFi users on Solana who use multiple protocols
- Users with $1,000+ in DeFi positions
- Yield farmers seeking to optimize returns
- Users who want to track and manage risk across protocols

---

### 2. Goals and Success Metrics

#### Primary Goals
1. **Complete Visibility:** Users can see 100% of their DeFi positions in one place
2. **Time Saving:** Reduce time to check all positions from 10+ minutes to <30 seconds
3. **Position Discovery:** Help users identify forgotten or overlooked positions
4. **Yield Optimization:** Enable data-driven decisions on where to allocate capital

#### Success Metrics
- **Adoption Metrics:**
  - 1,000+ unique wallets connected within 3 months
  - 50+ daily active users by month 3
  - Average session duration >2 minutes

- **Product Metrics:**
  - Support for 10+ major Solana DeFi protocols
  - <3 second load time for portfolio data
  - 95% accuracy in position detection and valuation

- **Business Metrics:**
  - 10% conversion to premium features (Phase 2)
  - $10k+ in affiliate revenue by month 6

---

### 3. User Stories

#### Phase 1: Core Portfolio Tracking

**As a DeFi user, I want to:**
1. Connect my Solana wallet easily and securely
2. See all my token balances with current USD values
3. View my liquid staking positions (mSOL, jitoSOL, bSOL) with underlying SOL value
4. Track my lending positions across Marginfi, Kamino, and Solend
5. Monitor my LP positions with current value and composition
6. See my total portfolio value across all protocols
7. Export my portfolio data as CSV for tax/accounting purposes
8. Refresh my portfolio data with one click
9. View my portfolio performance over time (24h, 7d, 30d changes)

#### Phase 2: Yield Optimization

**As a yield optimizer, I want to:**
1. Compare current APYs across all staking providers
2. See the best lending rates for my tokens across protocols
3. View historical yield trends to make informed decisions
4. Get alerts when better yield opportunities arise
5. Calculate potential returns before moving positions
6. Understand the risk level of different yield strategies

#### Phase 3: Smart Recommendations

**As an advanced user, I want to:**
1. Receive personalized rebalancing suggestions
2. Get notifications about underperforming positions
3. See tax-optimized exit strategies
4. Track impermanent loss on LP positions
5. Receive risk alerts for concentrated positions

---

### 4. Functional Requirements

#### 4.1 Wallet Connection
- **Supported Wallets:** Phantom, Backpack, Solflare, Ledger
- **Multi-wallet:** Support viewing multiple wallets in one session
- **Read-only Mode:** Allow users to track any wallet address without connecting

#### 4.2 Protocol Integrations (Phase 1 Priority)

| Protocol | Position Types | Data Required |
|----------|---------------|---------------|
| **Marinade** | mSOL staking | Staked amount, rewards earned, current APY |
| **Jito** | jitoSOL staking | Staked amount, MEV rewards, APY |
| **BlazeStake** | bSOL staking | Staked amount, rewards, APY |
| **Kamino** | Vaults, Lending | Deposited amounts, earned fees, current APY |
| **Marginfi** | Lending/Borrowing | Supplied/borrowed amounts, interest earned/paid |
| **Orca** | Whirlpools, CLMM | LP token value, fees earned, position range |
| **Raydium** | Standard/Concentrated LP | Pool share, fees earned, IL calculation |
| **Meteora** | DLMM pools | Position value, fees earned, active bins |
| **Solend** | Lending | Deposits, interest earned, utilization |
| **Native Staking** | Stake accounts | Validator, amount, rewards, commission |

#### 4.3 Data Display Requirements

**Portfolio Overview:**
- Total portfolio value in USD
- 24h/7d/30d percentage changes
- Asset allocation pie chart
- Protocol distribution breakdown
- Top positions by value

**Position Details:**
- Protocol name and logo
- Position type (staking, lending, LP, etc.)
- Current value in USD and native tokens
- APY/APR (current and 7-day average)
- Rewards earned (claimable and accumulated)
- Time since deposit/stake
- One-click navigation to protocol interface

#### 4.4 Yield Comparison Dashboard

**Comparison Matrix:**
- Side-by-side APY comparison for similar strategies
- Risk indicators (TVL, time in market, audit status)
- Minimum deposit requirements
- Lock-up periods
- Auto-compound frequency

**Filters:**
- By asset type (SOL, USDC, etc.)
- By strategy (staking, lending, LP)
- By risk level (low, medium, high)
- By minimum APY threshold

---

### 5. Technical Requirements

#### 5.1 Frontend
- **Framework:** Next.js 15+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **State Management:** Zustand or Jotai
- **Wallet Integration:** Solana Wallet Adapter
- **Charts:** Recharts or Victory

#### 5.2 Backend/Data Layer
- **RPC Provider:** Helius (for enhanced APIs and DAS)
- **Edge Functions:** Vercel Edge for API routes
- **Caching:** Redis for yield data caching (5-minute TTL)
- **Database:** PostgreSQL for user preferences and historical data

#### 5.3 Blockchain Integration
- **SDKs Required:**
  - @solana/web3.js
  - @marinade.finance/marinade-ts-sdk
  - @kamino-finance/kliquidity-sdk
  - @orca-so/whirlpools-sdk
  - @marginfi/marginfi-client-v2
  - Jupiter Price API

#### 5.4 Performance Requirements
- Initial load: <3 seconds
- Portfolio refresh: <5 seconds
- Wallet connection: <2 seconds
- Support for wallets with 100+ positions
- Mobile responsive design

---

### 6. Non-Functional Requirements

#### 6.1 Security
- No private keys ever leave user's wallet
- All wallet interactions through official adapter
- Read-only by default
- HTTPS only
- Rate limiting on API endpoints

#### 6.2 Reliability
- 99.9% uptime
- Graceful handling of RPC failures
- Fallback data sources for prices
- Offline mode showing cached data

#### 6.3 Usability
- One-click wallet connection
- No sign-up required for basic features
- Intuitive navigation
- Mobile-first responsive design
- Dark/light mode support

---

### 7. MVP Scope (Phase 1 - Week 1-3)

**Must Have:**
- Wallet connection (Phantom, Backpack)
- Token balance display with USD values
- Liquid staking positions (Marinade, Jito)
- Lending positions (Kamino, Marginfi)
- Basic LP positions (Orca, Raydium)
- Total portfolio value calculation
- Manual refresh button

**Nice to Have:**
- Historical performance charts
- CSV export
- Multi-wallet support
- More protocol integrations

**Out of Scope for MVP:**
- Yield comparison features
- Recommendations engine
- Transaction history
- Mobile app
- Portfolio alerts

---

### 8. Future Phases Roadmap

**Phase 2 (Month 2-3): Yield Optimization**
- Comprehensive yield comparison dashboard
- Historical APY tracking
- Risk scoring system
- Advanced filtering and sorting
- Bookmark favorite strategies

**Phase 3 (Month 3-4): Intelligence Layer**
- Personalized recommendations
- Rebalancing suggestions
- IL tracking and alerts
- Gas optimization strategies
- Email/Telegram notifications

**Phase 4 (Month 5-6): Premium Features**
- Portfolio analytics and reports
- Tax reporting tools
- Automated rebalancing (transactions)
- Priority data refresh
- API access for developers

---

### 9. Monetization Strategy

1. **Freemium Model:**
   - Free: Basic tracking, 5-minute data refresh
   - Premium ($10/month): Real-time data, alerts, advanced analytics

2. **Affiliate Revenue:**
   - Referral fees from protocols (0.1-0.5% of deposits)
   - Featured placement in yield comparison

3. **B2B Services:**
   - API access for other developers
   - White-label solution for protocols

---

### 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| RPC rate limiting | High | Use multiple RPC providers, implement caching |
| Protocol API changes | Medium | Abstract protocol interactions, maintain adapters |
| Incorrect position valuations | High | Multiple data sources, user feedback mechanism |
| Low user adoption | High | Focus on SEO, partner with protocols, influencer marketing |
| Competition from established players | Medium | Focus on Solana-specific features, faster iteration |

---

### 11. Launch Strategy

**Week 1-3:** MVP Development
**Week 4:** Internal testing and bug fixes
**Week 5:** Beta launch to 50 selected users
**Week 6:** Iterate based on feedback
**Week 7:** Public launch on Twitter/X
**Week 8+:** Weekly feature releases based on user feedback

---

### 12. Appendix

**Competitor Analysis:**
- Step Finance (Solana native, but complex UI)
- Zapper (Multi-chain, limited Solana support)
- DeBank (Good UX, minimal Solana coverage)
- Sonar Watch (Solana focused, limited protocol coverage)

**Key Differentiators:**
- Comprehensive Solana protocol coverage
- Clean, intuitive interface
- Focus on yield optimization
- Free tier with generous limits
- Fast, accurate position detection