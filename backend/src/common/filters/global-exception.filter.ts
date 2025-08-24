import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  details?: any;
  correlationId?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const correlationId = this.generateCorrelationId();
    
    let status: number;
    let message: string | string[];
    let error: string;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = HttpStatus[status];
      } else {
        const responseObject = exceptionResponse as any;
        message = responseObject.message || exception.message;
        error = responseObject.error || HttpStatus[status];
        details = responseObject.details;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = this.shouldExposeError(exception) 
        ? exception.message 
        : 'Internal server error occurred';
      error = 'Internal Server Error';
      details = process.env.NODE_ENV === 'development' ? exception.stack : undefined;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      error = 'Internal Server Error';
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      correlationId,
      ...(details && { details }),
    };

    // Log the error with appropriate level
    const logContext = {
      correlationId,
      method: request.method,
      url: request.url,
      statusCode: status,
      userAgent: request.get('user-agent'),
      ip: request.ip,
      ...(request.body && Object.keys(request.body).length > 0 && {
        body: this.sanitizeRequestBody(request.body),
      }),
    };

    if (status >= 500) {
      this.logger.error(
        `${message} - ${exception instanceof Error ? exception.stack : JSON.stringify(exception)}`,
        logContext,
      );
    } else if (status >= 400) {
      this.logger.warn(`Client error: ${message}`, logContext);
    }

    response.status(status).json(errorResponse);
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldExposeError(error: Error): boolean {
    // List of error types that are safe to expose to clients
    const safeErrors = [
      'ValidationError',
      'CastError',
      'JsonWebTokenError',
      'TokenExpiredError',
      'MulterError',
    ];

    return safeErrors.some(safe => 
      error.constructor.name === safe || 
      error.name === safe
    );
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