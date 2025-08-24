import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('gRPC');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'portfolio',
        protoPath: join(process.cwd(), 'proto/portfolio.proto'),
        url: '0.0.0.0:50051',
        loader: {
          enums: String,
          objects: true,
          arrays: true,
        },
        maxReceiveMessageLength: 1024 * 1024 * 100, // 100MB
        maxSendMessageLength: 1024 * 1024 * 100, // 100MB
      },
    },
  );

  await app.listen();
  logger.log('gRPC server is listening on port 50051');
}
bootstrap();
