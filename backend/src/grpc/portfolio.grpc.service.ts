import { Injectable } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';
import { WalletService } from '../wallet/wallet.service';
import { PositionsService } from '../positions/positions.service';
import { PriceService } from '../price/price.service';
import { WebsocketService } from '../websocket/websocket.service';
import { CacheService } from '../cache/cache.service';

interface Token {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  price: number;
  value: number;
}

interface Position {
  protocol: string;
  type: string;
  address: string;
  value: number;
  apy: number;
  tokens: Token[];
  metadata: Record<string, string>;
}

interface Portfolio {
  wallet: string;
  total_value: number;
  tokens: Token[];
  positions: Position[];
  timestamp: number;
}

interface GetPortfolioRequest {
  wallet: string;
  force_refresh?: boolean;
}

interface GetTokenBalancesRequest {
  wallet: string;
}

interface GetPositionsRequest {
  wallet: string;
  protocols?: string[];
}

interface GetPricesRequest {
  mints: string[];
}

interface SubscribeToUpdatesRequest {
  wallet: string;
  event_types?: string[];
}

interface UpdateEvent {
  type: string;
  wallet: string;
  data?: {
    token_update?: Token;
    position_update?: Position;
    price_update?: PriceUpdate;
  };
  timestamp: number;
}

interface PriceUpdate {
  mint: string;
  price: number;
  change_24h: number;
}

interface HealthCheckRequest {
  service?: string;
}

interface HealthCheckResponse {
  status: number;
  message: string;
}

@Injectable()
export class PortfolioGrpcService {
  private updateSubjects = new Map<string, Subject<UpdateEvent>>();

  constructor(
    private readonly walletService: WalletService,
    private readonly positionsService: PositionsService,
    private readonly priceService: PriceService,
    private readonly websocketService: WebsocketService,
    private readonly cacheService: CacheService,
  ) {
    this.initializeWebSocketListeners();
  }

  @GrpcMethod('PortfolioService', 'GetPortfolio')
  async getPortfolio(data: GetPortfolioRequest): Promise<{ portfolio: Portfolio }> {
    const cacheKey = `portfolio:${data.wallet}`;
    
    if (!data.force_refresh) {
      const cached = await this.cacheService.get<Portfolio>(cacheKey);
      if (cached) {
        return { portfolio: cached };
      }
    }

    const [tokenBalances, positions] = await Promise.all([
      this.walletService.getTokenBalances(data.wallet),
      this.positionsService.getPositions(data.wallet),
    ]);

    const tokens: Token[] = tokenBalances.map(token => ({
      mint: token.mint,
      symbol: token.symbol,
      name: token.name,
      balance: token.balance,
      decimals: token.decimals,
      price: token.price || 0,
      value: token.value || 0,
    }));

    const formattedPositions: Position[] = positions.map(position => ({
      protocol: position.protocol,
      type: position.type,
      address: position.address || '',
      value: position.value,
      apy: position.apy || 0,
      tokens: position.tokens?.map(t => ({
        mint: t.mint || '',
        symbol: t.symbol || '',
        name: t.name || '',
        balance: t.balance || 0,
        decimals: t.decimals || 0,
        price: t.price || 0,
        value: t.value || 0,
      })) || [],
      metadata: position.metadata || {},
    }));

    const totalValue = tokens.reduce((sum, t) => sum + t.value, 0) +
                      formattedPositions.reduce((sum, p) => sum + p.value, 0);

    const portfolio: Portfolio = {
      wallet: data.wallet,
      total_value: totalValue,
      tokens,
      positions: formattedPositions,
      timestamp: Date.now(),
    };

    await this.cacheService.set(cacheKey, portfolio, 60);

    return { portfolio };
  }

  @GrpcMethod('PortfolioService', 'GetTokenBalances')
  async getTokenBalances(data: GetTokenBalancesRequest): Promise<{ tokens: Token[] }> {
    const tokenBalances = await this.walletService.getTokenBalances(data.wallet);
    
    const tokens: Token[] = tokenBalances.map(token => ({
      mint: token.mint,
      symbol: token.symbol,
      name: token.name,
      balance: token.balance,
      decimals: token.decimals,
      price: token.price || 0,
      value: token.value || 0,
    }));

    return { tokens };
  }

  @GrpcMethod('PortfolioService', 'GetPositions')
  async getPositions(data: GetPositionsRequest): Promise<{ positions: Position[] }> {
    const positions = await this.positionsService.getPositions(
      data.wallet,
      data.protocols,
    );

    const formattedPositions: Position[] = positions.map(position => ({
      protocol: position.protocol,
      type: position.type,
      address: position.address || '',
      value: position.value,
      apy: position.apy || 0,
      tokens: position.tokens?.map(t => ({
        mint: t.mint || '',
        symbol: t.symbol || '',
        name: t.name || '',
        balance: t.balance || 0,
        decimals: t.decimals || 0,
        price: t.price || 0,
        value: t.value || 0,
      })) || [],
      metadata: position.metadata || {},
    }));

    return { positions: formattedPositions };
  }

  @GrpcMethod('PortfolioService', 'GetPrices')
  async getPrices(data: GetPricesRequest): Promise<{ prices: Record<string, number> }> {
    const prices: Record<string, number> = {};
    
    for (const mint of data.mints) {
      const price = await this.priceService.getTokenPrice(mint);
      if (price) {
        prices[mint] = price;
      }
    }

    return { prices };
  }

  @GrpcStreamMethod('PortfolioService', 'SubscribeToUpdates')
  subscribeToUpdates(data: Observable<SubscribeToUpdatesRequest>): Observable<UpdateEvent> {
    const subject = new Subject<UpdateEvent>();

    data.subscribe({
      next: (request) => {
        const subjectKey = `${request.wallet}:${JSON.stringify(request.event_types || [])}`;
        this.updateSubjects.set(subjectKey, subject);
        
        this.setupUpdateSubscriptions(request.wallet, request.event_types || [], subject);
      },
      complete: () => {
        subject.complete();
      },
    });

    return subject.asObservable();
  }

  @GrpcMethod('PortfolioService', 'HealthCheck')
  async healthCheck(data: HealthCheckRequest): Promise<HealthCheckResponse> {
    try {
      const isHealthy = await this.checkServiceHealth(data.service);
      
      return {
        status: isHealthy ? 1 : 2, // 1 = SERVING, 2 = NOT_SERVING
        message: isHealthy ? 'Service is healthy' : 'Service is unhealthy',
      };
    } catch (error) {
      return {
        status: 0, // 0 = UNKNOWN
        message: `Health check failed: ${error.message}`,
      };
    }
  }

  private initializeWebSocketListeners() {
    this.websocketService.on('price-update', (data: any) => {
      this.broadcastPriceUpdate(data);
    });

    this.websocketService.on('position-update', (data: any) => {
      this.broadcastPositionUpdate(data);
    });
  }

  private setupUpdateSubscriptions(
    wallet: string,
    eventTypes: string[],
    subject: Subject<UpdateEvent>,
  ) {
    if (eventTypes.length === 0 || eventTypes.includes('price')) {
      this.websocketService.on(`price-update:${wallet}`, (data: PriceUpdate) => {
        subject.next({
          type: 'price',
          wallet,
          data: { price_update: data },
          timestamp: Date.now(),
        });
      });
    }

    if (eventTypes.length === 0 || eventTypes.includes('position')) {
      this.websocketService.on(`position-update:${wallet}`, (data: Position) => {
        subject.next({
          type: 'position',
          wallet,
          data: { position_update: data },
          timestamp: Date.now(),
        });
      });
    }

    if (eventTypes.length === 0 || eventTypes.includes('token')) {
      this.websocketService.on(`token-update:${wallet}`, (data: Token) => {
        subject.next({
          type: 'token',
          wallet,
          data: { token_update: data },
          timestamp: Date.now(),
        });
      });
    }
  }

  private broadcastPriceUpdate(data: any) {
    const priceUpdate: PriceUpdate = {
      mint: data.mint,
      price: data.price,
      change_24h: data.change24h || 0,
    };

    this.updateSubjects.forEach((subject, key) => {
      if (key.includes('price') || !key.includes(':')) {
        const [wallet] = key.split(':');
        subject.next({
          type: 'price',
          wallet,
          data: { price_update: priceUpdate },
          timestamp: Date.now(),
        });
      }
    });
  }

  private broadcastPositionUpdate(data: any) {
    const wallet = data.wallet;
    if (!wallet) return;

    this.updateSubjects.forEach((subject, key) => {
      if (key.startsWith(wallet)) {
        subject.next({
          type: 'position',
          wallet,
          data: { position_update: data.position },
          timestamp: Date.now(),
        });
      }
    });
  }

  private async checkServiceHealth(service?: string): Promise<boolean> {
    if (!service || service === 'all') {
      try {
        await Promise.all([
          this.cacheService.get('health-check'),
          this.priceService.getTokenPrice('So11111111111111111111111111111111111111112'),
        ]);
        return true;
      } catch {
        return false;
      }
    }

    switch (service) {
      case 'cache':
        try {
          await this.cacheService.get('health-check');
          return true;
        } catch {
          return false;
        }
      case 'price':
        try {
          await this.priceService.getTokenPrice('So11111111111111111111111111111111111111112');
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }
}