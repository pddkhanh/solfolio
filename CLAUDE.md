# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SolFolio is a Solana DeFi portfolio tracker application currently in the planning phase. The project aims to provide a unified dashboard for tracking positions across multiple Solana DeFi protocols including Marinade, Kamino, Orca, Raydium, and others.

## Current Status

**Active Development** - Phase 1 in progress (1/15 tasks completed):
- Product Requirements Document: `docs/prd.md`
- Technical Architecture: `docs/tech-arch.md`
- Work Breakdown Structure: `docs/work-breakdown.md`
- Frontend initialized with Next.js 15, TypeScript, and Tailwind CSS

## Architecture Overview

### Planned Technology Stack

**Runtime**: Node.js 22+ LTS

**Frontend**: Next.js 15+ (App Router), TypeScript, Tailwind CSS, Shadcn UI, Solana Wallet Adapter

**Backend**: gRPC microservices architecture with:
- Protocol Buffers for service definitions
- WebSocket Gateway for real-time updates
- Multi-layer caching: Memory → Redis → PostgreSQL
- Docker containerization
- Envoy Proxy for gRPC-Web translation

**Blockchain Integration**:
- Helius RPC as primary provider
- Protocol-specific SDKs for Marinade, Kamino, Orca, Marginfi
- Jupiter Price API for token pricing

## Development Commands

Since the project hasn't been initialized yet, when setting up:

### Initial Setup (Phase 0)
```bash
# Install pnpm globally
npm install -g pnpm@9.14.2

# Create monorepo structure
mkdir -p apps/web apps/backend services packages/proto
cd apps/web && pnpm create next-app@latest . --typescript --tailwind --app
cd ../backend && pnpm init
```

### Future Development Commands (once initialized)
```bash
# Frontend
cd apps/web
pnpm run dev      # Development server
pnpm run build    # Production build
pnpm run lint     # Linting

# Backend services
cd services/[service-name]
pnpm run dev      # Development with nodemon
pnpm run build    # TypeScript compilation
pnpm test         # Run tests

# Protocol Buffers
cd packages/proto
pnpm run generate # Generate TypeScript/JS from .proto files

# Docker
docker-compose up -d     # Start all services
docker-compose logs -f   # View logs
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