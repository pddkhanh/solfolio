.PHONY: help dev up down restart logs clean test lint

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
	@echo ""
	@echo "Testing:"
	@echo "  make test      - Run all tests (frontend + backend + E2E)"
	@echo "  make test-fe   - Run frontend unit tests only"
	@echo "  make test-be   - Run backend unit tests only"
	@echo "  make test-e2e  - Run E2E tests only"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint      - Run linters"
	@echo "  make format    - Format code"
	@echo ""
	@echo "Other:"
	@echo "  make build     - Build Docker images"
	@echo "  make clean     - Clean up containers and volumes"
	@echo "  make health    - Check service health"
	@echo "  make shell-be  - Open backend container shell"
	@echo "  make shell-fe  - Open frontend container shell"

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

# === CODE QUALITY ===
lint:
	@echo "Linting..."
	@cd frontend && pnpm run lint
	@cd backend && pnpm run lint

format:
	@echo "Formatting..."
	@cd frontend && pnpm run format
	@cd backend && pnpm run format

# === BUILD ===
build:
	@docker-compose -f docker-compose.dev.yml build

build-prod:
	@docker-compose -f docker-compose.prod.yml build

# === HEALTH CHECK ===
health:
	@echo "Checking services..."
	@curl -sf http://localhost:3000 > /dev/null && echo "✅ Frontend" || echo "❌ Frontend"
	@curl -sf http://localhost:3001/health > /dev/null && echo "✅ Backend" || echo "❌ Backend"
	@curl -sf http://localhost:8081 > /dev/null && echo "✅ WebSocket" || echo "❌ WebSocket"
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