.PHONY: help dev up down restart logs clean test lint status

# Default - show help
help:
	@echo "SolFolio Development Commands"
	@echo "============================="
	@echo ""
	@echo "Quick Start:"
	@echo "  make dev       - Start all services in development mode"
	@echo "  make down      - Stop all services"
	@echo "  make restart   - Restart all services"
	@echo "  make logs      - View logs from all services"
	@echo "  make status    - Show service status and URLs"
	@echo ""
	@echo "Testing:"
	@echo "  make test      - Run all tests (frontend + backend + E2E)"
	@echo "  make test-fe   - Run frontend unit tests only"
	@echo "  make test-be   - Run backend unit tests only"
	@echo "  make test-e2e  - Run E2E tests only"
	@echo "  make test-watch - Run tests in watch mode"
	@echo "  make test-manual - Start services for manual testing"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint      - Run linters"
	@echo "  make format    - Format code"
	@echo "  make typecheck - Run TypeScript type checking"
	@echo ""
	@echo "Debugging:"
	@echo "  make health    - Check service health"
	@echo "  make debug     - Show debug info (ports, containers, etc)"
	@echo "  make shell-be  - Open backend container shell"
	@echo "  make shell-fe  - Open frontend container shell"
	@echo "  make shell-db  - Open PostgreSQL shell"
	@echo "  make logs-be   - View backend logs"
	@echo "  make logs-fe   - View frontend logs"
	@echo ""
	@echo "Other:"
	@echo "  make build     - Build Docker images"
	@echo "  make clean     - Clean up containers and volumes"
	@echo "  make install   - Install dependencies"
	@echo "  make env       - Setup .env file"

# === DEVELOPMENT ===
dev: check-env
	@docker-compose -f docker-compose.dev.yml up -d
	@echo ""
	@echo "🚀 Services started:"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:3001/health"
	@echo "  WebSocket: ws://localhost:8081"
	@echo ""

up: dev

down:
	@docker-compose -f docker-compose.dev.yml down

restart: down dev

logs:
	@docker-compose -f docker-compose.dev.yml logs -f

logs-%:
	@docker-compose -f docker-compose.dev.yml logs -f $*

logs-be:
	@docker-compose -f docker-compose.dev.yml logs -f backend

logs-fe:
	@docker-compose -f docker-compose.dev.yml logs -f frontend

logs-db:
	@docker-compose -f docker-compose.dev.yml logs -f postgres

# === STATUS & DEBUG ===
status:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "🔍 Service Status"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@docker-compose -f docker-compose.dev.yml ps
	@echo ""
	@echo "📍 Service URLs:"
	@echo "  Frontend:    http://localhost:3000"
	@echo "  Backend API: http://localhost:3001"
	@echo "  Health:      http://localhost:3001/health"
	@echo "  WebSocket:   ws://localhost:3001"
	@echo "  gRPC:        localhost:50051"
	@echo "  Envoy:       http://localhost:8080"
	@echo "  PostgreSQL:  localhost:5432"
	@echo "  Redis:       localhost:6379"
	@echo ""
	@$(MAKE) health

debug:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "🐛 Debug Information"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Docker containers:"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "Network:"
	@docker network ls | grep solfolio
	@echo ""
	@echo "Volumes:"
	@docker volume ls | grep solfolio
	@echo ""
	@echo "Port usage:"
	@netstat -tuln 2>/dev/null | grep -E ":(3000|3001|5432|6379|8080|50051)" || lsof -i -P -n | grep -E ":(3000|3001|5432|6379|8080|50051)" 2>/dev/null || echo "Cannot check ports (install netstat or lsof)"

# === TESTING ===
test:
	@echo "Running all tests..."
	@echo "━━━━━━━━━━━━━━━━━━━"
	@$(MAKE) test-fe
	@echo ""
	@$(MAKE) test-be
	@echo ""
	@$(MAKE) test-e2e
	@echo "━━━━━━━━━━━━━━━━━━━"
	@echo "✅ All tests completed!"

test-fe:
	@echo "Frontend tests..."
	@cd frontend && pnpm test -- --forceExit

test-be:
	@echo "Backend tests..."
	@cd backend && pnpm test

test-e2e:
	@echo "E2E tests..."
	@cd frontend && pnpm run test:e2e

test-watch:
	@echo "Select service to watch tests:"
	@echo "1) Frontend"
	@echo "2) Backend"
	@read -p "Choice: " choice; \
	case $$choice in \
		1) cd frontend && pnpm run test:watch ;; \
		2) cd backend && pnpm run test:watch ;; \
		*) echo "Invalid choice" ;; \
	esac

test-manual: dev
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "🧪 Manual Testing Environment Ready"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "📍 Test these URLs:"
	@echo "  Frontend:    http://localhost:3000"
	@echo "  Backend API: http://localhost:3001"
	@echo "  Health:      http://localhost:3001/health"
	@echo ""
	@echo "💡 Testing checklist:"
	@echo "  ✓ Wallet connection (Phantom, Solflare, etc)"
	@echo "  ✓ Portfolio loading"
	@echo "  ✓ Real-time updates via WebSocket"
	@echo "  ✓ Protocol integrations"
	@echo "  ✓ Performance metrics"
	@echo ""
	@echo "📊 Monitor logs with:"
	@echo "  make logs-fe  - Frontend logs"
	@echo "  make logs-be  - Backend logs"
	@echo "  make logs     - All logs"
	@echo ""
	@$(MAKE) health

# === CODE QUALITY ===
lint:
	@echo "Linting..."
	@cd frontend && pnpm run lint
	@cd backend && pnpm run lint

format:
	@echo "Formatting..."
	@cd frontend && pnpm run format
	@cd backend && pnpm run format

typecheck:
	@echo "Type checking..."
	@cd frontend && pnpm run typecheck
	@cd backend && pnpm run build --noEmit

# === BUILD ===
build:
	@docker-compose -f docker-compose.dev.yml build

build-prod:
	@docker-compose -f docker-compose.prod.yml build

# === HEALTH CHECK ===
health:
	@echo "Checking services..."
	@curl -sf http://localhost:3000 > /dev/null 2>&1 && echo "✅ Frontend" || echo "❌ Frontend"
	@curl -sf http://localhost:3001/health > /dev/null 2>&1 && echo "✅ Backend API" || echo "❌ Backend API (not running or check logs)"
	@curl -sf http://localhost:8080 > /dev/null 2>&1 && echo "✅ Envoy Proxy" || echo "❌ Envoy Proxy"
	@docker exec solfolio-postgres pg_isready > /dev/null 2>&1 && echo "✅ PostgreSQL" || echo "❌ PostgreSQL"
	@docker exec solfolio-redis redis-cli ping > /dev/null 2>&1 && echo "✅ Redis" || echo "❌ Redis"

# === UTILITIES ===
shell-fe:
	@docker exec -it solfolio-frontend /bin/sh

shell-be:
	@docker exec -it solfolio-backend /bin/sh

shell-db:
	@docker exec -it solfolio-postgres psql -U solfolio -d solfolio_dev

clean:
	@docker-compose -f docker-compose.dev.yml down -v
	@echo "✅ Cleaned Docker volumes"

clean-all: clean
	@rm -rf */node_modules */.next */dist
	@echo "✅ Cleaned all build artifacts"

# === SETUP ===
install:
	@pnpm install
	@cd frontend && pnpm install
	@cd backend && pnpm install

env:
	@test -f .env || cp .env.example .env
	@echo "✅ .env file ready - update with your API keys"

check-env:
	@test -f .env || (echo "❌ Missing .env file. Run 'make env' first" && exit 1)

# === SHORTCUTS ===
d: dev
s: down
r: restart
l: logs
t: test
c: clean