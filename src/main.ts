import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const GRPC_URL = process.env.GRPC_URL || 'localhost:50051';

  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: GRPC_URL,
      package: 'proto.users',
      protoPath: join(__dirname, 'users/infra/grpc/proto/user.proto'),
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
