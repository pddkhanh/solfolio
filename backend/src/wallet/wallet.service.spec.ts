import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ConnectionManager } from '../blockchain/connection-manager.service';
import { RateLimiterService } from '../blockchain/rate-limiter.service';
import { RpcBatchService } from '../blockchain/rpc-batch.service';
import { TokenMetadataService } from './token-metadata.service';
import { PriceService } from '../price/price.service';
import { PublicKey, Connection } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

describe('WalletService', () => {
  let service: WalletService;
  let blockchainService: jest.Mocked<BlockchainService>;
  let connectionManager: jest.Mocked<ConnectionManager>;
  let rateLimiter: jest.Mocked<RateLimiterService>;
  let mockConnection: jest.Mocked<Connection>;

  beforeEach(async () => {
    mockConnection = {
      getBalance: jest.fn(),
      getParsedTokenAccountsByOwner: jest.fn(),
    } as unknown as jest.Mocked<Connection>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: BlockchainService,
          useValue: {
            getConnection: jest.fn().mockReturnValue(mockConnection),
          },
        },
        {
          provide: ConnectionManager,
          useValue: {
            executeWithRetry: jest
              .fn()
              .mockImplementation(<T>(fn: () => T): T => fn()),
          },
        },
        {
          provide: RateLimiterService,
          useValue: {
            waitForSlot: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: RpcBatchService,
          useValue: {
            getBalance: jest.fn(),
            getAccountInfo: jest.fn(),
            batchGetParsedTokenAccountsByOwner: jest
              .fn()
              .mockResolvedValue(new Map()),
            getMultipleTokenAccounts: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: TokenMetadataService,
          useValue: {
            getTokenMetadata: jest.fn().mockResolvedValue({
              symbol: 'TEST',
              name: 'Test Token',
              logoUri: 'https://test.com/logo.png',
            }),
          },
        },
        {
          provide: PriceService,
          useValue: {
            getTokenPrices: jest.fn().mockResolvedValue(
              new Map([
                ['So11111111111111111111111111111111111112', 100],
                ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 1],
              ]),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    blockchainService = module.get(BlockchainService);
    connectionManager = module.get(ConnectionManager);
    rateLimiter = module.get(RateLimiterService);

    // Ensure services are defined
    expect(blockchainService).toBeDefined();
    expect(connectionManager).toBeDefined();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWalletBalances', () => {
    const testWalletAddress = '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv';

    it('should fetch native SOL balance', async () => {
      const mockBalance = 1000000000; // 1 SOL in lamports
      mockConnection.getBalance.mockResolvedValue(mockBalance);
      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue({
        value: [],
      } as any);

      const result = await service.getWalletBalances(testWalletAddress);

      expect(result.nativeSol).toEqual({
        amount: '1000000000',
        decimals: 9,
        uiAmount: 1,
      });
      expect(result.wallet).toBe(testWalletAddress);
    });

    it('should fetch token accounts', async () => {
      mockConnection.getBalance.mockResolvedValue(0);

      const mockTokenAccount = {
        pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        account: {
          data: {
            parsed: {
              info: {
                mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                owner: testWalletAddress,
                tokenAmount: {
                  amount: '1000000',
                  decimals: 6,
                  uiAmount: 1,
                },
              },
            },
          },
        },
      };

      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValueOnce({
        value: [mockTokenAccount],
      } as any);

      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValueOnce({
        value: [],
      } as any);

      const result = await service.getWalletBalances(testWalletAddress);

      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0]).toMatchObject({
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        owner: testWalletAddress,
        amount: '1000000',
        decimals: 6,
        uiAmount: 1,
        symbol: 'TEST',
        name: 'Test Token',
      });
      expect(result.totalAccounts).toBe(1);
    });

    it('should filter out zero balance tokens', async () => {
      mockConnection.getBalance.mockResolvedValue(0);

      const mockTokenAccount = {
        pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        account: {
          data: {
            parsed: {
              info: {
                mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                owner: testWalletAddress,
                tokenAmount: {
                  amount: '0',
                  decimals: 6,
                  uiAmount: 0,
                },
              },
            },
          },
        },
      };

      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue({
        value: [mockTokenAccount],
      } as any);

      const result = await service.getWalletBalances(testWalletAddress);

      expect(result.tokens).toHaveLength(0);
      expect(result.totalAccounts).toBe(0);
    });

    it('should fetch both TOKEN_PROGRAM and TOKEN_2022_PROGRAM accounts', async () => {
      mockConnection.getBalance.mockResolvedValue(0);
      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue({
        value: [],
      } as any);

      await service.getWalletBalances(testWalletAddress);

      expect(
        mockConnection.getParsedTokenAccountsByOwner as jest.Mock,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockConnection.getParsedTokenAccountsByOwner as jest.Mock,
      ).toHaveBeenCalledWith(expect.any(PublicKey), {
        programId: TOKEN_PROGRAM_ID,
      });
      expect(
        mockConnection.getParsedTokenAccountsByOwner as jest.Mock,
      ).toHaveBeenCalledWith(expect.any(PublicKey), {
        programId: TOKEN_2022_PROGRAM_ID,
      });
    });

    it('should check rate limits before making requests', async () => {
      mockConnection.getBalance.mockResolvedValue(0);
      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue({
        value: [],
      } as any);

      await service.getWalletBalances(testWalletAddress);

      expect(rateLimiter.waitForSlot).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Connection failed');
      mockConnection.getBalance.mockRejectedValue(error);

      await expect(
        service.getWalletBalances(testWalletAddress),
      ).rejects.toThrow(error);
    });
  });
});
