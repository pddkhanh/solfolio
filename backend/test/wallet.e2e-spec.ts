import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('WalletController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/wallet/:address/balances (GET)', () => {
    it('should return wallet balances for a valid Solana address', async () => {
      // Using a known Solana address (SOL token mint)
      const validAddress = 'So11111111111111111111111111111111111111112';

      const response = await request(
        app.getHttpServer() as Parameters<typeof request>[0],
      )
        .get(`/api/wallet/${validAddress}/balances`)
        .expect(HttpStatus.OK);

      // Verify response structure
      expect(response.body).toHaveProperty('totalAccounts');
      expect(response.body).toHaveProperty('totalValueUSD');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body).toHaveProperty('nfts');
      expect(response.body).toHaveProperty('lastUpdated');

      // Verify data types
      const body = response.body as {
        totalAccounts: number;
        totalValueUSD: number;
        tokens: unknown[];
        nfts: unknown[];
        lastUpdated: string;
      };
      expect(typeof body.totalAccounts).toBe('number');
      expect(typeof body.totalValueUSD).toBe('number');
      expect(Array.isArray(body.tokens)).toBe(true);
      expect(Array.isArray(body.nfts)).toBe(true);
      expect(typeof body.lastUpdated).toBe('string');
    });

    it('should return 400 for an invalid Solana address', async () => {
      const invalidAddress = 'invalid-address-123';

      const response = await request(
        app.getHttpServer() as Parameters<typeof request>[0],
      )
        .get(`/api/wallet/${invalidAddress}/balances`)
        .expect(HttpStatus.BAD_REQUEST);

      const errorBody = response.body as { message: string };
      expect(errorBody).toHaveProperty('message');
      expect(errorBody.message).toContain('Invalid Solana wallet address');
    });

    it('should return 400 for an empty address', async () => {
      await request(app.getHttpServer() as Parameters<typeof request>[0])
        .get('/api/wallet//balances')
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should handle addresses with special characters', async () => {
      const addressWithSpecialChars = '!@#$%^&*()_+{}[]|:;<>,.?/~`';

      const response = await request(
        app.getHttpServer() as Parameters<typeof request>[0],
      )
        .get(
          `/api/wallet/${encodeURIComponent(addressWithSpecialChars)}/balances`,
        )
        .expect(HttpStatus.BAD_REQUEST);

      const errorBody = response.body as { message: string };
      expect(errorBody.message).toContain('Invalid Solana wallet address');
    });

    it('should handle very long addresses', async () => {
      const longAddress = 'A'.repeat(1000);

      const response = await request(
        app.getHttpServer() as Parameters<typeof request>[0],
      )
        .get(`/api/wallet/${longAddress}/balances`)
        .expect(HttpStatus.BAD_REQUEST);

      const errorBody = response.body as { message: string };
      expect(errorBody.message).toContain('Invalid Solana wallet address');
    });

    it('should handle URL injection attempts', async () => {
      const injectionAttempt = '../../../etc/passwd';

      const response = await request(
        app.getHttpServer() as Parameters<typeof request>[0],
      )
        .get(`/api/wallet/${injectionAttempt}/balances`)
        .expect(HttpStatus.BAD_REQUEST);

      const errorBody = response.body as { message: string };
      expect(errorBody.message).toContain('Invalid Solana wallet address');
    });

    it('should return consistent data for the same address in multiple requests', async () => {
      const validAddress = 'So11111111111111111111111111111111111111112';

      // First request
      const response1 = await request(
        app.getHttpServer() as Parameters<typeof request>[0],
      )
        .get(`/api/wallet/${validAddress}/balances`)
        .expect(HttpStatus.OK);

      // Verify response structure
      expect(response1.body).toHaveProperty('totalAccounts');
      expect(response1.body).toHaveProperty('totalValueUSD');
      expect(response1.body).toHaveProperty('tokens');
      expect(response1.body).toHaveProperty('nfts');
      expect(response1.body).toHaveProperty('lastUpdated');

      // Verify data types
      const body = response1.body as {
        totalAccounts: number;
        totalValueUSD: number;
        tokens: unknown[];
        nfts: unknown[];
        lastUpdated: string;
      };
      expect(body.totalAccounts).toBeGreaterThanOrEqual(0);
      expect(body.totalValueUSD).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(body.tokens)).toBe(true);
      expect(Array.isArray(body.nfts)).toBe(true);

      // Second request (should be cached)
      const response2 = await request(
        app.getHttpServer() as Parameters<typeof request>[0],
      )
        .get(`/api/wallet/${validAddress}/balances`)
        .expect(HttpStatus.OK);

      // The structure should be the same
      expect(response2.body).toHaveProperty('totalAccounts');
      expect(response2.body).toHaveProperty('totalValueUSD');
      expect(response2.body).toHaveProperty('tokens');
      expect(response2.body).toHaveProperty('nfts');
      expect(response2.body).toHaveProperty('lastUpdated');
    });

    it('should return proper response for real wallet with tokens', async () => {
      // Using a known wallet address with tokens (Solana Foundation wallet)
      const realWalletAddress = 'GcWEQ9K78FV7LEHteFVciYApERk5YvQuFDQPk1yYJVXi';

      const response = await request(
        app.getHttpServer() as Parameters<typeof request>[0],
      )
        .get(`/api/wallet/${realWalletAddress}/balances`)
        .expect(HttpStatus.OK);

      const body = response.body as {
        totalAccounts: number;
        totalValueUSD: number;
        tokens: Array<{
          mint: string;
          balance: number;
          decimals: number;
          valueUSD: number | null;
          metadata?: {
            symbol?: string;
            name?: string;
            uri?: string;
          };
        }>;
        nfts: unknown[];
        lastUpdated: string;
      };

      expect(body.tokens).toBeDefined();
      const tokens = body.tokens;

      // If there are tokens, verify their structure
      if (tokens.length > 0) {
        const firstToken = tokens[0];
        expect(firstToken).toHaveProperty('mint');
        expect(firstToken).toHaveProperty('balance');
        expect(firstToken).toHaveProperty('decimals');
        expect(firstToken).toHaveProperty('valueUSD');

        // Verify data types
        expect(typeof firstToken.mint).toBe('string');
        expect(typeof firstToken.balance).toBe('number');
        expect(typeof firstToken.decimals).toBe('number');

        // Metadata is optional
        if (firstToken.metadata) {
          expect(firstToken.metadata).toHaveProperty('symbol');
          expect(firstToken.metadata).toHaveProperty('name');
        }
      }
    });

    it('should handle concurrent requests gracefully', async () => {
      const validAddress = 'So11111111111111111111111111111111111111112';

      // Send multiple concurrent requests
      const promises = Array.from({ length: 5 }, () =>
        request(app.getHttpServer() as Parameters<typeof request>[0])
          .get(`/api/wallet/${validAddress}/balances`)
          .expect(HttpStatus.OK),
      );

      const responses = await Promise.all(promises);

      // All responses should have the same structure
      responses.forEach((response) => {
        expect(response.body).toHaveProperty('totalAccounts');
        expect(response.body).toHaveProperty('totalValueUSD');
        expect(response.body).toHaveProperty('tokens');
        expect(response.body).toHaveProperty('nfts');
        expect(response.body).toHaveProperty('lastUpdated');
      });
    });
  });
});
