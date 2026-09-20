import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { getRequiredEnv, RmqService } from '#shared/modules/rmq/rmq.service';

import { RABBITMQ_QUEUE, RABBITMQ_URL } from '#shared/utils/constants/index';

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
                urls: [getRequiredEnv(configService, RABBITMQ_URL)],
                queue: getRequiredEnv(configService, RABBITMQ_QUEUE(name)),
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
