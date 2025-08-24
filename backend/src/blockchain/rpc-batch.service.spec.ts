import { Test, TestingModule } from '@nestjs/testing';
import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';
import { RpcBatchService } from './rpc-batch.service';
import { ConnectionManager } from './connection-manager.service';
import { RateLimiterService } from './rate-limiter.service';

describe('RpcBatchService', () => {
  let service: RpcBatchService;
  let connectionManager: jest.Mocked<ConnectionManager>;
  let rateLimiter: jest.Mocked<RateLimiterService>;
  let mockConnection: jest.Mocked<Connection>;

  beforeEach(async () => {
    mockConnection = {
      getMultipleAccountsInfo: jest.fn(),
      getParsedTokenAccountsByOwner: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RpcBatchService,
        {
          provide: ConnectionManager,
          useValue: {
            executeWithRetry: jest.fn(),
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

    service = module.get<RpcBatchService>(RpcBatchService);
    connectionManager = module.get(ConnectionManager);
    rateLimiter = module.get(RateLimiterService);
  });

  afterEach(() => {
    service.clearPendingBatches();
    jest.clearAllMocks();
  });

  describe('getAccountInfo', () => {
    it('should batch multiple account info requests into a single RPC call', async () => {
      const publicKey1 = new PublicKey('11111111111111111111111111111112');
      const publicKey2 = new PublicKey('11111111111111111111111111111113');

      const mockAccounts: (AccountInfo<Buffer> | null)[] = [
        {
          data: Buffer.from('account1'),
          owner: PublicKey.default,
          lamports: 1000000,
          executable: false,
        },
        {
          data: Buffer.from('account2'),
          owner: PublicKey.default,
          lamports: 2000000,
          executable: false,
        },
      ];

      connectionManager.executeWithRetry.mockResolvedValue(mockAccounts);

      // Start two concurrent requests
      const promise1 = service.getAccountInfo(mockConnection, publicKey1);
      const promise2 = service.getAccountInfo(mockConnection, publicKey2);

      // Wait a bit for batching to occur
      await new Promise((resolve) => setTimeout(resolve, 20));

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Should have made only one RPC call for both requests
      expect(connectionManager.executeWithRetry).toHaveBeenCalledTimes(1);
      expect(rateLimiter.waitForSlot).toHaveBeenCalledTimes(1);

      expect(result1).toEqual(mockAccounts[0]);
      expect(result2).toEqual(mockAccounts[1]);
    });

    it('should handle null accounts correctly', async () => {
      const publicKey = new PublicKey('11111111111111111111111111111112');

      connectionManager.executeWithRetry.mockResolvedValue([null]);

      const result = await service.getAccountInfo(mockConnection, publicKey);

      expect(result).toBeNull();
    });

    it('should execute immediately when batch size is reached', async () => {
      const batchSize = 100; // Max batch size
      const publicKeys = Array.from(
        { length: batchSize },
        (_, i) => new PublicKey(new Uint8Array(32).fill(i)),
      );

      const mockAccounts = new Array(batchSize).fill(null);
      connectionManager.executeWithRetry.mockResolvedValue(mockAccounts);

      const promises = publicKeys.map((pk) =>
        service.getAccountInfo(mockConnection, pk),
      );

      const results = await Promise.all(promises);

      // Should execute immediately without waiting
      expect(connectionManager.executeWithRetry).toHaveBeenCalled();
      expect(results).toHaveLength(batchSize);
    });

    it.skip('should handle errors and reject all promises in the batch', (done) => {
      const publicKey1 = new PublicKey('11111111111111111111111111111112');
      const publicKey2 = new PublicKey('11111111111111111111111111111113');

      const error = new Error('RPC error');
      connectionManager.executeWithRetry.mockRejectedValue(error);

      const promise1 = service.getAccountInfo(mockConnection, publicKey1);
      const promise2 = service.getAccountInfo(mockConnection, publicKey2);

      // Wait for batching and check results
      setTimeout(() => {
        Promise.allSettled([promise1, promise2]).then((results) => {
          expect(results[0].status).toBe('rejected');
          expect(results[1].status).toBe('rejected');
          
          if (results[0].status === 'rejected') {
            expect(results[0].reason.message).toBe('RPC error');
          }
          if (results[1].status === 'rejected') {
            expect(results[1].reason.message).toBe('RPC error');
          }
          done();
        });
      }, 20);
    });
  });

  describe('getBalance', () => {
    it('should batch multiple balance requests', async () => {
      const publicKey1 = new PublicKey('11111111111111111111111111111112');
      const publicKey2 = new PublicKey('11111111111111111111111111111113');

      const mockAccounts: (AccountInfo<Buffer> | null)[] = [
        {
          data: Buffer.from(''),
          owner: PublicKey.default,
          lamports: 1000000000, // 1 SOL
          executable: false,
        },
        {
          data: Buffer.from(''),
          owner: PublicKey.default,
          lamports: 2000000000, // 2 SOL
          executable: false,
        },
      ];

      connectionManager.executeWithRetry.mockResolvedValue(mockAccounts);

      const promise1 = service.getBalance(mockConnection, publicKey1);
      const promise2 = service.getBalance(mockConnection, publicKey2);

      // Wait for batching
      await new Promise((resolve) => setTimeout(resolve, 20));

      const [balance1, balance2] = await Promise.all([promise1, promise2]);

      expect(connectionManager.executeWithRetry).toHaveBeenCalledTimes(1);
      expect(balance1).toBe(1000000000);
      expect(balance2).toBe(2000000000);
    });

    it('should return 0 for null accounts', async () => {
      const publicKey = new PublicKey('11111111111111111111111111111112');

      connectionManager.executeWithRetry.mockResolvedValue([null]);

      const balance = await service.getBalance(mockConnection, publicKey);

      expect(balance).toBe(0);
    });
  });

  describe('getMultipleTokenAccounts', () => {
    it('should handle empty array', async () => {
      const result = await service.getMultipleTokenAccounts(mockConnection, []);

      expect(result).toEqual([]);
      expect(connectionManager.executeWithRetry).not.toHaveBeenCalled();
    });

    it('should split large batches into chunks', async () => {
      const publicKeys = Array.from(
        { length: 250 },
        (_, i) => new PublicKey(new Uint8Array(32).fill(i)),
      );

      const mockAccounts = new Array(100).fill(null);
      connectionManager.executeWithRetry
        .mockResolvedValueOnce(mockAccounts) // First chunk
        .mockResolvedValueOnce(mockAccounts) // Second chunk
        .mockResolvedValueOnce(new Array(50).fill(null)); // Third chunk

      const result = await service.getMultipleTokenAccounts(
        mockConnection,
        publicKeys,
      );

      expect(connectionManager.executeWithRetry).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(250);
    });
  });

  describe('batchGetParsedTokenAccountsByOwner', () => {
    it('should batch token account requests for multiple owners', async () => {
      const owner1 = new PublicKey('11111111111111111111111111111112');
      const owner2 = new PublicKey('11111111111111111111111111111113');
      const programId = new PublicKey(
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      );

      const mockAccounts1 = [
        {
          pubkey: new PublicKey('11111111111111111111111111111114'),
          account: {
            data: { parsed: { info: { tokenAmount: { uiAmount: 100 } } } },
          },
        },
      ];

      const mockAccounts2 = [
        {
          pubkey: new PublicKey('11111111111111111111111111111115'),
          account: {
            data: { parsed: { info: { tokenAmount: { uiAmount: 200 } } } },
          },
        },
      ];

      mockConnection.getParsedTokenAccountsByOwner
        .mockResolvedValueOnce({ value: mockAccounts1 } as any)
        .mockResolvedValueOnce({ value: mockAccounts2 } as any);

      connectionManager.executeWithRetry.mockImplementation((fn) => fn());

      const result = await service.batchGetParsedTokenAccountsByOwner(
        mockConnection,
        [owner1, owner2],
        programId,
      );

      expect(result.size).toBe(2);
      expect(result.get(owner1.toBase58())).toEqual(mockAccounts1);
      expect(result.get(owner2.toBase58())).toEqual(mockAccounts2);
      expect(rateLimiter.waitForSlot).toHaveBeenCalledTimes(2);
    });

    it('should process large number of owners in batches', async () => {
      const owners = Array.from(
        { length: 25 },
        (_, i) => new PublicKey(new Uint8Array(32).fill(i)),
      );
      const programId = new PublicKey(
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      );

      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue({
        value: [],
      } as any);

      connectionManager.executeWithRetry.mockImplementation((fn) => fn());

      const result = await service.batchGetParsedTokenAccountsByOwner(
        mockConnection,
        owners,
        programId,
      );

      expect(result.size).toBe(25);
      // Should process in batches of 10
      expect(
        mockConnection.getParsedTokenAccountsByOwner,
      ).toHaveBeenCalledTimes(25);
    });
  });

  describe('batchGetTokenMetadata', () => {
    it('should return empty map for empty mints array', async () => {
      const result = await service.batchGetTokenMetadata(mockConnection, []);

      expect(result.size).toBe(0);
      expect(connectionManager.executeWithRetry).not.toHaveBeenCalled();
    });

    it('should batch metadata fetching for multiple mints', async () => {
      const mint1 = new PublicKey('11111111111111111111111111111112');
      const mint2 = new PublicKey('11111111111111111111111111111113');

      const mockAccounts: (AccountInfo<Buffer> | null)[] = [
        {
          data: Buffer.from('metadata1'),
          owner: PublicKey.default,
          lamports: 1000000,
          executable: false,
        },
        null,
      ];

      connectionManager.executeWithRetry.mockResolvedValue(mockAccounts);

      const result = await service.batchGetTokenMetadata(mockConnection, [
        mint1,
        mint2,
      ]);

      expect(result.size).toBe(1);
      expect(result.has(mint1.toBase58())).toBe(true);
      expect(result.has(mint2.toBase58())).toBe(false);
    });
  });

  describe('clearPendingBatches', () => {
    it('should clear all pending requests and reject them', async () => {
      const publicKey = new PublicKey('11111111111111111111111111111112');

      const promise1 = service.getAccountInfo(mockConnection, publicKey);
      const promise2 = service.getBalance(mockConnection, publicKey);

      // Clear before batches execute
      service.clearPendingBatches();

      await expect(promise1).rejects.toThrow('Batch cleared');
      await expect(promise2).rejects.toThrow('Batch cleared');
    });
  });
});
