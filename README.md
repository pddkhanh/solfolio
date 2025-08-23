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

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/pddkhanh/solfolio.git
cd solfolio
```

### 2. Run the setup script
```bash
./scripts/setup.sh
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env and add your Helius API key
```

### 4. Start development environment
```bash
make dev
```

### 5. Access the application
- Frontend: http://localhost:3000
- gRPC-Web: http://localhost:8080
- WebSocket: ws://localhost:8081
- Database Admin: http://localhost:8082
- Redis Commander: http://localhost:8083 (run `make redis-commander`)

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

## 🔧 Development Commands

```bash
# Development
make dev            # Start all services
make down           # Stop all services
make restart        # Restart all services
make logs           # View logs from all services
make logs-backend   # View backend logs
make logs-frontend  # View frontend logs

# Database
make db-migrate     # Run database migrations
make db-seed        # Seed database with test data
make db-reset       # Reset database

# Testing
make test           # Run all tests
make test-unit      # Run unit tests
make test-e2e       # Run end-to-end tests

# Code Quality
make lint           # Run linters
make format         # Format code

# Utilities
make shell-backend  # Open shell in backend container
make shell-frontend # Open shell in frontend container
make health         # Check service health
make clean          # Clean up containers and volumes
```

Run `make help` to see all available commands.

## 🔑 Environment Variables

Key environment variables (see `.env.example` for full list):

- `HELIUS_API_KEY` - Your Helius RPC API key (required)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `NEXT_PUBLIC_GRPC_WEB_URL` - gRPC-Web endpoint
- `NEXT_PUBLIC_WEBSOCKET_URL` - WebSocket server URL

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific test suites
make test-unit      # Unit tests
make test-e2e       # End-to-end tests

# Run tests with coverage
cd backend && pnpm run test:coverage
cd frontend && pnpm run test:coverage
```

## 📊 Monitoring

The application includes built-in monitoring:

- Health check endpoints for all services
- Prometheus metrics (when enabled)
- Structured logging with Winston
- Performance metrics tracking

## 🚢 Deployment

Production deployment guide coming soon. The application is designed to run on:

- AWS Lightsail or EC2
- Docker Swarm or Kubernetes
- CloudFlare for CDN and DDoS protection

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit using conventional commits (`feat:`, `fix:`, etc.)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

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

Current Phase: Phase 0 - Project Setup ✅
