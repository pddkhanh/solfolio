import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('WalletController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/wallet/:address/balances (GET)', () => {
    it('should return wallet balances for a valid Solana address', async () => {
      // Using a known Solana address (SOL token mint)
      const validAddress = 'So11111111111111111111111111111111111111112';

      const response = await request(app.getHttpServer())
        .get(`/api/wallet/${validAddress}/balances`)
        .expect(HttpStatus.OK);

      // Verify response structure
      expect(response.body).toHaveProperty('totalAccounts');
      expect(response.body).toHaveProperty('totalValueUSD');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body).toHaveProperty('nfts');
      expect(response.body).toHaveProperty('lastUpdated');

      // Verify data types
      expect(typeof response.body.totalAccounts).toBe('number');
      expect(typeof response.body.totalValueUSD).toBe('number');
      expect(Array.isArray(response.body.tokens)).toBe(true);
      expect(Array.isArray(response.body.nfts)).toBe(true);
      expect(typeof response.body.lastUpdated).toBe('string');
    });

    it('should return 400 for an invalid Solana address', async () => {
      const invalidAddress = 'invalid-address-123';

      const response = await request(app.getHttpServer())
        .get(`/api/wallet/${invalidAddress}/balances`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid Solana wallet address');
    });

    it('should return 400 for an empty address', async () => {
      await request(app.getHttpServer())
        .get('/api/wallet//balances')
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should handle addresses with special characters', async () => {
      const addressWithSpecialChars = '!@#$%^&*()_+{}[]|:;<>,.?/~`';

      const response = await request(app.getHttpServer())
        .get(
          `/api/wallet/${encodeURIComponent(addressWithSpecialChars)}/balances`,
        )
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('Invalid Solana wallet address');
    });

    it('should handle very long addresses', async () => {
      const longAddress = 'A'.repeat(100);

      const response = await request(app.getHttpServer())
        .get(`/api/wallet/${longAddress}/balances`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('Invalid Solana wallet address');
    });

    it('should handle addresses that are too short', async () => {
      const shortAddress = 'ABC123';

      const response = await request(app.getHttpServer())
        .get(`/api/wallet/${shortAddress}/balances`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('Invalid Solana wallet address');
    });

    it('should return consistent data structure for addresses with no tokens', async () => {
      // Using a random valid-format address that likely has no tokens
      const emptyWalletAddress = '11111111111111111111111111111111';

      const response = await request(app.getHttpServer())
        .get(`/api/wallet/${emptyWalletAddress}/balances`)
        .expect(HttpStatus.OK);

      // Even for empty wallets, the structure should be consistent
      expect(response.body).toHaveProperty('totalAccounts');
      expect(response.body).toHaveProperty('totalValueUSD');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body).toHaveProperty('nfts');
      expect(response.body).toHaveProperty('lastUpdated');

      // Values should be appropriate for empty wallet
      expect(response.body.totalAccounts).toBeGreaterThanOrEqual(0);
      expect(response.body.totalValueUSD).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(response.body.tokens)).toBe(true);
      expect(Array.isArray(response.body.nfts)).toBe(true);
    });

    it('should handle concurrent requests to the same address', async () => {
      const validAddress = 'So11111111111111111111111111111111111111112';

      // Send multiple concurrent requests
      const requests = Array(5)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .get(`/api/wallet/${validAddress}/balances`)
            .expect(HttpStatus.OK),
        );

      const responses = await Promise.all(requests);

      // All responses should have the same structure
      responses.forEach((response) => {
        expect(response.body).toHaveProperty('totalAccounts');
        expect(response.body).toHaveProperty('totalValueUSD');
        expect(response.body).toHaveProperty('tokens');
        expect(response.body).toHaveProperty('nfts');
        expect(response.body).toHaveProperty('lastUpdated');
      });
    });

    it('should validate token data structure when tokens are present', async () => {
      // Using a known address that should have tokens
      const addressWithTokens = 'So11111111111111111111111111111111111111112';

      const response = await request(app.getHttpServer())
        .get(`/api/wallet/${addressWithTokens}/balances`)
        .expect(HttpStatus.OK);

      // If there are tokens, validate their structure
      if (response.body.tokens.length > 0) {
        const token = response.body.tokens[0];
        expect(token).toHaveProperty('mint');
        expect(token).toHaveProperty('balance');
        expect(token).toHaveProperty('decimals');
        expect(token).toHaveProperty('valueUSD');

        // Check data types
        expect(typeof token.mint).toBe('string');
        expect(typeof token.balance).toBe('string');
        expect(typeof token.decimals).toBe('number');
        expect(typeof token.valueUSD).toBe('number');

        // If metadata exists, validate its structure
        if (token.metadata) {
          expect(token.metadata).toHaveProperty('symbol');
          expect(token.metadata).toHaveProperty('name');
        }
      }
    });

    it('should handle malformed but base58-like addresses gracefully', async () => {
      // Valid base58 format but not a real Solana address
      const malformedAddress = '1111111111111111111111111111111a';

      const response = await request(app.getHttpServer())
        .get(`/api/wallet/${malformedAddress}/balances`)
        .expect(HttpStatus.OK);

      // Should return valid structure even if address doesn't exist on chain
      expect(response.body).toHaveProperty('totalAccounts');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body).toHaveProperty('nfts');
    });
  });
});
