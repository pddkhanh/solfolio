import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConnectionManager } from './connection-manager.service';
import { RateLimiterService } from './rate-limiter.service';
import { CircuitBreakerService } from '../common/circuit-breaker/circuit-breaker.service';
import { Connection } from '@solana/web3.js';

jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getSlot: jest.fn().mockResolvedValue(12345),
  })),
  PublicKey: jest.fn(),
}));

describe('ConnectionManager', () => {
  let service: ConnectionManager;
  const mockWaitForSlot = jest.fn().mockResolvedValue(undefined);

  beforeEach(async () => {
    mockWaitForSlot.mockClear();

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
            waitForSlot: mockWaitForSlot,
          },
        },
        {
          provide: CircuitBreakerService,
          useValue: {
            execute: jest
              .fn()
              .mockImplementation((_, operation) => operation()),
          },
        },
      ],
    }).compile();

    service = module.get<ConnectionManager>(ConnectionManager);

    // Mock the logger to prevent console output during tests
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConnection', () => {
    it('should create a new connection', () => {
      const rpcUrl = 'https://test-rpc.example.com';
      const connection = service.createConnection(rpcUrl);

      expect(connection).toBeDefined();
      expect(Connection).toHaveBeenCalledWith(
        rpcUrl,
        expect.objectContaining({
          commitment: 'confirmed',
        }),
      );
    });

    it('should reuse existing connection for same URL', () => {
      const rpcUrl = 'https://test-rpc.example.com';

      const conn1 = service.createConnection(rpcUrl);
      const conn2 = service.createConnection(rpcUrl);

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
      expect(mockWaitForSlot).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error', async () => {
      const mockOperation = jest
        .fn()
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

      await expect(service.executeWithRetry(mockOperation)).rejects.toThrow(
        'Invalid public key',
      );

      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('testConnection', () => {
    it('should return true for valid connection', async () => {
      const mockConnection = {
        getSlot: jest.fn().mockResolvedValue(12345),
      } as unknown as Connection;

      const result = await service.testConnection(mockConnection);
      expect(result).toBe(true);
    });

    it('should return false for invalid connection', async () => {
      const mockConnection = {
        getSlot: jest.fn().mockRejectedValue(new Error('Connection failed')),
      } as unknown as Connection;

      const result = await service.testConnection(mockConnection);
      expect(result).toBe(false);
    });
  });

  describe('getActiveConnections', () => {
    it('should return list of active connections', () => {
      service.createConnection('https://rpc1.example.com');
      service.createConnection('https://rpc2.example.com');

      const connections = service.getActiveConnections();
      expect(connections).toHaveLength(2);
      expect(connections).toContain('https://rpc1.example.com');
      expect(connections).toContain('https://rpc2.example.com');
    });
  });

  describe('closeConnection', () => {
    it('should close specific connection', () => {
      const rpcUrl = 'https://test-rpc.example.com';
      service.createConnection(rpcUrl);

      service.closeConnection(rpcUrl);

      const connections = service.getActiveConnections();
      expect(connections).not.toContain(rpcUrl);
    });
  });

  describe('closeAllConnections', () => {
    it('should close all connections', () => {
      service.createConnection('https://rpc1.example.com');
      service.createConnection('https://rpc2.example.com');

      service.closeAllConnections();

      const connections = service.getActiveConnections();
      expect(connections).toHaveLength(0);
    });
  });
});
