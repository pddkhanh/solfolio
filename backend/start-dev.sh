#!/bin/sh

# Generate Prisma client
echo "Generating Prisma client..."
pnpm exec prisma generate

# Run migrations
echo "Running database migrations..."
pnpm exec prisma migrate deploy

# Start both HTTP and gRPC servers
echo "Starting servers..."
pnpm run start:dev &
HTTP_PID=$!

pnpm run start:grpc &
GRPC_PID=$!

echo "HTTP server PID: $HTTP_PID"
echo "gRPC server PID: $GRPC_PID"

# Wait for both processes
wait $HTTP_PID $GRPC_PID