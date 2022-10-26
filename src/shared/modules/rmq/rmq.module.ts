import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { RmqService } from './rmq.service';

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
            useFactory: () => ({
              transport: Transport.RMQ,
              options: {
                urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
                queue: process.env[name] || name,
              },
            }),
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
