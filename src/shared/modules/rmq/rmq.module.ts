import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { RmqService } from './rmq.service';

import { RABBITMQ_QUEUE, RABBITMQ_URL } from '@shared/utils/constants';

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  public static register(name: string): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.get<string>(RABBITMQ_URL)],
                queue: configService.get<string>(RABBITMQ_QUEUE(name)),
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
