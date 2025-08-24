import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioGrpcService } from './portfolio.grpc.service';
import { WalletService } from '../wallet/wallet.service';
import { PositionsService } from '../positions/positions.service';
import { PriceService } from '../price/price.service';
import { WebsocketService } from '../websocket/websocket.service';
import { CacheService } from '../cache/cache.service';

describe('PortfolioGrpcService', () => {
  let service: PortfolioGrpcService;
  let walletService: jest.Mocked<WalletService>;
  let positionsService: jest.Mocked<PositionsService>;
  let priceService: jest.Mocked<PriceService>;
  let websocketService: jest.Mocked<WebsocketService>;
  let cacheService: jest.Mocked<CacheService>;

  const mockWallet = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV';
  
  const mockTokens = [
    {
      mint: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      balance: 10.5,
      decimals: 9,
      price: 50.25,
      value: 527.625,
    },
    {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 1000,
      decimals: 6,
      price: 1,
      value: 1000,
    },
  ];

  const mockPositions = [
    {
      protocol: 'Marinade',
      type: 'staking',
      address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
      value: 2500,
      apy: 6.5,
      tokens: [{
        mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
        symbol: 'mSOL',
        name: 'Marinade Staked SOL',
        balance: 48.5,
        decimals: 9,
        price: 51.55,
        value: 2500,
      }],
      metadata: {
        validator: 'Marinade',
      },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioGrpcService,
        {
          provide: WalletService,
          useValue: {
            getTokenBalances: jest.fn(),
          },
        },
        {
          provide: PositionsService,
          useValue: {
            getPositions: jest.fn(),
          },
        },
        {
          provide: PriceService,
          useValue: {
            getTokenPrice: jest.fn(),
          },
        },
        {
          provide: WebsocketService,
          useValue: {
            on: jest.fn(),
            emit: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PortfolioGrpcService>(PortfolioGrpcService);
    walletService = module.get(WalletService) as jest.Mocked<WalletService>;
    positionsService = module.get(PositionsService) as jest.Mocked<PositionsService>;
    priceService = module.get(PriceService) as jest.Mocked<PriceService>;
    websocketService = module.get(WebsocketService) as jest.Mocked<WebsocketService>;
    cacheService = module.get(CacheService) as jest.Mocked<CacheService>;
  });

  describe('getPortfolio', () => {
    it('should return portfolio from cache when available', async () => {
      const cachedPortfolio = {
        wallet: mockWallet,
        total_value: 4027.625,
        tokens: mockTokens,
        positions: mockPositions,
        timestamp: Date.now(),
      };

      cacheService.get.mockResolvedValue(cachedPortfolio);

      const result = await service.getPortfolio({ wallet: mockWallet });

      expect(cacheService.get).toHaveBeenCalledWith(`portfolio:${mockWallet}`);
      expect(result.portfolio).toEqual(cachedPortfolio);
      expect(walletService.getTokenBalances).not.toHaveBeenCalled();
      expect(positionsService.getPositions).not.toHaveBeenCalled();
    });

    it('should fetch fresh data when cache miss or force refresh', async () => {
      cacheService.get.mockResolvedValue(null);
      walletService.getTokenBalances.mockResolvedValue(mockTokens);
      positionsService.getPositions.mockResolvedValue(mockPositions);

      const result = await service.getPortfolio({ 
        wallet: mockWallet, 
        force_refresh: true 
      });

      expect(walletService.getTokenBalances).toHaveBeenCalledWith(mockWallet);
      expect(positionsService.getPositions).toHaveBeenCalledWith(mockWallet);
      expect(result.portfolio.wallet).toBe(mockWallet);
      expect(result.portfolio.total_value).toBe(4027.625);
      expect(cacheService.set).toHaveBeenCalled();
    });
  });

  describe('getTokenBalances', () => {
    it('should return token balances', async () => {
      walletService.getTokenBalances.mockResolvedValue(mockTokens);

      const result = await service.getTokenBalances({ wallet: mockWallet });

      expect(walletService.getTokenBalances).toHaveBeenCalledWith(mockWallet);
      expect(result.tokens).toEqual(mockTokens);
    });
  });

  describe('getPositions', () => {
    it('should return positions for all protocols', async () => {
      positionsService.getPositions.mockResolvedValue(mockPositions);

      const result = await service.getPositions({ wallet: mockWallet });

      expect(positionsService.getPositions).toHaveBeenCalledWith(mockWallet, undefined);
      expect(result.positions).toHaveLength(1);
      expect(result.positions[0].protocol).toBe('Marinade');
    });

    it('should filter positions by protocols', async () => {
      positionsService.getPositions.mockResolvedValue(mockPositions);

      const result = await service.getPositions({ 
        wallet: mockWallet,
        protocols: ['Marinade', 'Kamino'],
      });

      expect(positionsService.getPositions).toHaveBeenCalledWith(
        mockWallet, 
        ['Marinade', 'Kamino']
      );
    });
  });

  describe('getPrices', () => {
    it('should return prices for requested tokens', async () => {
      priceService.getTokenPrice
        .mockResolvedValueOnce(50.25)
        .mockResolvedValueOnce(1);

      const mints = [
        'So11111111111111111111111111111111111111112',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      ];

      const result = await service.getPrices({ mints });

      expect(priceService.getTokenPrice).toHaveBeenCalledTimes(2);
      expect(result.prices).toEqual({
        'So11111111111111111111111111111111111111112': 50.25,
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1,
      });
    });

    it('should skip tokens without prices', async () => {
      priceService.getTokenPrice
        .mockResolvedValueOnce(50.25)
        .mockResolvedValueOnce(null);

      const mints = [
        'So11111111111111111111111111111111111111112',
        'UnknownToken',
      ];

      const result = await service.getPrices({ mints });

      expect(result.prices).toEqual({
        'So11111111111111111111111111111111111111112': 50.25,
      });
    });
  });

  describe('healthCheck', () => {
    it('should return SERVING when all services are healthy', async () => {
      cacheService.get.mockResolvedValue('test');
      priceService.getTokenPrice.mockResolvedValue(50.25);

      const result = await service.healthCheck({});

      expect(result.status).toBe(1); // SERVING
      expect(result.message).toBe('Service is healthy');
    });

    it('should return NOT_SERVING when services are unhealthy', async () => {
      cacheService.get.mockRejectedValue(new Error('Cache error'));

      const result = await service.healthCheck({});

      expect(result.status).toBe(2); // NOT_SERVING
      expect(result.message).toBe('Service is unhealthy');
    });

    it('should check specific service health', async () => {
      cacheService.get.mockResolvedValue('test');

      const result = await service.healthCheck({ service: 'cache' });

      expect(result.status).toBe(1); // SERVING
      expect(cacheService.get).toHaveBeenCalledWith('health-check');
    });

    it('should return UNKNOWN on unexpected errors', async () => {
      const error = new Error('Unexpected error');
      jest.spyOn(service as any, 'checkServiceHealth').mockRejectedValue(error);

      const result = await service.healthCheck({});

      expect(result.status).toBe(0); // UNKNOWN
      expect(result.message).toContain('Health check failed');
    });
  });
});