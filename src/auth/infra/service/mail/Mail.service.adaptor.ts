import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import type {
  IMailService,
  InputRecoverPasswordMail,
} from './mail.service.interface';

type MailDataDto = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class MailServiceAdaptor implements IMailService {
  constructor(@Inject('mail_queue') private readonly client: ClientProxy) {}

  private buildMailData({
    email,
    username,
    token,
  }: InputRecoverPasswordMail): MailDataDto {
    return {
      to: email,
      subject: 'Reset your password',
      text: `Hi ${username}, use this token to reset your password: ${token}`,
      html: `<b>Hi ${username}, use this token to reset your password: ${token}</b>`,
    };
  }

  async recoverPasswordMail(data: InputRecoverPasswordMail): Promise<void> {
    this.client.emit('send_reset_password_mail', this.buildMailData(data));
  }
}
