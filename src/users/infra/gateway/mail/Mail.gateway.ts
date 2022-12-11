import { Inject, Injectable } from '@nestjs/common';

import type { IMailAdapter } from '@users/infra/adapter/mail/Mail.adapter.interface';
import type { IMailGateway, InputWelcomeMail } from './mail.gateway.interface';

import { MAIL_ADAPTER } from '@users/utils/constants';

@Injectable()
export class MailGateway implements IMailGateway {
  constructor(
    @Inject(MAIL_ADAPTER) private readonly mailAdapter: IMailAdapter,
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

    this.mailAdapter.send(to, subject, { text, html });
  }
}
