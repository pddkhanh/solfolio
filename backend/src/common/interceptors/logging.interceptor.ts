import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface RequestLog {
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  correlationId: string;
  timestamp: string;
  duration?: number;
  statusCode?: number;
  responseSize?: number;
  error?: any;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const correlationId = this.generateCorrelationId();
    const startTime = Date.now();

    const requestLog: RequestLog = {
      method: request.method,
      url: request.url,
      userAgent: request.get('user-agent'),
      ip: request.ip,
      correlationId,
      timestamp: new Date().toISOString(),
    };

    // Add correlation ID to response headers for tracing
    response.setHeader('X-Correlation-ID', correlationId);

    // Log the incoming request
    this.logger.log(
      `Incoming ${request.method} ${request.url}`,
      {
        ...requestLog,
        body: this.sanitizeRequestBody(request.body),
        query: request.query,
      },
    );

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const responseSize = JSON.stringify(data || {}).length;

        this.logger.log(
          `Completed ${request.method} ${request.url} - ${response.statusCode}`,
          {
            ...requestLog,
            duration,
            statusCode: response.statusCode,
            responseSize,
          },
        );

        // Log slow requests
        if (duration > 5000) { // 5 seconds
          this.logger.warn(
            `Slow request detected: ${request.method} ${request.url}`,
            {
              ...requestLog,
              duration,
              threshold: 5000,
            },
          );
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        this.logger.error(
          `Failed ${request.method} ${request.url} - ${error.status || 500}`,
          {
            ...requestLog,
            duration,
            statusCode: error.status || 500,
            error: {
              name: error.name,
              message: error.message,
              stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
          },
        );

        throw error;
      }),
    );
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'privateKey',
      'apiKey',
      'authorization',
    ];

    const sanitized = { ...body };
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}