import { Injectable } from '@nestjs/common';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class RmqService {
  public getOptions(queue: string, noAck = false): RmqOptions {
    const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

    return {
      transport: Transport.RMQ,
      options: {
        urls: [RABBITMQ_URL],
        queue,
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
}
