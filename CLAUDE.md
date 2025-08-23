# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SolFolio is a Solana DeFi portfolio tracker application currently in the planning phase. The project aims to provide a unified dashboard for tracking positions across multiple Solana DeFi protocols including Marinade, Kamino, Orca, Raydium, and others.

## Current Status

**Active Development** - Phase 1 in progress (9/15 tasks completed - 60%):
- Product Requirements Document: `docs/prd.md`
- Technical Architecture: `docs/tech-arch.md`
- Work Breakdown Structure: `docs/work-breakdown.md`
- Frontend initialized with Next.js 15, TypeScript, and Tailwind CSS
- Wallet connection fully implemented with tests
- E2E testing infrastructure set up with Playwright
- Comprehensive Web3 testing documentation: `WEB3_TESTING_SETUP.md`

## Architecture Overview

### Planned Technology Stack

**Runtime**: Node.js 22+ LTS

**Frontend**: Next.js 15+ (App Router), TypeScript, Tailwind CSS, Shadcn UI, Solana Wallet Adapter

**Backend**: NestJS with microservices architecture:
- NestJS framework with TypeScript
- Built-in gRPC support with Protocol Buffers
- WebSocket Gateway using Socket.io for real-time updates
- Multi-layer caching: Memory → Redis → PostgreSQL
- Health checks with @nestjs/terminus
- Docker containerization
- Envoy Proxy for gRPC-Web translation

**Blockchain Integration**:
- Helius RPC as primary provider
- Protocol-specific SDKs for Marinade, Kamino, Orca, Marginfi
- Jupiter Price API for token pricing

## Development Commands

### Quick Start with Make
```bash
# Essential commands
make dev        # Start all services
make down       # Stop all services
make test       # Run all tests (frontend + backend + E2E)
make health     # Check service health

# Testing
make test-fe    # Frontend unit tests only
make test-be    # Backend unit tests only
make test-e2e   # E2E tests only
make test-watch # Watch mode (interactive)

# Utilities
make lint       # Run linters
make format     # Format code
make logs       # View all logs
make logs-backend # View specific service logs
make shell-be   # Backend container shell
make shell-fe   # Frontend container shell
make clean      # Clean Docker volumes

# Shortcuts
make d          # dev
make s          # down
make t          # test
make l          # logs
```

### Frontend Commands
```bash
cd frontend

# Development
pnpm run dev          # Development server
pnpm run build        # Production build
pnpm run lint         # Linting
pnpm run format       # Format code with Prettier

# Testing
pnpm run test         # Unit tests with Jest
pnpm run test:watch   # Unit tests in watch mode
pnpm run test:coverage # Unit tests with coverage report
pnpm run test:e2e     # E2E tests with Playwright
pnpm run test:e2e:ui  # E2E tests in UI mode (recommended for debugging)
pnpm run test:e2e:debug # E2E tests in debug mode

# First time E2E setup
npx playwright install  # Install Playwright browsers
```


### Backend Commands
```bash
cd backend

# Development
pnpm run start:dev    # Development server with hot-reload
pnpm run start:debug  # Debug mode
pnpm run start:prod   # Production mode

# Building
pnpm run build        # Build for production

# Testing
pnpm run test         # Run unit tests
pnpm run test:watch   # Run tests in watch mode
pnpm run test:cov     # Generate test coverage
pnpm run test:e2e     # Run e2e tests

# Code quality
pnpm run lint         # Run ESLint
pnpm run format       # Format code with Prettier

# Health Check Endpoints
# http://localhost:3001/health       - Full health check
# http://localhost:3001/health/ping  - Simple ping
# http://localhost:3001/health/ready - Readiness check
# http://localhost:3001/health/live  - Liveness check
```

## Project Structure (Planned)

```
solfolio/
├── apps/
│   ├── web/              # Next.js frontend
│   └── backend/          # API Gateway
├── services/             # gRPC microservices
│   ├── portfolio/        # Portfolio aggregation
│   ├── blockchain/       # Blockchain data fetching
│   ├── cache/           # Cache management
│   └── websocket/       # Real-time updates
├── packages/
│   ├── proto/           # Protocol Buffer definitions
│   └── shared/          # Shared utilities
└── infrastructure/      # Docker, Kubernetes configs
```

## Key Development Guidelines

1. **Use Latest Stable Versions**: Always use the latest stable versions of dependencies when initializing or updating packages. This ensures we have the latest features, security updates, and performance improvements
2. **Protocol Integration Priority**: Start with Marinade and Kamino as they represent the largest TVL
3. **Caching Strategy**: Implement aggressive caching with 5-minute TTL for price data, 1-minute for positions
4. **Error Handling**: Use circuit breakers for RPC calls, implement retry logic with exponential backoff
5. **Testing**: Aim for 80% code coverage, focus on protocol adapter integration tests
   - Unit tests timeout: 5 seconds per test (fail fast)
   - Tests showing as slow: > 1 second (will show warning)
   - E2E tests timeout: 30 seconds per test
   - Always use `--forceExit` flag to prevent hanging tests
6. **Performance**: Target <2s page load time, <100ms for cached data retrieval

## Implementation Phases

Follow the iterative approach in `docs/work-breakdown.md`:
- Phase 0 (Days 1-2): Project setup and infrastructure ✅ (45% complete)
- Phase 1 (Days 3-4): Basic working app with wallet connection (in progress)
- Phase 2 (Days 5-6): Token balances and prices
- Phase 3 (Days 7-9): First protocol integration (Marinade)
- Phase 4 (Days 10-12): Multi-protocol support
- Phase 5 (Days 13-14): Real-time updates
- Phase 6 (Days 15-16): Advanced features
- Phase 7 (Days 17-18): Performance and polish
- Phase 8 (Days 19-20): Production deployment
- Phase 9 (Days 21-22): Monitoring and launch

## Important Considerations

- **RPC Rate Limits**: Helius free tier has 100 RPS limit - implement request batching
- **WebSocket Connections**: Limited to 100 concurrent connections on free tier
- **Database**: Use connection pooling, max 20 connections for PostgreSQL
- **Security**: Never expose RPC API keys in frontend, use environment variables
- **Monitoring**: Implement Prometheus metrics from day one for all services

## Git Guidelines

**NEVER perform destructive Git operations:**
- Never use `git push --force` or `git push -f`
- Never use `git reset --hard` on shared branches
- Never rewrite history on branches that others may be using
- Never delete branches without confirming with the user
- Always use safe operations like `git revert` for undoing changes on shared branches
- Always create new branches for features rather than working directly on main/master