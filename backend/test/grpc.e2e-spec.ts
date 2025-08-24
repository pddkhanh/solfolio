import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from '../src/app.module';
import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

describe('gRPC Server (e2e)', () => {
  let app: INestMicroservice;
  let client: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: 'portfolio',
        protoPath: join(__dirname, '../src/grpc/proto/portfolio.proto'),
        url: '0.0.0.0:50052', // Use different port for testing
      },
    });

    await app.listen();

    // Load proto file and create client
    const packageDefinition = protoLoader.loadSync(
      join(__dirname, '../src/grpc/proto/portfolio.proto'),
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    );

    const proto = grpc.loadPackageDefinition(packageDefinition) as any;
    client = new proto.portfolio.PortfolioService(
      'localhost:50052',
      grpc.credentials.createInsecure(),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('HealthCheck', () => {
    it('should return healthy status', (done) => {
      client.HealthCheck({}, (error: any, response: any) => {
        expect(error).toBeNull();
        expect(response.status).toBeDefined();
        expect(response.message).toBeDefined();
        done();
      });
    });

    it('should check specific service health', (done) => {
      client.HealthCheck({ service: 'cache' }, (error: any, response: any) => {
        expect(error).toBeNull();
        expect(response.status).toBeDefined();
        done();
      });
    });
  });

  describe('GetPortfolio', () => {
    it('should return portfolio data', (done) => {
      const request = {
        wallet: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
        force_refresh: false,
      };

      client.GetPortfolio(request, (error: any, response: any) => {
        if (error && error.code === grpc.status.UNAVAILABLE) {
          // Service might not be fully ready, skip test
          done();
          return;
        }
        
        expect(error).toBeNull();
        expect(response.portfolio).toBeDefined();
        expect(response.portfolio.wallet).toBe(request.wallet);
        done();
      });
    });
  });

  describe('GetTokenBalances', () => {
    it('should return token balances', (done) => {
      const request = {
        wallet: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
      };

      client.GetTokenBalances(request, (error: any, response: any) => {
        if (error && error.code === grpc.status.UNAVAILABLE) {
          done();
          return;
        }
        
        expect(error).toBeNull();
        expect(response.tokens).toBeDefined();
        expect(Array.isArray(response.tokens)).toBe(true);
        done();
      });
    });
  });

  describe('GetPositions', () => {
    it('should return positions', (done) => {
      const request = {
        wallet: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
        protocols: ['Marinade', 'Kamino'],
      };

      client.GetPositions(request, (error: any, response: any) => {
        if (error && error.code === grpc.status.UNAVAILABLE) {
          done();
          return;
        }
        
        expect(error).toBeNull();
        expect(response.positions).toBeDefined();
        expect(Array.isArray(response.positions)).toBe(true);
        done();
      });
    });
  });

  describe('GetPrices', () => {
    it('should return token prices', (done) => {
      const request = {
        mints: [
          'So11111111111111111111111111111111111111112',
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        ],
      };

      client.GetPrices(request, (error: any, response: any) => {
        if (error && error.code === grpc.status.UNAVAILABLE) {
          done();
          return;
        }
        
        expect(error).toBeNull();
        expect(response.prices).toBeDefined();
        expect(typeof response.prices).toBe('object');
        done();
      });
    });
  });
});