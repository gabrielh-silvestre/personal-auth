import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

import { RABBITMQ_QUEUE, RABBITMQ_URL } from '@shared/utils/constants';

@Injectable()
export class RmqService {
  constructor(private readonly configService: ConfigService) {}

  public getOptions(queue: string, noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>(RABBITMQ_URL)],
        queue: this.configService.get<string>(RABBITMQ_QUEUE(queue)),
        noAck,
        persistent: true,
      },
    };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    channel.ack(originalMessage);
  }

  nack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    channel.nack(originalMessage);
  }
}
