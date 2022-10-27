import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import type { IMailService, InputWelcomeMail } from './mail.service.interface';

@Injectable()
export class MailServiceAdaptor implements IMailService {
  constructor(@Inject('mail_queue') private readonly client: ClientProxy) {}

  async welcomeMail({ email, username }: InputWelcomeMail): Promise<void> {
    this.client.emit('send_welcome_mail', {
      email,
      username,
    });
  }
}
