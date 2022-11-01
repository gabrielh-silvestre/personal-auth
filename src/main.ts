import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';

import { AppModule } from './app.module';
import { GlobalExceptionRestFilter } from '@shared/infra/GlobalException.filter';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const GRPC_URL = process.env.GRPC_URL || 'localhost:50051';

  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionRestFilter());
  app.use(cookieParser());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: GRPC_URL,
      package: ['proto.users', 'proto.tokens', 'proto.auth'],
      protoPath: [
        join(__dirname, '../users/infra/proto/user.proto'),
        join(__dirname, '../tokens/infra/proto/token.proto'),
        join(__dirname, '../auth/infra/proto/auth.proto'),
      ],
    },
  });

  await app.listen(PORT);
  await app.startAllMicroservices();
}
bootstrap();
