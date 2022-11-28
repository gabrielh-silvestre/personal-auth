import { Inject, Injectable } from '@nestjs/common';

import type { IMailGateway } from '@users/infra/gateway/mail/Mail.gateway.interface';
import type { IMailService, InputWelcomeMail } from './mail.service.interface';

@Injectable()
export class MailService implements IMailService {
  constructor(
    @Inject('MAIL_GATEWAY') private readonly mailGateway: IMailGateway,
  ) {}

  private buildMailData({ email, username }: InputWelcomeMail) {
    return {
      to: email,
      subject: 'Welcome to the S1 auth service!',
      text: `Welcome to the S1 auth service, ${username}!`,
      html: `<b>Welcome to the S1 auth service, ${username}!</b>`,
    };
  }

  async welcomeMail(data: InputWelcomeMail): Promise<void> {
    const { to, subject, text, html } = this.buildMailData(data);

    this.mailGateway.send(to, subject, { text, html });
  }
}
