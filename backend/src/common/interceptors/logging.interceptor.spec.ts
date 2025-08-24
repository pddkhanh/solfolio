import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Request, Response } from 'express';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockExecutionContext: Partial<ExecutionContext>;
  let mockCallHandler: Partial<CallHandler>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);

    mockResponse = {
      setHeader: jest.fn(),
      statusCode: 200,
    };

    mockRequest = {
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
      get: jest.fn((header: string) => {
        if (header === 'user-agent') return 'test-agent';
        return undefined;
      }),
      body: { username: 'test' },
      query: { page: '1' },
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should log successful requests', (done) => {
      const mockData = { result: 'success' };
      mockCallHandler = {
        handle: jest.fn().mockReturnValue(of(mockData)),
      };

      const logSpy = jest
        .spyOn(interceptor['logger'], 'log')
        .mockImplementation();

      const result = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result.subscribe({
        next: (data) => {
          expect(data).toEqual(mockData);
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'X-Correlation-ID',
            expect.any(String),
          );
          expect(logSpy).toHaveBeenCalledWith(
            'Incoming GET /test',
            expect.objectContaining({
              method: 'GET',
              url: '/test',
              userAgent: 'test-agent',
              ip: '127.0.0.1',
              correlationId: expect.any(String),
              timestamp: expect.any(String),
              body: { username: 'test' },
              query: { page: '1' },
            }),
          );
          expect(logSpy).toHaveBeenCalledWith(
            'Completed GET /test - 200',
            expect.objectContaining({
              duration: expect.any(Number),
              statusCode: 200,
              responseSize: expect.any(Number),
            }),
          );
          logSpy.mockRestore();
          done();
        },
      });
    });

    it('should log failed requests', (done) => {
      interface ErrorWithStatus extends Error {
        status?: number;
      }
      const mockError: ErrorWithStatus = new Error('Test error');
      mockError.status = 500;

      mockCallHandler = {
        handle: jest.fn().mockReturnValue(throwError(() => mockError)),
      };

      const logSpy = jest
        .spyOn(interceptor['logger'], 'log')
        .mockImplementation();
      const errorSpy = jest
        .spyOn(interceptor['logger'], 'error')
        .mockImplementation();

      const result = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result.subscribe({
        error: (error) => {
          expect(error).toBe(mockError);
          expect(errorSpy).toHaveBeenCalledWith(
            'Failed GET /test - 500',
            expect.objectContaining({
              duration: expect.any(Number),
              statusCode: 500,
              error: {
                name: 'Error',
                message: 'Test error',
                stack: undefined, // Not in development mode
              },
            }),
          );
          logSpy.mockRestore();
          errorSpy.mockRestore();
          done();
        },
      });
    });

    it('should warn about slow requests', (done) => {
      const mockData = { result: 'success' };

      // Mock Date.now properly with jest
      const nowSpy = jest
        .spyOn(Date, 'now')
        .mockReturnValueOnce(0) // First call (start time)
        .mockReturnValueOnce(6000); // Second call (end time - 6 seconds later)

      mockCallHandler = {
        handle: jest.fn().mockReturnValue(of(mockData)),
      };

      const logSpy = jest
        .spyOn(interceptor['logger'], 'log')
        .mockImplementation();
      const warnSpy = jest
        .spyOn(interceptor['logger'], 'warn')
        .mockImplementation();

      const result = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result.subscribe({
        next: () => {
          expect(warnSpy).toHaveBeenCalledWith(
            'Slow request detected: GET /test',
            expect.objectContaining({
              duration: expect.any(Number),
              threshold: 5000,
            }),
          );

          // Verify the duration is greater than 5000 (slow threshold)
          const warnCall = warnSpy.mock.calls[0];
          expect(warnCall[1].duration).toBeGreaterThan(5000);
          nowSpy.mockRestore();
          logSpy.mockRestore();
          warnSpy.mockRestore();
          done();
        },
      });
    });

    it('should sanitize sensitive data in request body', (done) => {
      mockRequest.body = {
        username: 'test',
        password: 'secret123',
        token: 'jwt-token',
        apiKey: 'api-key-123',
        normalField: 'normal-value',
      };

      mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({ result: 'success' })),
      };

      const logSpy = jest
        .spyOn(interceptor['logger'], 'log')
        .mockImplementation();

      const result = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result.subscribe({
        next: () => {
          expect(logSpy).toHaveBeenCalledWith(
            'Incoming GET /test',
            expect.objectContaining({
              body: {
                username: 'test',
                password: '[REDACTED]',
                token: '[REDACTED]',
                apiKey: '[REDACTED]',
                normalField: 'normal-value',
              },
            }),
          );
          logSpy.mockRestore();
          done();
        },
      });
    });

    it('should handle requests with no body', (done) => {
      mockRequest.body = undefined;

      mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({ result: 'success' })),
      };

      const logSpy = jest
        .spyOn(interceptor['logger'], 'log')
        .mockImplementation();

      const result = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result.subscribe({
        next: () => {
          expect(logSpy).toHaveBeenCalledWith(
            'Incoming GET /test',
            expect.objectContaining({
              body: undefined,
            }),
          );
          logSpy.mockRestore();
          done();
        },
      });
    });

    it('should generate unique correlation IDs', (done) => {
      mockCallHandler = {
        handle: jest.fn().mockReturnValue(of({ result: 'success' })),
      };

      const correlationIds: string[] = [];
      const originalSetHeader = mockResponse.setHeader;
      mockResponse.setHeader = jest.fn((name: string, value: string) => {
        if (name === 'X-Correlation-ID') {
          correlationIds.push(value);
        }
        return originalSetHeader?.call(mockResponse, name, value);
      });

      const result1 = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      const result2 = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      let completed = 0;
      const checkComplete = () => {
        completed++;
        if (completed === 2) {
          expect(correlationIds).toHaveLength(2);
          expect(correlationIds[0]).not.toBe(correlationIds[1]);
          done();
        }
      };

      result1.subscribe({ next: () => checkComplete() });
      result2.subscribe({ next: () => checkComplete() });
    });

    it('should include stack trace in development mode for errors', (done) => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      interface ErrorWithStatus extends Error {
        status?: number;
      }
      const mockError: ErrorWithStatus = new Error('Test error');
      mockError.status = 500;

      mockCallHandler = {
        handle: jest.fn().mockReturnValue(throwError(() => mockError)),
      };

      // Mock the logger's error method instead of console.error
      const errorSpy = jest
        .spyOn(interceptor['logger'], 'error')
        .mockImplementation();

      const result = interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      result.subscribe({
        error: () => {
          expect(errorSpy).toHaveBeenCalledWith(
            'Failed GET /test - 500',
            expect.objectContaining({
              error: {
                name: 'Error',
                message: 'Test error',
                stack: expect.any(String),
              },
            }),
          );
          process.env.NODE_ENV = originalEnv;
          errorSpy.mockRestore();
          done();
        },
      });
    });
  });
});
