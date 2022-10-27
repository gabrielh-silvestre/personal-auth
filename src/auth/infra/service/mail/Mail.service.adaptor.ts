import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import type {
  IMailService,
  InputRecoverPasswordMail,
} from './mail.service.interface';

@Injectable()
export class MailServiceAdaptor implements IMailService {
  constructor(@Inject('mail_queue') private readonly client: ClientProxy) {}

  async recoverPasswordMail({
    email,
    username,
    token,
  }: InputRecoverPasswordMail): Promise<void> {
    this.client.emit('send_reset_password_mail', {
      email,
      username,
      token,
    });
  }
}
