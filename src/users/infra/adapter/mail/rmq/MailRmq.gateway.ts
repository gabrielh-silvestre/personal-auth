import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import type { IMailGateway, InputBody } from '../Mail.gateway.interface';

@Injectable()
export class MailRmqGateway implements IMailGateway {
  constructor(@Inject('MAIL') private readonly client: ClientProxy) {}

  async send(to: string, subject: string, body: InputBody): Promise<void> {
    this.client.emit('send', { to, subject, body });
  }
}
