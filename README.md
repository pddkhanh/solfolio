# SolFolio - Solana DeFi Portfolio Tracker

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-green.svg)
![Docker](https://img.shields.io/badge/docker-%3E%3D20.10-blue.svg)

A comprehensive portfolio tracker for Solana DeFi protocols, providing unified dashboard views of positions across Marinade, Kamino, Orca, and other major protocols.

## 🚀 Features

- **Multi-Protocol Support**: Track positions across Marinade, Kamino, Orca, Raydium, and more
- **Real-time Updates**: WebSocket-powered live position and price updates
- **Unified Dashboard**: Single interface for all your DeFi positions
- **Performance Optimized**: Multi-layer caching with sub-second response times
- **Production Ready**: Docker-based architecture with monitoring and observability

## 📋 Documentation

- [Product Requirements Document](docs/prd.md) - Detailed product specifications
- [Technical Architecture](docs/tech-arch.md) - System design and architecture
- [Work Breakdown Structure](docs/work-breakdown.md) - Development tasks and timeline

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, gRPC, Protocol Buffers
- **Real-time**: Socket.io WebSocket server
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis with multi-layer caching
- **Infrastructure**: Docker, Docker Compose, Envoy Proxy
- **Blockchain**: Helius RPC, Solana Web3.js, Protocol SDKs

## 📦 Prerequisites

- Node.js 22+ 
- pnpm 9+ (will be installed automatically if not present)
- Docker & Docker Compose
- Git

## 🏗️ Project Structure

```
solfolio/
├── frontend/         # Next.js frontend application
├── backend/          # gRPC backend service
├── websocket/        # Real-time WebSocket server
├── proto/            # Protocol Buffer definitions
├── docker/           # Docker configuration files
│   ├── envoy/        # Envoy proxy configuration
│   └── postgres/     # Database initialization scripts
├── scripts/          # Development and deployment scripts
└── docs/             # Project documentation
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Helius](https://www.helius.dev/) for Solana RPC infrastructure
- [Marinade](https://marinade.finance/) for liquid staking protocol
- [Kamino](https://kamino.finance/) for lending and vaults
- [Jupiter](https://jup.ag/) for price aggregation

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Status**: 🚧 Under Active Development
