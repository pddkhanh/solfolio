# Environment Configuration Guide

This guide explains how to set up environment variables for the SolFolio application.

## Quick Start

1. **Copy the environment template files:**
```bash
# Root directory configuration (for Docker)
cp .env.example .env

# Frontend configuration (for local development)
cp frontend/.env.local.example frontend/.env.local
```

2. **Get a Helius API Key (Required):**
   - Sign up at [https://www.helius.dev/](https://www.helius.dev/)
   - Create a new project
   - Copy your API key

3. **Update the environment files with your API key:**
   - Replace `your_helius_api_key_here` in both `.env` and `frontend/.env.local`

4. **Verify your configuration:**
```bash
make check-env
```

## Environment Files Explained

### Root `.env` File
Located at the project root, this file is used by Docker Compose to configure all services.

**Key variables:**
- `HELIUS_API_KEY`: Your Helius API key (backend services)
- `NEXT_PUBLIC_HELIUS_RPC_URL`: RPC endpoint for the frontend
- `NEXT_PUBLIC_SOLANA_NETWORK`: Network to connect to (devnet/mainnet-beta)
- `SOLANA_NETWORK`: Backend network configuration

### Frontend `.env.local` File
Located in `frontend/.env.local`, this file is used for local frontend development.

**Key variables:**
- `NEXT_PUBLIC_HELIUS_RPC_URL`: Your Helius RPC endpoint
- `NEXT_PUBLIC_SOLANA_NETWORK`: Network to connect to

## Development Workflows

### Using Docker (Recommended)
```bash
# Setup environment
make env
make check-env

# Start services
make dev  # or make up

# Services will be available at:
# - Frontend: http://localhost:3000
# - gRPC-Web: http://localhost:8080
# - WebSocket: ws://localhost:8081
```

### Local Development (No Docker)
```bash
# Setup environment
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local with your API key

# Start frontend only
cd frontend
pnpm run dev

# Or use the Makefile
make dev-local
```

## Network Configuration

### Devnet (Testing - Recommended)
Use Devnet for development and testing with test SOL:
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_HELIUS_RPC_URL=https://rpc-devnet.helius.xyz/?api-key=YOUR_KEY_HERE
```

### Mainnet (Production)
Use Mainnet for production with real SOL:
```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY_HERE
```

## Environment Variable Priority

When running with Docker, environment variables are loaded in this order:
1. Docker Compose `environment:` section (highest priority)
2. `.env` file
3. Default values in `docker-compose.dev.yml`

For the frontend:
1. `.env.local` (highest priority)
2. `.env`
3. Default values in code

## Troubleshooting

### "Unable to add filesystem: <illegal path>" Error
This error occurs when environment variables are not properly configured. Make sure:
1. `.env` file exists and contains valid values
2. `NEXT_PUBLIC_HELIUS_RPC_URL` is set correctly
3. Docker Compose is using the `.env` file

### Wallet Connection Issues
If wallets can't connect:
1. Check `NEXT_PUBLIC_SOLANA_NETWORK` matches your intended network
2. Verify `NEXT_PUBLIC_HELIUS_RPC_URL` is valid
3. Ensure your Helius API key is active

### Checking Configuration
```bash
# Check if environment is set up correctly
make check-env

# View current environment variables in Docker
docker-compose -f docker-compose.dev.yml config

# Check frontend environment
cd frontend && pnpm run dev
# Look for environment variables in the console output
```

## Security Notes

⚠️ **Never commit API keys to version control!**

- `.env` is gitignored by default
- `.env.local` is gitignored by default
- Always use `.env.example` as a template
- Keep your production API keys secure

## Additional Resources

- [Helius Documentation](https://docs.helius.dev/)
- [Solana RPC Methods](https://docs.solana.com/api/http)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)