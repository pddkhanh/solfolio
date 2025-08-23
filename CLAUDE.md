# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SolFolio is a Solana DeFi portfolio tracker application currently in the planning phase. The project aims to provide a unified dashboard for tracking positions across multiple Solana DeFi protocols including Marinade, Kamino, Orca, Raydium, and others.

## Current Status

**Planning Phase** - The repository contains comprehensive documentation but no implementation yet:
- Product Requirements Document: `docs/prd.md`
- Technical Architecture: `docs/tech-arch.md`
- Work Breakdown Structure: `docs/work-breakdown.md`

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
# Create monorepo structure
mkdir -p apps/web apps/backend services packages/proto
cd apps/web && npx create-next-app@latest . --typescript --tailwind --app
cd ../backend && npm init -y
```

### Future Development Commands (once initialized)
```bash
# Frontend
cd apps/web
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Linting

# Backend services
cd services/[service-name]
npm run dev      # Development with nodemon
npm run build    # TypeScript compilation
npm test         # Run tests

# Protocol Buffers
cd packages/proto
npm run generate # Generate TypeScript/JS from .proto files

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

1. **Protocol Integration Priority**: Start with Marinade and Kamino as they represent the largest TVL
2. **Caching Strategy**: Implement aggressive caching with 5-minute TTL for price data, 1-minute for positions
3. **Error Handling**: Use circuit breakers for RPC calls, implement retry logic with exponential backoff
4. **Testing**: Aim for 80% code coverage, focus on protocol adapter integration tests
5. **Performance**: Target <2s page load time, <100ms for cached data retrieval

## Implementation Phases

Follow the work breakdown structure in `docs/work-breakdown.md`:
- Days 1-2: Project setup and infrastructure
- Days 3-5: Backend infrastructure (Docker, DB, Redis, gRPC)
- Days 6-9: Blockchain integration layer
- Days 10-12: Cache and real-time systems
- Days 13-16: Frontend application
- Days 17-18: API integration and testing
- Day 19: Monitoring setup
- Days 20-21: Production deployment
- Day 22: Final testing and launch

## Important Considerations

- **RPC Rate Limits**: Helius free tier has 100 RPS limit - implement request batching
- **WebSocket Connections**: Limited to 100 concurrent connections on free tier
- **Database**: Use connection pooling, max 20 connections for PostgreSQL
- **Security**: Never expose RPC API keys in frontend, use environment variables
- **Monitoring**: Implement Prometheus metrics from day one for all services