.PHONY: help setup dev up down restart logs clean build test lint proto migrate seed

# Default target
help:
	@echo "SolFolio Development Commands"
	@echo "=============================="
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make setup          - Initial project setup (run this first)"
	@echo "  make install        - Install all dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start all services in development mode"
	@echo "  make up             - Start Docker containers"
	@echo "  make down           - Stop Docker containers"
	@echo "  make restart        - Restart all services"
	@echo "  make logs           - View logs from all services"
	@echo "  make logs-[service] - View logs for specific service (e.g., logs-backend)"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate     - Run database migrations"
	@echo "  make db-seed        - Seed database with test data"
	@echo "  make db-reset       - Reset database (drop, create, migrate, seed)"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test           - Run all tests"
	@echo "  make test-unit      - Run unit tests"
	@echo "  make test-e2e       - Run end-to-end tests"
	@echo "  make lint           - Run linters"
	@echo "  make format         - Format code"
	@echo ""
	@echo "Building:"
	@echo "  make build          - Build all Docker images"
	@echo "  make build-prod     - Build production images"
	@echo "  make proto          - Generate code from proto files"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean          - Clean up containers, volumes, and generated files"
	@echo "  make ps             - Show running containers"
	@echo "  make shell-[service]- Open shell in service container"
	@echo ""
	@echo "Tools:"
	@echo "  make adminer        - Open database admin UI (http://localhost:8082)"
	@echo "  make redis-commander- Open Redis admin UI (http://localhost:8083)"

# Setup and installation
setup:
	@echo "Setting up SolFolio development environment..."
	@./scripts/setup.sh

install:
	@echo "Installing dependencies..."
	pnpm install
	cd frontend && pnpm install
	cd backend && pnpm install
	cd websocket && pnpm install

# Development commands
dev: up
	@echo "Starting development environment..."
	@echo "Frontend: http://localhost:3000"
	@echo "gRPC-Web: http://localhost:8080"
	@echo "WebSocket: ws://localhost:8081"
	@echo "Database Admin: http://localhost:8082"

up:
	docker-compose -f docker-compose.dev.yml up -d

down:
	docker-compose -f docker-compose.dev.yml down

restart: down up

stop:
	docker-compose -f docker-compose.dev.yml stop

# Logging commands
logs:
	docker-compose -f docker-compose.dev.yml logs -f

logs-backend:
	docker-compose -f docker-compose.dev.yml logs -f backend

logs-frontend:
	docker-compose -f docker-compose.dev.yml logs -f frontend

logs-websocket:
	docker-compose -f docker-compose.dev.yml logs -f websocket

logs-postgres:
	docker-compose -f docker-compose.dev.yml logs -f postgres

logs-redis:
	docker-compose -f docker-compose.dev.yml logs -f redis

logs-envoy:
	docker-compose -f docker-compose.dev.yml logs -f envoy

# Database commands
db-migrate:
	@echo "Running database migrations..."
	cd backend && pnpm run db:migrate

db-seed:
	@echo "Seeding database..."
	cd backend && pnpm run db:seed

db-reset:
	@echo "Resetting database..."
	cd backend && pnpm run db:reset

db-console:
	docker exec -it solfolio-postgres psql -U solfolio -d solfolio_dev

# Testing commands
test:
	@echo "Running all tests..."
	cd frontend && pnpm test
	cd backend && pnpm test
	cd websocket && pnpm test

test-unit:
	@echo "Running unit tests..."
	cd frontend && pnpm run test:unit
	cd backend && pnpm run test:unit
	cd websocket && pnpm run test:unit

test-e2e:
	@echo "Running end-to-end tests..."
	pnpm run test:e2e

test-watch:
	cd backend && pnpm run test:watch

# Code quality
lint:
	@echo "Running linters..."
	cd frontend && pnpm run lint
	cd backend && pnpm run lint
	cd websocket && pnpm run lint

format:
	@echo "Formatting code..."
	cd frontend && pnpm run format
	cd backend && pnpm run format
	cd websocket && pnpm run format

# Building
build:
	@echo "Building Docker images..."
	docker-compose -f docker-compose.dev.yml build

build-prod:
	@echo "Building production images..."
	docker-compose -f docker-compose.prod.yml build

build-frontend:
	cd frontend && pnpm run build

build-backend:
	cd backend && pnpm run build

proto:
	@echo "Generating code from proto files..."
	cd proto && ./generate.sh

# Container management
ps:
	docker-compose -f docker-compose.dev.yml ps

shell-backend:
	docker exec -it solfolio-backend /bin/sh

shell-frontend:
	docker exec -it solfolio-frontend /bin/sh

shell-websocket:
	docker exec -it solfolio-websocket /bin/sh

shell-postgres:
	docker exec -it solfolio-postgres /bin/bash

shell-redis:
	docker exec -it solfolio-redis /bin/sh

# Development tools
adminer:
	@echo "Opening Adminer (Database Admin)..."
	@echo "URL: http://localhost:8082"
	@echo "System: PostgreSQL"
	@echo "Server: postgres"
	@echo "Username: solfolio"
	@echo "Password: devpassword"
	@echo "Database: solfolio_dev"
	docker-compose -f docker-compose.dev.yml --profile tools up -d adminer

redis-commander:
	@echo "Opening Redis Commander..."
	@echo "URL: http://localhost:8083"
	docker-compose -f docker-compose.dev.yml --profile tools up -d redis-commander

# Cleanup
clean:
	@echo "Cleaning up..."
	docker-compose -f docker-compose.dev.yml down -v
	rm -rf frontend/node_modules frontend/.next frontend/out
	rm -rf backend/node_modules backend/dist
	rm -rf websocket/node_modules websocket/dist
	rm -rf node_modules
	find . -name "*.log" -type f -delete
	find . -name ".DS_Store" -type f -delete

clean-docker:
	@echo "Cleaning Docker resources..."
	docker-compose -f docker-compose.dev.yml down -v --rmi all

# Health checks
health:
	@echo "Checking service health..."
	@curl -f http://localhost:3000 > /dev/null 2>&1 && echo "✓ Frontend is healthy" || echo "✗ Frontend is not responding"
	@curl -f http://localhost:8080 > /dev/null 2>&1 && echo "✓ Envoy is healthy" || echo "✗ Envoy is not responding"
	@curl -f http://localhost:8081 > /dev/null 2>&1 && echo "✓ WebSocket is healthy" || echo "✗ WebSocket is not responding"
	@docker exec solfolio-postgres pg_isready > /dev/null 2>&1 && echo "✓ PostgreSQL is healthy" || echo "✗ PostgreSQL is not responding"
	@docker exec solfolio-redis redis-cli ping > /dev/null 2>&1 && echo "✓ Redis is healthy" || echo "✗ Redis is not responding"

# Environment setup
env:
	@test -f .env || cp .env.example .env
	@echo ".env file is ready. Please update it with your API keys."

# Quick development shortcuts
d: dev
u: up
s: stop
r: restart
l: logs
c: clean