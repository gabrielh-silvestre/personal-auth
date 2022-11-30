import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import type { IMailAdapter, InputBody } from '../Mail.adapter.interface';

@Injectable()
export class MailRmqAdapter implements IMailAdapter {
  constructor(@Inject('MAIL') private readonly client: ClientProxy) {}

  async send(to: string, subject: string, body: InputBody): Promise<void> {
    this.client.emit('send', { to, subject, body });
  }
}
