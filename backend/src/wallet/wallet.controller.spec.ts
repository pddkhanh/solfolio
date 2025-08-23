import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService, WalletBalances } from './wallet.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: jest.Mocked<WalletService>;

  const mockWalletBalances: WalletBalances = {
    wallet: '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
    nativeSol: {
      amount: '1000000000',
      decimals: 9,
      uiAmount: 1,
    },
    tokens: [
      {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        owner: '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        amount: '1000000',
        decimals: 6,
        uiAmount: 1,
        tokenAccount: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      },
    ],
    totalAccounts: 1,
    fetchedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: {
            getWalletBalances: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    walletService = module.get(WalletService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWalletBalances', () => {
    it('should return wallet balances for a valid address', async () => {
      const address = '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv';
      walletService.getWalletBalances.mockResolvedValue(mockWalletBalances);

      const result = await controller.getWalletBalances(address);

      expect(result).toEqual(mockWalletBalances);
      expect(walletService.getWalletBalances as jest.Mock).toHaveBeenCalledWith(
        address,
      );
    });

    it('should throw BAD_REQUEST for invalid address format', async () => {
      const invalidAddress = 'invalid-address';

      await expect(
        controller.getWalletBalances(invalidAddress),
      ).rejects.toThrow(
        new HttpException(
          'Invalid Solana wallet address',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(
        walletService.getWalletBalances as jest.Mock,
      ).not.toHaveBeenCalled();
    });

    it('should throw BAD_REQUEST for empty address', async () => {
      await expect(controller.getWalletBalances('')).rejects.toThrow(
        new HttpException(
          'Invalid Solana wallet address',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(
        walletService.getWalletBalances as jest.Mock,
      ).not.toHaveBeenCalled();
    });

    it('should throw BAD_REQUEST for address with invalid characters', async () => {
      const invalidAddress = '0OIl+/=address';

      await expect(
        controller.getWalletBalances(invalidAddress),
      ).rejects.toThrow(
        new HttpException(
          'Invalid Solana wallet address',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(
        walletService.getWalletBalances as jest.Mock,
      ).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      const address = '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv';
      const error = new Error('RPC connection failed');
      walletService.getWalletBalances.mockRejectedValue(error);

      await expect(controller.getWalletBalances(address)).rejects.toThrow(
        new HttpException(
          'Failed to fetch wallet balances',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should rethrow HttpExceptions from service', async () => {
      const address = '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv';
      const httpException = new HttpException(
        'Service error',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      walletService.getWalletBalances.mockRejectedValue(httpException);

      await expect(controller.getWalletBalances(address)).rejects.toThrow(
        httpException,
      );
    });
  });
});
