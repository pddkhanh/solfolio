#!/bin/bash

# Script to generate TypeScript/JavaScript client code from proto files

set -e

echo "Generating gRPC-Web client code..."

PROTO_DIR="./proto"
FRONTEND_OUT_DIR="./frontend/lib/grpc"

# Create output directory if it doesn't exist
mkdir -p $FRONTEND_OUT_DIR

# Generate JavaScript and TypeScript definitions for frontend
npx grpc_tools_node_protoc \
  --js_out=import_style=commonjs,binary:$FRONTEND_OUT_DIR \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:$FRONTEND_OUT_DIR \
  --proto_path=$PROTO_DIR \
  $PROTO_DIR/portfolio.proto

# Alternative using protobuf-ts (more modern approach)
npx protoc \
  --plugin=./node_modules/.bin/protoc-gen-ts \
  --ts_out=$FRONTEND_OUT_DIR \
  --ts_opt=client_grpc1 \
  --proto_path=$PROTO_DIR \
  $PROTO_DIR/portfolio.proto

echo "✅ gRPC-Web client code generated successfully!"