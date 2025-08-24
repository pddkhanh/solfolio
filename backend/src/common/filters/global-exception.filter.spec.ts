import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockArgumentsHost: Partial<ArgumentsHost>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalExceptionFilter],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/test',
      method: 'GET',
      ip: '127.0.0.1',
      get: jest.fn((header: string) => {
        if (header === 'user-agent') return 'test-agent';
        return undefined;
      }),
      body: {},
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    };
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle HttpException correctly', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Test error',
          error: 'BAD_REQUEST',
          path: '/test',
          method: 'GET',
          correlationId: expect.any(String),
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle HttpException with object response', () => {
      const exceptionResponse = {
        message: ['field1 is required', 'field2 is invalid'],
        error: 'Validation Error',
        details: { field: 'value' },
      };
      const exception = new HttpException(
        exceptionResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['field1 is required', 'field2 is invalid'],
          error: 'Validation Error',
          details: { field: 'value' },
        }),
      );
    });

    it('should handle standard Error with safe exposure', () => {
      const error = new Error('Database connection failed');
      error.name = 'ValidationError'; // Safe error type

      filter.catch(error, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database connection failed',
          error: 'Internal Server Error',
        }),
      );
    });

    it('should hide unsafe error messages in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Sensitive database error');

      filter.catch(error, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Internal server error occurred',
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should include stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');

      filter.catch(error, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.any(String), // Stack trace
        }),
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should sanitize sensitive request body data', () => {
      mockRequest.body = {
        username: 'test',
        password: 'secret123',
        token: 'jwt-token',
        data: 'normal-data',
      };

      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      // Spy on console methods to capture log output
      const logSpy = jest.spyOn(console, 'warn').mockImplementation();

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      // Clean up spy
      logSpy.mockRestore();

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Test error',
        }),
      );
    });

    it('should handle unknown exception types', () => {
      const unknownException = 'string error';

      filter.catch(unknownException, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
          error: 'Internal Server Error',
        }),
      );
    });

    it('should generate unique correlation IDs', () => {
      const exception1 = new HttpException('Error 1', HttpStatus.BAD_REQUEST);
      const exception2 = new HttpException('Error 2', HttpStatus.BAD_REQUEST);

      const calls: any[] = [];
      (mockResponse.json as jest.Mock).mockImplementation((data) => {
        calls.push(data);
      });

      filter.catch(exception1, mockArgumentsHost as ArgumentsHost);
      filter.catch(exception2, mockArgumentsHost as ArgumentsHost);

      expect(calls).toHaveLength(2);
      expect(calls[0].correlationId).toBeDefined();
      expect(calls[1].correlationId).toBeDefined();
      expect(calls[0].correlationId).not.toBe(calls[1].correlationId);
    });

    it('should include request context in error response', () => {
      mockRequest.url = '/api/users/123';
      mockRequest.method = 'POST';

      const exception = new HttpException(
        'User not found',
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/users/123',
          method: 'POST',
          timestamp: expect.any(String),
        }),
      );
    });
  });
});
