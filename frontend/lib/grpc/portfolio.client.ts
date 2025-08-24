import { grpc } from '@grpc/grpc-js';

export interface Token {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  price: number;
  value: number;
}

export interface Position {
  protocol: string;
  type: string;
  address: string;
  value: number;
  apy: number;
  tokens: Token[];
  metadata: Record<string, string>;
}

export interface Portfolio {
  wallet: string;
  totalValue: number;
  tokens: Token[];
  positions: Position[];
  timestamp: number;
}

export interface GetPortfolioRequest {
  wallet: string;
  forceRefresh?: boolean;
}

export interface GetTokenBalancesRequest {
  wallet: string;
}

export interface GetPositionsRequest {
  wallet: string;
  protocols?: string[];
}

export interface GetPricesRequest {
  mints: string[];
}

export interface SubscribeToUpdatesRequest {
  wallet: string;
  eventTypes?: string[];
}

export interface UpdateEvent {
  type: string;
  wallet: string;
  data?: {
    tokenUpdate?: Token;
    positionUpdate?: Position;
    priceUpdate?: PriceUpdate;
  };
  timestamp: number;
}

export interface PriceUpdate {
  mint: string;
  price: number;
  change24h: number;
}

export interface HealthCheckRequest {
  service?: string;
}

export interface HealthCheckResponse {
  status: 'UNKNOWN' | 'SERVING' | 'NOT_SERVING';
  message: string;
}

export class PortfolioGrpcClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_GRPC_WEB_URL || 'http://localhost:8080') {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/grpc-web-text',
      'X-Grpc-Web': '1',
    };
  }

  async getPortfolio(request: GetPortfolioRequest): Promise<Portfolio> {
    const response = await this.makeRequest('GetPortfolio', request);
    return this.transformPortfolioResponse(response.portfolio);
  }

  async getTokenBalances(request: GetTokenBalancesRequest): Promise<Token[]> {
    const response = await this.makeRequest('GetTokenBalances', request);
    return response.tokens || [];
  }

  async getPositions(request: GetPositionsRequest): Promise<Position[]> {
    const response = await this.makeRequest('GetPositions', request);
    return response.positions || [];
  }

  async getPrices(request: GetPricesRequest): Promise<Record<string, number>> {
    const response = await this.makeRequest('GetPrices', request);
    return response.prices || {};
  }

  async healthCheck(request: HealthCheckRequest = {}): Promise<HealthCheckResponse> {
    const response = await this.makeRequest('HealthCheck', request);
    return {
      status: this.mapHealthStatus(response.status),
      message: response.message,
    };
  }

  subscribeToUpdates(
    request: SubscribeToUpdatesRequest,
    onUpdate: (event: UpdateEvent) => void,
    onError?: (error: Error) => void,
  ): () => void {
    const eventSource = new EventSource(
      `${this.baseUrl}/portfolio.PortfolioService/SubscribeToUpdates?wallet=${request.wallet}&eventTypes=${(request.eventTypes || []).join(',')}`,
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(this.transformUpdateEvent(data));
      } catch (error) {
        if (onError) {
          onError(error as Error);
        }
      }
    };

    eventSource.onerror = (error) => {
      if (onError) {
        onError(new Error('Connection error'));
      }
    };

    return () => {
      eventSource.close();
    };
  }

  private async makeRequest(method: string, request: any): Promise<any> {
    const url = `${this.baseUrl}/portfolio.PortfolioService/${method}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`gRPC request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error calling ${method}:`, error);
      throw error;
    }
  }

  private transformPortfolioResponse(portfolio: any): Portfolio {
    return {
      wallet: portfolio.wallet,
      totalValue: portfolio.total_value || portfolio.totalValue,
      tokens: portfolio.tokens || [],
      positions: portfolio.positions || [],
      timestamp: portfolio.timestamp,
    };
  }

  private transformUpdateEvent(event: any): UpdateEvent {
    return {
      type: event.type,
      wallet: event.wallet,
      data: {
        tokenUpdate: event.data?.token_update,
        positionUpdate: event.data?.position_update,
        priceUpdate: event.data?.price_update,
      },
      timestamp: event.timestamp,
    };
  }

  private mapHealthStatus(status: number): 'UNKNOWN' | 'SERVING' | 'NOT_SERVING' {
    switch (status) {
      case 1:
        return 'SERVING';
      case 2:
        return 'NOT_SERVING';
      default:
        return 'UNKNOWN';
    }
  }
}

export default PortfolioGrpcClient;