import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConnectionManager } from './connection-manager.service';
import { RateLimiterService } from './rate-limiter.service';
import { Connection } from '@solana/web3.js';

jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getSlot: jest.fn().mockResolvedValue(12345),
  })),
  PublicKey: jest.fn(),
}));

describe('ConnectionManager', () => {
  let service: ConnectionManager;
  let rateLimiter: RateLimiterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionManager,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(100),
          },
        },
        {
          provide: RateLimiterService,
          useValue: {
            waitForSlot: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ConnectionManager>(ConnectionManager);
    rateLimiter = module.get<RateLimiterService>(RateLimiterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConnection', () => {
    it('should create a new connection', async () => {
      const rpcUrl = 'https://test-rpc.example.com';
      const connection = await service.createConnection(rpcUrl);
      
      expect(connection).toBeDefined();
      expect(Connection).toHaveBeenCalledWith(rpcUrl, expect.objectContaining({
        commitment: 'confirmed',
      }));
    });

    it('should reuse existing connection for same URL', async () => {
      const rpcUrl = 'https://test-rpc.example.com';
      
      const conn1 = await service.createConnection(rpcUrl);
      const conn2 = await service.createConnection(rpcUrl);
      
      expect(conn1).toBe(conn2);
      expect(Connection).toHaveBeenCalledTimes(1);
    });
  });

  describe('executeWithRetry', () => {
    it('should execute operation successfully on first try', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      
      const result = await service.executeWithRetry(mockOperation);
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
      expect(rateLimiter.waitForSlot).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('rate limit exceeded'))
        .mockResolvedValue('success');
      
      const result = await service.executeWithRetry(mockOperation, {
        maxRetries: 2,
        initialDelay: 10,
      });
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const error = new Error('rate limit exceeded');
      const mockOperation = jest.fn().mockRejectedValue(error);
      
      await expect(
        service.executeWithRetry(mockOperation, {
          maxRetries: 2,
          initialDelay: 10,
        }),
      ).rejects.toThrow('rate limit exceeded');
      
      expect(mockOperation).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should not retry non-retryable errors', async () => {
      const error = new Error('Invalid public key');
      const mockOperation = jest.fn().mockRejectedValue(error);
      
      await expect(
        service.executeWithRetry(mockOperation),
      ).rejects.toThrow('Invalid public key');
      
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('testConnection', () => {
    it('should return true for valid connection', async () => {
      const mockConnection = {
        getSlot: jest.fn().mockResolvedValue(12345),
      } as any;
      
      const result = await service.testConnection(mockConnection);
      expect(result).toBe(true);
    });

    it('should return false for invalid connection', async () => {
      const mockConnection = {
        getSlot: jest.fn().mockRejectedValue(new Error('Connection failed')),
      } as any;
      
      const result = await service.testConnection(mockConnection);
      expect(result).toBe(false);
    });
  });

  describe('getActiveConnections', () => {
    it('should return list of active connections', async () => {
      await service.createConnection('https://rpc1.example.com');
      await service.createConnection('https://rpc2.example.com');
      
      const connections = service.getActiveConnections();
      expect(connections).toHaveLength(2);
      expect(connections).toContain('https://rpc1.example.com');
      expect(connections).toContain('https://rpc2.example.com');
    });
  });

  describe('closeConnection', () => {
    it('should close specific connection', async () => {
      const rpcUrl = 'https://test-rpc.example.com';
      await service.createConnection(rpcUrl);
      
      await service.closeConnection(rpcUrl);
      
      const connections = service.getActiveConnections();
      expect(connections).not.toContain(rpcUrl);
    });
  });

  describe('closeAllConnections', () => {
    it('should close all connections', async () => {
      await service.createConnection('https://rpc1.example.com');
      await service.createConnection('https://rpc2.example.com');
      
      await service.closeAllConnections();
      
      const connections = service.getActiveConnections();
      expect(connections).toHaveLength(0);
    });
  });
});