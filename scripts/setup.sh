#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo "================================"
    echo "$1"
    echo "================================"
    echo ""
}

# Check for required tools
check_requirements() {
    print_header "Checking Requirements"
    
    local missing_tools=()
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        missing_tools+=("Node.js")
    else
        print_info "Node.js $(node --version) found"
    fi
    
    # Check for pnpm
    if ! command -v pnpm &> /dev/null; then
        missing_tools+=("pnpm")
    else
        print_info "pnpm $(pnpm --version) found"
    fi
    
    # Check for Docker
    if ! command -v docker &> /dev/null; then
        missing_tools+=("Docker")
    else
        print_info "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) found"
    fi
    
    # Check for Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        missing_tools+=("Docker Compose")
    else
        if command -v docker-compose &> /dev/null; then
            print_info "Docker Compose $(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1) found"
        else
            print_info "Docker Compose $(docker compose version | cut -d' ' -f4) found"
        fi
    fi
    
    # Check for git
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    else
        print_info "git $(git --version | cut -d' ' -f3) found"
    fi
    
    # Report missing tools
    if [ ${#missing_tools[@]} -gt 0 ]; then
        print_error "The following required tools are missing:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        echo ""
        echo "Please install the missing tools and run this script again."
        exit 1
    fi
    
    print_info "All requirements satisfied!"
}

# Create necessary directories
create_directories() {
    print_header "Creating Project Structure"
    
    # Create main directories if they don't exist
    directories=(
        "frontend"
        "backend"
        "websocket"
        "proto"
        "docker/postgres"
        "docker/envoy"
        "scripts"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_info "Created directory: $dir"
        else
            print_info "Directory exists: $dir"
        fi
    done
}

# Setup environment file
setup_env() {
    print_header "Setting Up Environment"
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_info "Created .env file from .env.example"
            print_warning "Please update .env with your API keys before running the application"
        else
            print_error ".env.example not found"
            exit 1
        fi
    else
        print_info ".env file already exists"
    fi
}

# Create placeholder files for Docker
create_docker_files() {
    print_header "Creating Docker Configuration Files"
    
    # Create Envoy configuration
    if [ ! -f docker/envoy/envoy.yaml ]; then
        cat > docker/envoy/envoy.yaml << 'EOF'
admin:
  address:
    socket_address: { address: 0.0.0.0, port_value: 9901 }

static_resources:
  listeners:
    - name: listener_0
      address:
        socket_address: { address: 0.0.0.0, port_value: 8080 }
      filter_chains:
        - filters:
          - name: envoy.filters.network.http_connection_manager
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
              codec_type: auto
              stat_prefix: ingress_http
              route_config:
                name: local_route
                virtual_hosts:
                  - name: local_service
                    domains: ["*"]
                    routes:
                      - match: { prefix: "/" }
                        route:
                          cluster: grpc_service
                          timeout: 0s
                          max_stream_duration:
                            grpc_timeout_header_max: 0s
                    cors:
                      allow_origin_string_match:
                        - prefix: "*"
                      allow_methods: GET, PUT, DELETE, POST, OPTIONS
                      allow_headers: keep-alive,user-agent,cache-control,content-type,content-transfer-encoding,custom-header-1,x-accept-content-transfer-encoding,x-accept-response-streaming,x-user-agent,x-grpc-web,grpc-timeout
                      max_age: "1728000"
                      expose_headers: custom-header-1,grpc-status,grpc-message
              http_filters:
                - name: envoy.filters.http.grpc_web
                  typed_config:
                    "@type": type.googleapis.com/envoy.extensions.filters.http.grpc_web.v3.GrpcWeb
                - name: envoy.filters.http.cors
                  typed_config:
                    "@type": type.googleapis.com/envoy.extensions.filters.http.cors.v3.Cors
                - name: envoy.filters.http.router
                  typed_config:
                    "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router
  clusters:
    - name: grpc_service
      connect_timeout: 0.25s
      type: logical_dns
      http2_protocol_options: {}
      lb_policy: round_robin
      load_assignment:
        cluster_name: cluster_0
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: backend
                      port_value: 50051
EOF
        print_info "Created docker/envoy/envoy.yaml"
    else
        print_info "docker/envoy/envoy.yaml already exists"
    fi
    
    # Create PostgreSQL initialization script
    if [ ! -f docker/postgres/init.sql ]; then
        cat > docker/postgres/init.sql << 'EOF'
-- Initial database setup for SolFolio

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema
CREATE SCHEMA IF NOT EXISTS solfolio;

-- Set search path
SET search_path TO solfolio, public;

-- Create tables will be handled by migrations
-- This file is for any initial database setup needed

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA solfolio TO solfolio;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA solfolio TO solfolio;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA solfolio TO solfolio;

-- Initial setup complete
SELECT 'Database initialization complete' as status;
EOF
        print_info "Created docker/postgres/init.sql"
    else
        print_info "docker/postgres/init.sql already exists"
    fi
}

# Create placeholder package.json files
create_package_files() {
    print_header "Creating Package Files"
    
    # Frontend package.json
    if [ ! -f frontend/package.json ]; then
        cat > frontend/package.json << 'EOF'
{
  "name": "solfolio-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write ."
  },
  "dependencies": {},
  "devDependencies": {}
}
EOF
        print_info "Created frontend/package.json"
    else
        print_info "frontend/package.json already exists"
    fi
    
    # Backend package.json
    if [ ! -f backend/package.json ]; then
        cat > backend/package.json << 'EOF'
{
  "name": "solfolio-backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nodemon --watch src --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src"
  },
  "dependencies": {},
  "devDependencies": {}
}
EOF
        print_info "Created backend/package.json"
    else
        print_info "backend/package.json already exists"
    fi
    
    # WebSocket package.json
    if [ ! -f websocket/package.json ]; then
        cat > websocket/package.json << 'EOF'
{
  "name": "solfolio-websocket",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nodemon --watch src --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src"
  },
  "dependencies": {},
  "devDependencies": {}
}
EOF
        print_info "Created websocket/package.json"
    else
        print_info "websocket/package.json already exists"
    fi
}

# Create Dockerfile placeholders
create_dockerfiles() {
    print_header "Creating Dockerfiles"
    
    # Frontend Dockerfile.dev
    if [ ! -f frontend/Dockerfile.dev ]; then
        cat > frontend/Dockerfile.dev << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
EOF
        print_info "Created frontend/Dockerfile.dev"
    else
        print_info "frontend/Dockerfile.dev already exists"
    fi
    
    # Backend Dockerfile.dev
    if [ ! -f backend/Dockerfile.dev ]; then
        cat > backend/Dockerfile.dev << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Expose port
EXPOSE 50051

# Start development server
CMD ["npm", "run", "dev"]
EOF
        print_info "Created backend/Dockerfile.dev"
    else
        print_info "backend/Dockerfile.dev already exists"
    fi
    
    # WebSocket Dockerfile.dev
    if [ ! -f websocket/Dockerfile.dev ]; then
        cat > websocket/Dockerfile.dev << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Expose port
EXPOSE 8081

# Start development server
CMD ["npm", "run", "dev"]
EOF
        print_info "Created websocket/Dockerfile.dev"
    else
        print_info "websocket/Dockerfile.dev already exists"
    fi
}

# Install pnpm dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    # Install pnpm globally if not present
    if ! command -v pnpm &> /dev/null; then
        print_info "Installing pnpm globally..."
        npm install -g pnpm@9.14.2
    fi
    
    # Install root dependencies
    if [ -f package.json ]; then
        print_info "Installing root dependencies..."
        pnpm install
    fi
    
    print_info "Dependencies installation complete"
    print_warning "Service-specific dependencies will be installed when services are initialized"
}

# Main setup function
main() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║     SolFolio Development Setup         ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    
    # Run setup steps
    check_requirements
    create_directories
    setup_env
    create_docker_files
    create_package_files
    create_dockerfiles
    install_dependencies
    
    print_header "Setup Complete!"
    
    echo "Next steps:"
    echo "1. Update .env file with your API keys (especially HELIUS_API_KEY)"
    echo "2. Run 'make dev' to start the development environment"
    echo "3. Visit http://localhost:3000 to see the application"
    echo ""
    echo "Useful commands:"
    echo "  make help    - Show all available commands"
    echo "  make dev     - Start development environment"
    echo "  make logs    - View logs from all services"
    echo "  make down    - Stop all services"
    echo ""
    print_info "Happy coding! 🚀"
}

# Run main function
main