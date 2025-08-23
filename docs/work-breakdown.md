# SolFolio MVP Work Breakdown Structure (Iterative Approach)

## Development Philosophy
**Deliver working features incrementally** - Each phase produces a deployable, testable feature that provides value. We build vertical slices through the entire stack rather than horizontal layers.

## Progress Tracker
- **Phase 0**: 9/20 tasks completed (45%) ✅ [KEEP EXISTING]
- **Phase 1**: 9/15 tasks completed (60%) - Basic Working App (Day 3-4)
- **Phase 2**: 0/18 tasks - Token Balances & Prices (Day 5-6)  
- **Phase 3**: 0/20 tasks - First Protocol Integration (Day 7-9)
- **Phase 4**: 0/18 tasks - Multi-Protocol Support (Day 10-12)
- **Phase 5**: 0/16 tasks - Real-time Updates (Day 13-14)
- **Phase 6**: 0/14 tasks - Advanced Features (Day 15-16)
- **Phase 7**: 0/16 tasks - Performance & Polish (Day 17-18)
- **Phase 8**: 0/18 tasks - Production Deployment (Day 19-20)
- **Phase 9**: 0/12 tasks - Monitoring & Launch (Day 21-22)

**Total**: 18/167 tasks (10.8%)

---

## Phase 0: Project Setup & Infrastructure (Day 1-2) [KEEP EXISTING]

### 0.1 Repository & Version Control
- [x] **TASK-001** Create GitHub repository "solfolio" with README (0.5h) ✅
- [x] **TASK-002** Set up .gitignore for Node.js, Docker, .env files (0.5h) ✅
- [ ] **TASK-003** Create branch protection rules for main branch (0.5h)
- [x] **TASK-004** Set up conventional commits with commitlint (1h) ✅
- [x] **TASK-005** Create initial project structure folders (1h) ✅

### 0.2 AWS Lightsail Setup
- [ ] **TASK-006** Create AWS Lightsail instance (Ubuntu 22.04, 4GB RAM) (1h)
- [ ] **TASK-007** Configure SSH access and create SSH keys (0.5h)
- [ ] **TASK-008** Install Docker and Docker Compose on Lightsail (1h)
- [ ] **TASK-009** Configure firewall rules (ports 80, 443, 3000, 50051, 8081) (1h)
- [ ] **TASK-010** Point domain to Lightsail IP (0.5h)

### 0.3 CloudFlare Configuration
- [ ] **TASK-011** Add domain to CloudFlare (0.5h)
- [ ] **TASK-012** Configure CloudFlare SSL (Full strict mode) (0.5h)
- [ ] **TASK-013** Set up CloudFlare firewall rules (1h)
- [ ] **TASK-014** Configure CloudFlare for WebSocket support (0.5h)
- [ ] **TASK-015** Set up CloudFlare page rules for caching (1h)

### 0.4 Development Environment
- [x] **TASK-016** Create docker-compose.dev.yml file (2h) ✅
- [x] **TASK-017** Create .env.example with all required variables (1h) ✅
- [x] **TASK-018** Write Makefile for common commands (1h) ✅
- [x] **TASK-019** Create development setup script (setup.sh) (1h) ✅
- [x] **TASK-020** Test local Docker environment startup (1h) ✅

---

## Phase 1: Basic Working Application (Day 3-4)
**Goal**: Working web app with wallet connection and basic UI

### 1.1 Next.js Frontend Setup
- [x] **TASK-021** Initialize Next.js 15 app with TypeScript in /frontend (1h) ✅
- [x] **TASK-022** Configure Tailwind CSS and Shadcn UI (1h) ✅
- [x] **TASK-023** Create basic layout with header and main content area (1.5h) ✅
- [ ] **TASK-024** Add dark/light mode toggle (1h)
- [x] **TASK-025** Create responsive navigation component (1h) ✅

### 1.2 Wallet Integration
- [x] **TASK-026** Install and configure Solana wallet adapter (1h) ✅
- [x] **TASK-027** Create wallet connection button component (1.5h) ✅
- [x] **TASK-028** Implement wallet disconnect and switching - WITH TESTS (1h) ✅
- [x] **TASK-029** Display connected wallet address - WITH TESTS (0.5h) ✅
- [x] **TASK-030** Add wallet connection persistence - WITH TESTS (1h) ✅

### 1.3 Basic Backend API
- [ ] **TASK-031** Create simple Express.js backend in /backend (1h)
- [ ] **TASK-032** Set up TypeScript and basic project structure (1h)
- [ ] **TASK-033** Create health check endpoint (0.5h)
- [ ] **TASK-034** Add CORS configuration for frontend (0.5h)
- [ ] **TASK-035** Create Dockerfile for backend (1h)

**Deliverable**: Users can visit site, connect wallet, see their address

---

## Phase 2: Token Balances & Prices (Day 5-6)
**Goal**: Display user's token balances with USD values

### 2.1 Blockchain Connection
- [ ] **TASK-036** Set up Helius RPC connection in backend (1h)
- [ ] **TASK-037** Create connection manager with retry logic (1.5h)
- [ ] **TASK-038** Implement rate limiting for RPC calls (1h)
- [ ] **TASK-039** Add connection health monitoring (1h)

### 2.2 Token Balance Fetching
- [ ] **TASK-040** Create endpoint to fetch wallet token accounts (2h)
- [ ] **TASK-041** Parse SPL token balances (1.5h)
- [ ] **TASK-042** Fetch token metadata (name, symbol, decimals) (1.5h)
- [ ] **TASK-043** Handle native SOL balance (1h)

### 2.3 Price Integration
- [ ] **TASK-044** Integrate Jupiter Price API (1.5h)
- [ ] **TASK-045** Create price fetching service (1h)
- [ ] **TASK-046** Calculate USD values for all tokens (1h)
- [ ] **TASK-047** Implement basic in-memory price caching (1h)

### 2.4 Frontend Display
- [ ] **TASK-048** Create portfolio overview component (2h)
- [ ] **TASK-049** Build token list component with icons (2h)
- [ ] **TASK-050** Add USD value calculations and display (1h)
- [ ] **TASK-051** Implement loading and error states (1h)
- [ ] **TASK-052** Add manual refresh button (0.5h)
- [ ] **TASK-053** Format numbers and currencies properly (1h)

**Deliverable**: Users can see all their token balances with USD values

---

## Phase 3: First Protocol Integration - Marinade (Day 7-9)
**Goal**: Detect and display Marinade staking positions

### 3.1 Database Setup
- [ ] **TASK-054** Set up PostgreSQL container in Docker (1h)
- [ ] **TASK-055** Create database schema with Prisma (2h)
- [ ] **TASK-056** Design tables for positions and cache (1.5h)
- [ ] **TASK-057** Set up database migrations (1h)
- [ ] **TASK-058** Create seed data for testing (1h)

### 3.2 Marinade Integration
- [ ] **TASK-059** Install Marinade SDK (0.5h)
- [ ] **TASK-060** Create Marinade service class (1h)
- [ ] **TASK-061** Implement mSOL position detection (2h)
- [ ] **TASK-062** Calculate SOL value from mSOL (1.5h)
- [ ] **TASK-063** Fetch current Marinade APY (1h)
- [ ] **TASK-064** Add rewards calculation (1.5h)

### 3.3 API Enhancement
- [ ] **TASK-065** Create positions endpoint in API (1.5h)
- [ ] **TASK-066** Combine token balances with positions (1h)
- [ ] **TASK-067** Calculate total portfolio value (1h)
- [ ] **TASK-068** Store positions in database (1.5h)

### 3.4 Frontend Position Display
- [ ] **TASK-069** Create position card component (2h)
- [ ] **TASK-070** Display staking positions separately (1.5h)
- [ ] **TASK-071** Show APY and rewards (1h)
- [ ] **TASK-072** Add link to Marinade app (0.5h)
- [ ] **TASK-073** Update portfolio total with positions (1h)

**Deliverable**: Users can see their Marinade staking positions

---

## Phase 4: Multi-Protocol Support (Day 10-12)
**Goal**: Add Kamino, Jito, and basic LP positions

### 4.1 Redis Caching Layer
- [ ] **TASK-074** Set up Redis container (0.5h)
- [ ] **TASK-075** Create Redis connection manager (1h)
- [ ] **TASK-076** Implement cache service with TTL (1.5h)
- [ ] **TASK-077** Cache position data (1h)
- [ ] **TASK-078** Cache price data with 1-minute TTL (1h)

### 4.2 Protocol Adapter System
- [ ] **TASK-079** Create protocol adapter interface (1.5h)
- [ ] **TASK-080** Implement adapter registry (1h)
- [ ] **TASK-081** Refactor Marinade to use adapter pattern (1.5h)
- [ ] **TASK-082** Add parallel position fetching (1.5h)

### 4.3 Kamino Integration
- [ ] **TASK-083** Install Kamino SDK (0.5h)
- [ ] **TASK-084** Create Kamino adapter (1h)
- [ ] **TASK-085** Detect lending positions (2h)
- [ ] **TASK-086** Detect vault positions (2h)
- [ ] **TASK-087** Calculate position values and APY (1.5h)

### 4.4 Additional Protocols
- [ ] **TASK-088** Add Jito staking detection (jitoSOL) (2h)
- [ ] **TASK-089** Add basic Orca LP detection (2h)
- [ ] **TASK-090** Add basic Raydium LP detection (2h)
- [ ] **TASK-091** Update frontend to show all protocols (2h)

**Deliverable**: Users can see positions across multiple protocols

---

## Phase 5: Real-time Updates (Day 13-14)
**Goal**: Add WebSocket support for live updates

### 5.1 WebSocket Server
- [ ] **TASK-092** Create WebSocket server with Socket.io (1.5h)
- [ ] **TASK-093** Implement room-based subscriptions (1.5h)
- [ ] **TASK-094** Create WebSocket Docker container (1h)
- [ ] **TASK-095** Add authentication for WebSocket (1h)

### 5.2 Real-time Price Updates
- [ ] **TASK-096** Subscribe to Jupiter price stream (2h)
- [ ] **TASK-097** Broadcast price updates to clients (1.5h)
- [ ] **TASK-098** Implement Redis pub/sub for updates (1.5h)
- [ ] **TASK-099** Add connection status indicator (1h)

### 5.3 Frontend WebSocket Integration
- [ ] **TASK-100** Create WebSocket hook (1.5h)
- [ ] **TASK-101** Update prices in real-time (1.5h)
- [ ] **TASK-102** Add update animations (1h)
- [ ] **TASK-103** Handle reconnection logic (1h)

### 5.4 Position Change Detection
- [ ] **TASK-104** Monitor wallet for transaction changes (2h)
- [ ] **TASK-105** Detect position changes (2h)
- [ ] **TASK-106** Auto-refresh affected positions (1.5h)
- [ ] **TASK-107** Notify frontend of changes (1h)

**Deliverable**: Portfolio updates in real-time without refresh

---

## Phase 6: Advanced Features (Day 15-16)
**Goal**: Add charts, filters, and enhanced UX

### 6.1 Portfolio Analytics
- [ ] **TASK-108** Create portfolio pie chart (2h)
- [ ] **TASK-109** Add protocol breakdown view (1.5h)
- [ ] **TASK-110** Build historical value chart (2h)
- [ ] **TASK-111** Add 24h/7d/30d change indicators (1.5h)

### 6.2 Filtering and Sorting
- [ ] **TASK-112** Add token/position filters (1.5h)
- [ ] **TASK-113** Implement sort by value/APY/protocol (1h)
- [ ] **TASK-114** Add search functionality (1h)
- [ ] **TASK-115** Create hide small balances toggle (1h)

### 6.3 Export and Sharing
- [ ] **TASK-116** Implement CSV export (1.5h)
- [ ] **TASK-117** Add portfolio snapshot sharing (2h)
- [ ] **TASK-118** Create printable report view (1.5h)

### 6.4 Multi-wallet Support
- [ ] **TASK-119** Add wallet switching UI (1.5h)
- [ ] **TASK-120** Support multiple wallet tracking (2h)
- [ ] **TASK-121** Aggregate multi-wallet portfolios (1.5h)

**Deliverable**: Rich analytics and data management features

---

## Phase 7: Performance & Polish (Day 17-18)
**Goal**: Optimize performance and polish UI/UX

### 7.1 Performance Optimization
- [ ] **TASK-122** Implement request batching for RPC calls (2h)
- [ ] **TASK-123** Add CDN caching for static assets (1h)
- [ ] **TASK-124** Optimize database queries with indexes (1.5h)
- [ ] **TASK-125** Implement lazy loading for positions (1.5h)

### 7.2 gRPC Migration (Optional but recommended)
- [ ] **TASK-126** Set up basic gRPC server (2h)
- [ ] **TASK-127** Create portfolio.proto definitions (1.5h)
- [ ] **TASK-128** Implement gRPC service methods (2h)
- [ ] **TASK-129** Add Envoy proxy for gRPC-Web (1.5h)
- [ ] **TASK-130** Migrate frontend to use gRPC-Web (2h)

### 7.3 Error Handling & Recovery
- [ ] **TASK-131** Add comprehensive error boundaries (1h)
- [ ] **TASK-132** Implement retry mechanisms (1.5h)
- [ ] **TASK-133** Add fallback RPC providers (1.5h)
- [ ] **TASK-134** Create user-friendly error messages (1h)

### 7.4 UI Polish
- [ ] **TASK-135** Add loading skeletons (1.5h)
- [ ] **TASK-136** Implement smooth transitions (1h)
- [ ] **TASK-137** Polish responsive design (2h)

**Deliverable**: Fast, polished, production-ready application

---

## Phase 8: Production Deployment (Day 19-20)
**Goal**: Deploy to production environment

### 8.1 Production Configuration
- [ ] **TASK-138** Create production Docker Compose file (2h)
- [ ] **TASK-139** Set up production environment variables (1h)
- [ ] **TASK-140** Configure production database (1h)
- [ ] **TASK-141** Set up Redis persistence (1h)
- [ ] **TASK-142** Create backup scripts (1.5h)

### 8.2 CI/CD Pipeline
- [ ] **TASK-143** Create GitHub Actions workflow (2h)
- [ ] **TASK-144** Add automated testing (1.5h)
- [ ] **TASK-145** Set up Docker image building (1.5h)
- [ ] **TASK-146** Configure deployment to Lightsail (2h)

### 8.3 Security Hardening
- [ ] **TASK-147** Implement rate limiting (1.5h)
- [ ] **TASK-148** Add request validation (1h)
- [ ] **TASK-149** Set up CORS properly (0.5h)
- [ ] **TASK-150** Configure security headers (1h)

### 8.4 Testing
- [ ] **TASK-151** Write integration tests for APIs (2h)
- [ ] **TASK-152** Add E2E tests for critical flows (2h)
- [ ] **TASK-153** Perform load testing (1.5h)
- [ ] **TASK-154** Test failover scenarios (1.5h)
- [ ] **TASK-155** Security audit checklist (1h)

**Deliverable**: Application deployed to production

---

## Phase 9: Monitoring & Launch (Day 21-22)
**Goal**: Add monitoring and officially launch

### 9.1 Monitoring Setup
- [ ] **TASK-156** Set up Prometheus metrics (1.5h)
- [ ] **TASK-157** Configure Grafana dashboards (2h)
- [ ] **TASK-158** Add application logging with Winston (1.5h)
- [ ] **TASK-159** Set up error tracking (Sentry) (1.5h)
- [ ] **TASK-160** Configure uptime monitoring (1h)

### 9.2 Documentation
- [ ] **TASK-161** Write API documentation (2h)
- [ ] **TASK-162** Create user guide (1.5h)
- [ ] **TASK-163** Document deployment process (1h)
- [ ] **TASK-164** Write troubleshooting guide (1h)

### 9.3 Launch Activities
- [ ] **TASK-165** Final production testing (2h)
- [ ] **TASK-166** Create launch announcement (1h)
- [ ] **TASK-167** Submit to Solana ecosystem sites (1h)

**Deliverable**: Production application with monitoring

---

## Summary Comparison

### Old Approach Problems:
- Days 1-12: Building infrastructure with no visible output
- Day 13: Finally starting frontend
- Late integration = high risk
- No feedback loop until very late

### New Approach Benefits:
- **Day 3-4**: Working app with wallet connection (visible progress!)
- **Day 5-6**: Shows real token balances (immediate value!)
- **Day 7-9**: First protocol integration (incremental feature)
- **Every 2-3 days**: New visible feature deployed
- **Continuous integration**: Each phase integrates all layers
- **Early feedback**: Can test and validate assumptions from Day 3
- **Lower risk**: Problems discovered early
- **Better morale**: Constant visible progress

### Development Principles:
1. **Vertical Slices**: Each phase cuts through all layers (frontend → backend → blockchain)
2. **MVP First**: Get basic functionality working, then enhance
3. **Iterative Enhancement**: Start simple (Express), migrate to gRPC later if needed
4. **User Value**: Every phase delivers something users can see and use
5. **Fail Fast**: Discover integration issues early when they're cheaper to fix

### Key Differences:
- **Database**: Added only when needed (Phase 3) not upfront
- **Redis**: Added when caching becomes necessary (Phase 4)
- **gRPC**: Optional optimization in Phase 7 (can ship without it)
- **WebSockets**: Added as enhancement (Phase 5) not core requirement
- **Complex architecture**: Built incrementally as needed, not all upfront

This approach allows you to:
- Show progress to stakeholders every few days
- Get user feedback early
- Pivot if needed based on learnings
- Maintain momentum and morale
- Reduce technical risk through continuous integration