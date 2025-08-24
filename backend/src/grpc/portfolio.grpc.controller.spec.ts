import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioGrpcController } from './portfolio.grpc.controller';
import { PortfolioGrpcService } from './portfolio.grpc.service';
import { of } from 'rxjs';

describe('PortfolioGrpcController', () => {
  let controller: PortfolioGrpcController;
  let service: jest.Mocked<PortfolioGrpcService>;

  const mockWallet = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioGrpcController],
      providers: [
        {
          provide: PortfolioGrpcService,
          useValue: {
            getPortfolio: jest.fn(),
            getTokenBalances: jest.fn(),
            getPositions: jest.fn(),
            getPrices: jest.fn(),
            subscribeToUpdates: jest.fn(),
            healthCheck: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PortfolioGrpcController>(PortfolioGrpcController);
    service = module.get(PortfolioGrpcService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPortfolio', () => {
    it('should call service getPortfolio method', async () => {
      const mockRequest = { wallet: mockWallet };
      const mockResponse = {
        portfolio: {
          wallet: mockWallet,
          total_value: 1000,
          tokens: [],
          positions: [],
          timestamp: Date.now(),
        },
      };

      service.getPortfolio.mockResolvedValue(mockResponse);

      const result = await controller.getPortfolio(mockRequest);

      expect(service.getPortfolio).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getTokenBalances', () => {
    it('should call service getTokenBalances method', async () => {
      const mockRequest = { wallet: mockWallet };
      const mockResponse = {
        tokens: [
          {
            mint: 'So11111111111111111111111111111111111111112',
            symbol: 'SOL',
            name: 'Solana',
            balance: 10,
            decimals: 9,
            price: 50,
            value: 500,
          },
        ],
      };

      service.getTokenBalances.mockResolvedValue(mockResponse);

      const result = await controller.getTokenBalances(mockRequest);

      expect(service.getTokenBalances).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPositions', () => {
    it('should call service getPositions method', async () => {
      const mockRequest = {
        wallet: mockWallet,
        protocols: ['Marinade'],
      };
      const mockResponse = {
        positions: [
          {
            protocol: 'Marinade',
            type: 'staking',
            address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
            value: 1000,
            apy: 6.5,
            tokens: [],
            metadata: {},
          },
        ],
      };

      service.getPositions.mockResolvedValue(mockResponse);

      const result = await controller.getPositions(mockRequest);

      expect(service.getPositions).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPrices', () => {
    it('should call service getPrices method', async () => {
      const mockRequest = {
        mints: ['So11111111111111111111111111111111111111112'],
      };
      const mockResponse = {
        prices: {
          So11111111111111111111111111111111111111112: 50.25,
        },
      };

      service.getPrices.mockResolvedValue(mockResponse);

      const result = await controller.getPrices(mockRequest);

      expect(service.getPrices).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('subscribeToUpdates', () => {
    it('should call service subscribeToUpdates method', () => {
      const mockRequest = of({ wallet: mockWallet });
      const mockUpdateEvent = of({
        type: 'price',
        wallet: mockWallet,
        data: {
          price_update: {
            mint: 'So11111111111111111111111111111111111111112',
            price: 51,
            change_24h: 2,
          },
        },
        timestamp: Date.now(),
      });

      service.subscribeToUpdates.mockReturnValue(mockUpdateEvent);

      const result = controller.subscribeToUpdates(mockRequest);

      expect(service.subscribeToUpdates).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(mockUpdateEvent);
    });
  });

  describe('healthCheck', () => {
    it('should call service healthCheck method', async () => {
      const mockRequest = { service: 'cache' };
      const mockResponse = {
        status: 1,
        message: 'Service is healthy',
      };

      service.healthCheck.mockResolvedValue(mockResponse);

      const result = await controller.healthCheck(mockRequest);

      expect(service.healthCheck).toHaveBeenCalledWith(mockRequest);
      expect(result).toEqual(mockResponse);
    });
  });
});
