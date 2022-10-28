import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import type { IMailService, InputWelcomeMail } from './mail.service.interface';

type MailDataDto = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class MailServiceAdaptor implements IMailService {
  constructor(@Inject('mail_queue') private readonly client: ClientProxy) {}

  private buildMailData({ email, username }: InputWelcomeMail): MailDataDto {
    return {
      to: email,
      subject: 'Welcome to the S1 auth service!',
      text: `Welcome to the S1 auth service, ${username}!`,
      html: `<b>Welcome to the S1 auth service, ${username}!</b>`,
    };
  }

  async welcomeMail(data: InputWelcomeMail): Promise<void> {
    this.client.emit('send_welcome_mail', this.buildMailData(data));
  }
}
