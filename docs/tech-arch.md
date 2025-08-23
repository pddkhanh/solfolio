# Technical Architecture Document
## Solana DeFi Portfolio Tracker

### 1. Executive Summary

This document outlines the technical architecture for SolFolio, a comprehensive Solana DeFi portfolio tracking application. The system uses Docker for both development and production environments, leverages gRPC and WebSockets for real-time data updates, and implements an intelligent caching strategy optimized for rapidly changing crypto data.

---

### 2. System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CloudFlare CDN/SSL                       │
│                   (SSL Termination & DDoS)                   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    Next.js Application                       │
│              (React + TypeScript + gRPC-Web)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│    gRPC Service Layer    │  │   WebSocket Gateway      │
│   (Protocol Buffers)     │  │  (Real-time Updates)     │
└──────────────────────────┘  └──────────────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Core Services Layer                       │
├───────────────────┬────────────────┬────────────────────────┤
│  Portfolio Service │  Price Service │  Protocol Adapters     │
└───────────────────┴────────────────┴────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Multi-Layer Cache      │  │    Database Layer        │
│  Memory → Redis → DB     │  │     PostgreSQL           │
└──────────────────────────┘  └──────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   Blockchain Data Layer                      │
├─────────────────────────────────────────────────────────────┤
│  • Helius RPC (WebSocket + HTTP)                            │
│  • Protocol SDKs (Marinade, Kamino, Orca, etc.)            │
│  • Jupiter Price API (WebSocket Stream)                     │
│  • Fallback RPC Providers                                   │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Infrastructure Architecture

#### 3.1 Docker-Based Architecture

**Production Docker Compose:**
```yaml
# docker-compose.prod.yml
version: '3.8'

networks:
  solfolio:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  envoy_config:

services:
  # Envoy Proxy for gRPC-Web
  envoy:
    image: envoyproxy/envoy:v1.28-latest
    container_name: solfolio-envoy
    ports:
      - "8080:8080"  # gRPC-Web
      - "9901:9901"  # Admin
    volumes:
      - ./envoy/envoy.yaml:/etc/envoy/envoy.yaml:ro
    networks:
      - solfolio
    restart: unless-stopped
    depends_on:
      - grpc-server

  # Next.js Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      target: production
    container_name: solfolio-frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_GRPC_URL=http://localhost:8080
      - NEXT_PUBLIC_WS_URL=ws://localhost:8081
    networks:
      - solfolio
    restart: unless-stopped
    depends_on:
      - grpc-server
      - websocket-gateway

  # gRPC Backend Service
  grpc-server:
    build:
      context: .
      dockerfile: Dockerfile.backend
      target: production
    container_name: solfolio-grpc
    ports:
      - "50051:50051"  # gRPC
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://solfolio:${DB_PASSWORD}@postgres:5432/solfolio
      - REDIS_URL=redis://redis:6379
      - HELIUS_API_KEY=${HELIUS_API_KEY}
      - HELIUS_WS_URL=${HELIUS_WS_URL}
    networks:
      - solfolio
    restart: unless-stopped
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "grpc_health_probe", "-addr=:50051"]
      interval: 30s
      timeout: 10s
      retries: 3

  # WebSocket Gateway for Real-time Updates
  websocket-gateway:
    build:
      context: .
      dockerfile: Dockerfile.websocket
      target: production
    container_name: solfolio-websocket
    ports:
      - "8081:8081"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - GRPC_SERVER_URL=grpc-server:50051
    networks:
      - solfolio
    restart: unless-stopped
    depends_on:
      - redis
      - grpc-server

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: solfolio-postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      - POSTGRES_DB=solfolio
      - POSTGRES_USER=solfolio
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8
    ports:
      - "5432:5432"
    networks:
      - solfolio
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U solfolio"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis for Caching & Pub/Sub
  redis:
    image: redis:7-alpine
    container_name: solfolio-redis
    command: >
      redis-server
      --appendonly yes
      --appendfsync everysec
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "6379:6379"
    networks:
      - solfolio
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Monitoring with Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: solfolio-prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
    networks:
      - solfolio
    restart: unless-stopped

  # Grafana for Visualization
  grafana:
    image: grafana/grafana:latest
    container_name: solfolio-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    networks:
      - solfolio
    restart: unless-stopped
```

**Development Docker Compose:**
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  frontend:
    build:
      target: development
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  grpc-server:
    build:
      target: development
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev:grpc

  websocket-gateway:
    build:
      target: development
    volumes:
      - ./websocket:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev:ws
```

#### 3.2 CloudFlare Configuration

```yaml
# CloudFlare Settings
SSL/TLS:
  Mode: Full (strict)
  Edge Certificates: On
  Always Use HTTPS: On
  Minimum TLS Version: 1.2
  
Security:
  WAF: Enabled
  DDoS Protection: Enabled
  Rate Limiting:
    - Path: /api/*
      Threshold: 100 requests/minute
    - Path: /grpc/*
      Threshold: 200 requests/minute
  
Performance:
  CDN: Enabled
  Caching Level: Standard
  Browser Cache TTL: 4 hours
  
Network:
  WebSockets: Enabled
  gRPC: Enabled
  HTTP/3 (QUIC): Enabled
```

---

### 4. gRPC Service Architecture

#### 4.1 Protocol Buffer Definitions

```protobuf
// proto/portfolio.proto
syntax = "proto3";

package solfolio;

import "google/protobuf/timestamp.proto";
import "google/protobuf/empty.proto";

service PortfolioService {
  // Unary RPC for initial portfolio fetch
  rpc GetPortfolio(GetPortfolioRequest) returns (Portfolio);
  
  // Server streaming for real-time portfolio updates
  rpc StreamPortfolioUpdates(StreamPortfolioRequest) returns (stream PortfolioUpdate);
  
  // Bidirectional streaming for multiple wallet monitoring
  rpc StreamMultipleWallets(stream WalletRequest) returns (stream PortfolioUpdate);
}

service PriceService {
  // Server streaming for real-time price updates
  rpc StreamPrices(StreamPricesRequest) returns (stream PriceUpdate);
  
  // Unary RPC for batch price fetch
  rpc GetPrices(GetPricesRequest) returns (PriceResponse);
}

message GetPortfolioRequest {
  string wallet_address = 1;
  bool force_refresh = 2;
}

message Portfolio {
  string wallet_address = 1;
  double total_value_usd = 2;
  repeated Position positions = 3;
  google.protobuf.Timestamp last_updated = 4;
  map<string, double> token_balances = 5;
}

message Position {
  string protocol = 1;
  string position_type = 2;
  string token_mint = 3;
  double amount = 4;
  double value_usd = 5;
  double apy = 6;
  map<string, string> metadata = 7;
}

message PortfolioUpdate {
  enum UpdateType {
    FULL_UPDATE = 0;
    POSITION_ADDED = 1;
    POSITION_REMOVED = 2;
    POSITION_UPDATED = 3;
    VALUE_CHANGED = 4;
  }
  
  UpdateType type = 1;
  string wallet_address = 2;
  oneof data {
    Portfolio full_portfolio = 3;
    Position position = 4;
    double new_total_value = 5;
  }
  google.protobuf.Timestamp timestamp = 6;
}

message PriceUpdate {
  string token_mint = 1;
  double price_usd = 2;
  double change_24h = 3;
  google.protobuf.Timestamp timestamp = 4;
}
```

#### 4.2 gRPC Server Implementation

```typescript
// backend/src/grpc/portfolio.service.ts
import * as grpc from '@grpc/grpc-js';
import { PortfolioServiceService } from '../generated/portfolio_grpc_pb';
import { Redis } from 'ioredis';
import { EventEmitter } from 'events';

export class PortfolioGrpcService implements PortfolioServiceService {
  private redis: Redis;
  private updateEmitter: EventEmitter;
  private subscriptions: Map<string, Set<grpc.ServerWritableStream>>;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: 6379,
      maxRetriesPerRequest: 3,
    });
    
    this.updateEmitter = new EventEmitter();
    this.subscriptions = new Map();
    
    // Subscribe to Redis pub/sub for real-time updates
    this.setupRedisPubSub();
  }

  private setupRedisPubSub() {
    const subscriber = this.redis.duplicate();
    
    subscriber.psubscribe('portfolio:*:update');
    subscriber.psubscribe('price:*:update');
    
    subscriber.on('pmessage', (pattern, channel, message) => {
      const data = JSON.parse(message);
      
      if (channel.startsWith('portfolio:')) {
        const wallet = channel.split(':')[1];
        this.broadcastPortfolioUpdate(wallet, data);
      } else if (channel.startsWith('price:')) {
        const mint = channel.split(':')[1];
        this.broadcastPriceUpdate(mint, data);
      }
    });
  }

  async getPortfolio(
    call: grpc.ServerUnaryCall<GetPortfolioRequest, Portfolio>,
    callback: grpc.sendUnaryData<Portfolio>
  ) {
    const { wallet_address, force_refresh } = call.request;
    
    try {
      // Multi-layer cache check
      let portfolio = await this.getFromCache(wallet_address);
      
      if (!portfolio || force_refresh) {
        portfolio = await this.fetchPortfolioFromBlockchain(wallet_address);
        await this.updateCache(wallet_address, portfolio);
        
        // Publish update for streaming subscribers
        await this.redis.publish(
          `portfolio:${wallet_address}:update`,
          JSON.stringify(portfolio)
        );
      }
      
      callback(null, portfolio);
    } catch (error) {
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }

  streamPortfolioUpdates(
    call: grpc.ServerWritableStream<StreamPortfolioRequest, PortfolioUpdate>
  ) {
    const wallet = call.request.wallet_address;
    
    // Add to subscription map
    if (!this.subscriptions.has(wallet)) {
      this.subscriptions.set(wallet, new Set());
    }
    this.subscriptions.get(wallet).add(call);
    
    // Send initial portfolio
    this.getPortfolio(wallet).then(portfolio => {
      call.write({
        type: UpdateType.FULL_UPDATE,
        wallet_address: wallet,
        full_portfolio: portfolio,
        timestamp: new Date(),
      });
    });
    
    // Clean up on disconnect
    call.on('cancelled', () => {
      this.subscriptions.get(wallet)?.delete(call);
    });
  }

  private broadcastPortfolioUpdate(wallet: string, update: any) {
    const subscribers = this.subscriptions.get(wallet);
    if (!subscribers) return;
    
    const message = {
      type: UpdateType.POSITION_UPDATED,
      wallet_address: wallet,
      position: update.position,
      timestamp: new Date(),
    };
    
    subscribers.forEach(stream => {
      try {
        stream.write(message);
      } catch (error) {
        // Remove dead streams
        subscribers.delete(stream);
      }
    });
  }
}
```

---

### 5. Real-time Data Architecture

#### 5.1 WebSocket Gateway

```typescript
// websocket/src/gateway.ts
import { Server } from 'socket.io';
import { createServer } from 'http';
import { Redis } from 'ioredis';
import * as grpc from '@grpc/grpc-js';
import { PortfolioServiceClient } from './generated/portfolio_grpc_pb';

export class WebSocketGateway {
  private io: Server;
  private redis: Redis;
  private grpcClient: PortfolioServiceClient;
  private subscriptions: Map<string, Set<string>>; // wallet -> socketIds

  constructor() {
    const httpServer = createServer();
    
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(','),
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });
    
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
    });
    
    // Connect to gRPC backend
    this.grpcClient = new PortfolioServiceClient(
      process.env.GRPC_SERVER_URL,
      grpc.credentials.createInsecure()
    );
    
    this.subscriptions = new Map();
    this.setupSocketHandlers();
    this.setupRedisSubscriptions();
    
    httpServer.listen(8081);
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Subscribe to wallet updates
      socket.on('subscribe:wallet', (wallet: string) => {
        if (!this.subscriptions.has(wallet)) {
          this.subscriptions.set(wallet, new Set());
          this.subscribeToWalletUpdates(wallet);
        }
        this.subscriptions.get(wallet).add(socket.id);
        
        // Join room for efficient broadcasting
        socket.join(`wallet:${wallet}`);
        
        // Send current portfolio state
        this.sendInitialPortfolio(socket, wallet);
      });
      
      // Subscribe to price updates
      socket.on('subscribe:prices', (mints: string[]) => {
        mints.forEach(mint => {
          socket.join(`price:${mint}`);
        });
        
        // Start streaming prices
        this.streamPrices(socket, mints);
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        // Clean up subscriptions
        this.subscriptions.forEach((sockets, wallet) => {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.subscriptions.delete(wallet);
          }
        });
      });
    });
  }

  private setupRedisSubscriptions() {
    const subscriber = this.redis.duplicate();
    
    // Subscribe to all updates
    subscriber.psubscribe('portfolio:*:update');
    subscriber.psubscribe('price:*:update');
    subscriber.psubscribe('position:*:change');
    
    subscriber.on('pmessage', (pattern, channel, message) => {
      const data = JSON.parse(message);
      
      if (channel.startsWith('portfolio:')) {
        const wallet = channel.split(':')[1];
        this.io.to(`wallet:${wallet}`).emit('portfolio:update', data);
      } else if (channel.startsWith('price:')) {
        const mint = channel.split(':')[1];
        this.io.to(`price:${mint}`).emit('price:update', data);
      }
    });
  }

  private subscribeToWalletUpdates(wallet: string) {
    // Create gRPC stream for wallet updates
    const stream = this.grpcClient.streamPortfolioUpdates({
      wallet_address: wallet,
    });
    
    stream.on('data', (update) => {
      // Broadcast to all subscribed clients
      this.io.to(`wallet:${wallet}`).emit('portfolio:update', {
        type: update.type,
        data: update.data,
        timestamp: update.timestamp,
      });
    });
    
    stream.on('error', (error) => {
      console.error(`Stream error for wallet ${wallet}:`, error);
      // Implement reconnection logic
      setTimeout(() => this.subscribeToWalletUpdates(wallet), 5000);
    });
  }
}
```

#### 5.2 Frontend WebSocket Integration

```typescript
// frontend/src/hooks/useRealtimePortfolio.ts
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { GrpcWebClient } from '@improbable-eng/grpc-web';

export function useRealtimePortfolio(walletAddress: string) {
  const [portfolio, setPortfolio] = useState(null);
  const [socket, setSocket] = useState<Socket>(null);
  const [grpcClient, setGrpcClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;

    // Initialize WebSocket connection
    const ws = io(process.env.NEXT_PUBLIC_WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Initialize gRPC-Web client
    const grpc = new GrpcWebClient(process.env.NEXT_PUBLIC_GRPC_URL);
    
    ws.on('connect', () => {
      setIsConnected(true);
      // Subscribe to wallet updates
      ws.emit('subscribe:wallet', walletAddress);
    });

    ws.on('portfolio:update', (update) => {
      handlePortfolioUpdate(update);
    });

    ws.on('position:change', (change) => {
      handlePositionChange(change);
    });

    ws.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(ws);
    setGrpcClient(grpc);

    // Initial fetch via gRPC
    fetchInitialPortfolio(grpc, walletAddress);

    return () => {
      ws.disconnect();
    };
  }, [walletAddress]);

  const fetchInitialPortfolio = async (client, wallet) => {
    try {
      const response = await client.getPortfolio({
        wallet_address: wallet,
        force_refresh: false,
      });
      setPortfolio(response);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    }
  };

  const handlePortfolioUpdate = useCallback((update) => {
    setPortfolio(prev => {
      switch (update.type) {
        case 'FULL_UPDATE':
          return update.data;
        
        case 'POSITION_UPDATED':
          return {
            ...prev,
            positions: prev.positions.map(p =>
              p.id === update.data.id ? update.data : p
            ),
          };
        
        case 'VALUE_CHANGED':
          return {
            ...prev,
            total_value_usd: update.data.value,
          };
        
        default:
          return prev;
      }
    });
  }, []);

  const refreshPortfolio = useCallback(() => {
    if (grpcClient && walletAddress) {
      grpcClient.getPortfolio({
        wallet_address: walletAddress,
        force_refresh: true,
      });
    }
  }, [grpcClient, walletAddress]);

  return {
    portfolio,
    isConnected,
    refreshPortfolio,
  };
}
```

---

### 6. Advanced Caching Strategy

#### 6.1 Multi-Layer Cache Architecture

```typescript
// backend/src/cache/cache-manager.ts
import { LRUCache } from 'lru-cache';
import { Redis } from 'ioredis';
import { Pool } from 'pg';

export class CacheManager {
  private l1Cache: LRUCache<string, any>; // Memory cache (microseconds)
  private l2Cache: Redis;                 // Redis cache (milliseconds)
  private l3Cache: Pool;                   // PostgreSQL (persistent)
  
  constructor() {
    // L1: In-memory cache with smart TTL
    this.l1Cache = new LRUCache({
      max: 1000, // Maximum items
      ttl: this.calculateDynamicTTL,
      updateAgeOnGet: true,
      updateAgeOnHas: false,
    });
    
    // L2: Redis with intelligent expiry
    this.l2Cache = new Redis({
      host: process.env.REDIS_HOST,
      keyPrefix: 'cache:',
      enableOfflineQueue: false,
    });
    
    // L3: PostgreSQL for historical data
    this.l3Cache = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  private calculateDynamicTTL(key: string, value: any): number {
    // Dynamic TTL based on data type and volatility
    if (key.startsWith('price:')) {
      // Prices change rapidly - 5-10 seconds
      return 5000 + Math.random() * 5000;
    } else if (key.startsWith('portfolio:')) {
      // Portfolio data - 30-60 seconds
      return 30000 + Math.random() * 30000;
    } else if (key.startsWith('yield:')) {
      // Yield rates - 5-10 minutes
      return 300000 + Math.random() * 300000;
    } else if (key.startsWith('tvl:')) {
      // TVL data - 1-2 minutes
      return 60000 + Math.random() * 60000;
    }
    return 60000; // Default 1 minute
  }

  async get(key: string, options?: CacheOptions): Promise<any> {
    const startTime = performance.now();
    
    // L1: Memory cache
    const memResult = this.l1Cache.get(key);
    if (memResult && !options?.skipMemory) {
      this.recordCacheHit('memory', performance.now() - startTime);
      return memResult;
    }
    
    // L2: Redis cache
    const redisResult = await this.l2Cache.get(key);
    if (redisResult && !options?.skipRedis) {
      const parsed = JSON.parse(redisResult);
      
      // Validate freshness
      if (this.isFresh(key, parsed)) {
        // Backfill L1
        this.l1Cache.set(key, parsed);
        this.recordCacheHit('redis', performance.now() - startTime);
        return parsed;
      }
    }
    
    // L3: Database (historical)
    if (!options?.skipDatabase) {
      const dbResult = await this.getFromDatabase(key);
      if (dbResult) {
        // Backfill L1 and L2
        await this.set(key, dbResult, { updateOnly: true });
        this.recordCacheHit('database', performance.now() - startTime);
        return dbResult;
      }
    }
    
    this.recordCacheMiss(key, performance.now() - startTime);
    return null;
  }

  async set(key: string, value: any, options?: SetOptions): Promise<void> {
    const ttl = options?.ttl || this.calculateDynamicTTL(key, value);
    
    // Add metadata
    const enrichedValue = {
      ...value,
      _cache: {
        timestamp: Date.now(),
        ttl,
        version: process.env.CACHE_VERSION || '1.0',
      },
    };
    
    // L1: Memory
    if (!options?.skipMemory) {
      this.l1Cache.set(key, enrichedValue);
    }
    
    // L2: Redis with expiry
    if (!options?.skipRedis) {
      await this.l2Cache.setex(
        key,
        Math.ceil(ttl / 1000),
        JSON.stringify(enrichedValue)
      );
      
      // Publish update for real-time subscribers
      if (options?.publish) {
        await this.l2Cache.publish(
          `${key}:update`,
          JSON.stringify(value)
        );
      }
    }
    
    // L3: Database (async, non-blocking)
    if (!options?.skipDatabase && !options?.updateOnly) {
      this.saveToDatabase(key, enrichedValue).catch(err =>
        console.error('Failed to save to database:', err)
      );
    }
  }

  private isFresh(key: string, data: any): boolean {
    if (!data._cache) return false;
    
    const age = Date.now() - data._cache.timestamp;
    const ttl = data._cache.ttl;
    
    // Apply freshness factor based on key type
    const freshnessFactor = this.getFreshnessFactor(key);
    
    return age < (ttl * freshnessFactor);
  }

  private getFreshnessFactor(key: string): number {
    // More aggressive invalidation for volatile data
    if (key.startsWith('price:')) return 0.5;  // 50% of TTL
    if (key.startsWith('portfolio:')) return 0.7;  // 70% of TTL
    if (key.startsWith('yield:')) return 0.9;  // 90% of TTL
    return 0.8; // Default 80%
  }

  // Predictive pre-fetching
  async prefetch(patterns: string[]): Promise<void> {
    const promises = patterns.map(pattern => {
      return this.predictAndFetch(pattern);
    });
    
    await Promise.allSettled(promises);
  }

  private async predictAndFetch(pattern: string): Promise<void> {
    // Use ML model or heuristics to predict what data will be needed
    const predictions = await this.getPredictions(pattern);
    
    for (const key of predictions) {
      // Check if not in cache
      const exists = this.l1Cache.has(key);
      if (!exists) {
        // Fetch in background
        this.fetchAndCache(key).catch(console.error);
      }
    }
  }
}
```

#### 6.2 Cache Invalidation Strategy

```typescript
// backend/src/cache/invalidation.ts
export class CacheInvalidator {
  private redis: Redis;
  private invalidationRules: Map<string, InvalidationRule>;
  
  constructor() {
    this.redis = new Redis();
    this.setupInvalidationRules();
    this.startInvalidationWorker();
  }

  private setupInvalidationRules() {
    this.invalidationRules = new Map([
      // Price changes invalidate portfolio values
      ['price:*', {
        cascades: ['portfolio:*', 'position:*'],
        condition: (old, new) => Math.abs(old - new) > 0.01,
      }],
      
      // New transaction invalidates portfolio
      ['transaction:*', {
        cascades: ['portfolio:{wallet}', 'balance:{wallet}'],
        immediate: true,
      }],
      
      // Protocol APY change invalidates yields
      ['apy:*', {
        cascades: ['yield:*', 'position:*'],
        condition: (old, new) => Math.abs(old - new) > 0.1,
      }],
    ]);
  }

  async invalidate(key: string, reason?: string): Promise<void> {
    console.log(`Invalidating ${key}, reason: ${reason}`);
    
    // Delete from all cache layers
    await Promise.all([
      this.l1Cache.delete(key),
      this.redis.del(key),
      this.markStaleInDatabase(key),
    ]);
    
    // Handle cascading invalidations
    await this.cascadeInvalidation(key);
    
    // Notify subscribers
    await this.redis.publish(`invalidation:${key}`, JSON.stringify({
      key,
      reason,
      timestamp: Date.now(),
    }));
  }

  private async cascadeInvalidation(key: string): Promise<void> {
    for (const [pattern, rule] of this.invalidationRules) {
      if (this.matchesPattern(key, pattern)) {
        for (const cascade of rule.cascades) {
          const affectedKeys = await this.expandPattern(cascade, key);
          
          for (const affectedKey of affectedKeys) {
            if (rule.immediate) {
              await this.invalidate(affectedKey, `Cascade from ${key}`);
            } else {
              // Queue for batch invalidation
              await this.queueInvalidation(affectedKey);
            }
          }
        }
      }
    }
  }
}
```

---

### 7. Blockchain Data Synchronization

#### 7.1 Real-time Blockchain Monitoring

```typescript
// backend/src/blockchain/monitor.ts
import { Connection } from '@solana/web3.js';
import WebSocket from 'ws';

export class BlockchainMonitor {
  private heliusWs: WebSocket;
  private connection: Connection;
  private subscriptions: Map<string, number>;
  
  constructor() {
    // Helius WebSocket for enhanced data
    this.heliusWs = new WebSocket(process.env.HELIUS_WS_URL);
    
    // Standard Solana connection for fallback
    this.connection = new Connection(
      process.env.HELIUS_RPC_URL,
      {
        commitment: 'confirmed',
        wsEndpoint: process.env.HELIUS_WS_URL,
      }
    );
    
    this.subscriptions = new Map();
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.heliusWs.on('open', () => {
      console.log('Connected to Helius WebSocket');
      this.subscribeToEnhancedUpdates();
    });
    
    this.heliusWs.on('message', (data) => {
      const message = JSON.parse(data.toString());
      this.handleBlockchainUpdate(message);
    });
    
    this.heliusWs.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.reconnect();
    });
  }

  private subscribeToEnhancedUpdates() {
    // Subscribe to enhanced transaction updates
    this.heliusWs.send(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'transactionSubscribe',
      params: [
        {
          accountInclude: [...this.getMonitoredPrograms()],
          commitment: 'confirmed',
          encoding: 'jsonParsed',
          showRewards: true,
        }
      ]
    }));
  }

  async subscribeToWallet(wallet: string): Promise<void> {
    // Account subscription for balance changes
    const subId = await this.connection.onAccountChange(
      new PublicKey(wallet),
      (accountInfo) => {
        this.handleAccountChange(wallet, accountInfo);
      },
      'confirmed'
    );
    
    this.subscriptions.set(`account:${wallet}`, subId);
    
    // Enhanced Helius subscription for detailed updates
    this.heliusWs.send(JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'enhancedAccountSubscribe',
      params: [
        wallet,
        {
          encoding: 'jsonParsed',
          commitment: 'confirmed',
          includeTransactions: true,
        }
      ]
    }));
  }

  private async handleAccountChange(wallet: string, accountInfo: any) {
    // Invalidate cache immediately
    await this.cacheManager.invalidate(`balance:${wallet}`);
    
    // Fetch fresh portfolio data
    const portfolio = await this.portfolioService.fetchPortfolio(wallet, true);
    
    // Update cache with fresh data
    await this.cacheManager.set(`portfolio:${wallet}`, portfolio, {
      publish: true, // Notify WebSocket subscribers
    });
    
    // Publish to gRPC stream
    this.grpcService.broadcastUpdate({
      type: 'PORTFOLIO_UPDATED',
      wallet,
      data: portfolio,
    });
  }

  private getMonitoredPrograms(): string[] {
    return [
      'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7', // Marinade
      'KAMino...', // Kamino
      'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', // Orca Whirlpool
      // Add more protocol program IDs
    ];
  }
}
```

---

### 8. Monitoring and Observability

#### 8.1 Prometheus Metrics

```typescript
// backend/src/metrics/collector.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export class MetricsCollector {
  private registry: Registry;
  
  // Cache metrics
  private cacheHits: Counter;
  private cacheMisses: Counter;
  private cacheLatency: Histogram;
  
  // gRPC metrics
  private grpcRequests: Counter;
  private grpcLatency: Histogram;
  private activeStreams: Gauge;
  
  // WebSocket metrics
  private wsConnections: Gauge;
  private wsMessages: Counter;
  
  // Blockchain metrics
  private rpcCalls: Counter;
  private rpcLatency: Histogram;
  private blockHeight: Gauge;
  
  constructor() {
    this.registry = new Registry();
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // Cache metrics
    this.cacheHits = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['layer', 'key_type'],
      registers: [this.registry],
    });
    
    this.cacheMisses = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['key_type'],
      registers: [this.registry],
    });
    
    this.cacheLatency = new Histogram({
      name: 'cache_latency_seconds',
      help: 'Cache operation latency',
      labelNames: ['operation', 'layer'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
      registers: [this.registry],
    });
    
    // gRPC metrics
    this.grpcRequests = new Counter({
      name: 'grpc_requests_total',
      help: 'Total gRPC requests',
      labelNames: ['method', 'status'],
      registers: [this.registry],
    });
    
    this.grpcLatency = new Histogram({
      name: 'grpc_latency_seconds',
      help: 'gRPC request latency',
      labelNames: ['method'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
      registers: [this.registry],
    });
    
    this.activeStreams = new Gauge({
      name: 'grpc_active_streams',
      help: 'Number of active gRPC streams',
      registers: [this.registry],
    });
    
    // WebSocket metrics
    this.wsConnections = new Gauge({
      name: 'websocket_connections',
      help: 'Number of active WebSocket connections',
      registers: [this.registry],
    });
    
    this.wsMessages = new Counter({
      name: 'websocket_messages_total',
      help: 'Total WebSocket messages',
      labelNames: ['direction', 'type'],
      registers: [this.registry],
    });
  }

  getMetrics(): string {
    return this.registry.metrics();
  }
}
```

---

### 9. Docker Configuration Files

#### 9.1 Backend Dockerfile

```dockerfile
# Dockerfile.backend
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Build
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:proto && npm run build

# Production
FROM base AS production
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/proto ./proto

USER nodejs
EXPOSE 50051

CMD ["node", "dist/server.js"]

# Development
FROM base AS development
ENV NODE_ENV development
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev:grpc"]
```

#### 9.2 Envoy Configuration

```yaml
# envoy/envoy.yaml
admin:
  address:
    socket_address:
      address: 0.0.0.0
      port_value: 9901

static_resources:
  listeners:
    - name: listener_0
      address:
        socket_address:
          address: 0.0.0.0
          port_value: 8080
      filter_chains:
        - filters:
          - name: envoy.filters.network.http_connection_manager
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
              codec_type: auto
              stat_prefix: ingress_http
              access_log:
                - name: envoy.access_loggers.stdout
                  typed_config:
                    "@type": type.googleapis.com/envoy.extensions.access_loggers.stream.v3.StdoutAccessLog
              route_config:
                name: local_route
                virtual_hosts:
                  - name: local_service
                    domains: ["*"]
                    routes:
                      - match:
                          prefix: "/"
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
        cluster_name: grpc_service
        endpoints:
          - lb_endpoints:
            - endpoint:
                address:
                  socket_address:
                    address: grpc-server
                    port_value: 50051
```

---

### 10. Environment Configuration

```bash
# .env.production
# Database
DATABASE_URL=postgresql://solfolio:password@postgres:5432/solfolio

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# gRPC
GRPC_SERVER_URL=grpc-server:50051
GRPC_WEB_URL=http://envoy:8080

# WebSocket
WS_PORT=8081
WS_URL=ws://localhost:8081

# Blockchain
HELIUS_API_KEY=your_helius_key
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=
HELIUS_WS_URL=wss://mainnet.helius-rpc.com/?api-key=
QUICKNODE_URL=https://...quicknode.pro/
RPC_FALLBACK_URL=https://api.mainnet-beta.solana.com

# API Keys
JUPITER_API_KEY=optional_key
BIRDEYE_API_KEY=optional_key

# Security
JWT_SECRET=random_64_char_string
ENCRYPTION_KEY=random_32_char_string

# Application
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PASSWORD=secure_password
LOG_LEVEL=info

# Cache
CACHE_VERSION=1.0
CACHE_MAX_AGE=86400
```

---

### 11. Deployment Commands

```bash
# deploy.sh
#!/bin/bash

# Build and start services
echo "Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Run database migrations
echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm grpc-server npm run db:migrate

# Start all services
echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
./scripts/wait-for-healthy.sh

# Verify deployment
echo "Verifying deployment..."
curl -f http://localhost:3000/api/health || exit 1
curl -f http://localhost:50051/health || exit 1

echo "Deployment successful!"
```

---

### 12. Development Setup

```bash
# Development setup script
#!/bin/bash

# Clone repository
git clone https://github.com/yourusername/solfolio.git
cd solfolio

# Copy environment variables
cp .env.example .env.development

# Start development containers
docker-compose -f docker-compose.dev.yml up -d

# Install dependencies
docker-compose -f docker-compose.dev.yml exec frontend npm install
docker-compose -f docker-compose.dev.yml exec grpc-server npm install
docker-compose -f docker-compose.dev.yml exec websocket-gateway npm install

# Generate protobuf files
docker-compose -f docker-compose.dev.yml exec grpc-server npm run proto:generate

# Run migrations
docker-compose -f docker-compose.dev.yml exec grpc-server npm run db:migrate:dev

# Start development servers
docker-compose -f docker-compose.dev.yml up

echo "Development environment ready at:"
echo "  Frontend: http://localhost:3000"
echo "  gRPC: localhost:50051"
echo "  WebSocket: ws://localhost:8081"
echo "  Prometheus: http://localhost:9090"
echo "  Grafana: http://localhost:3001"
```