# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SolFolio is a Solana DeFi portfolio tracker application currently in the planning phase. The project aims to provide a unified dashboard for tracking positions across multiple Solana DeFi protocols including Marinade, Kamino, Orca, Raydium, and others.

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

## Specialized Claude Agents

### UI Developer Agent
When working on designing or prototyping UI/UX improvements, components, or visual aspects, use the specialized defi-ui-designer agent:

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