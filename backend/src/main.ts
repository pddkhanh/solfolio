import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend development
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix for all routes except health
  app.setGlobalPrefix('api', {
    exclude: ['health', 'health/ping', 'health/ready', 'health/live'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Backend server is running on http://localhost:${port}`);
  logger.log(`📊 Health check available at http://localhost:${port}/health`);
  logger.log(`🔌 API endpoints available at http://localhost:${port}/api`);
}
void bootstrap();
