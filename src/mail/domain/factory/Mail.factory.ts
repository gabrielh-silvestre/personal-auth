import { v4 as uuid } from 'uuid';

import { Mail } from '../entity/Mail';

type InputMail = {
  to: string;
  cc?: string[];
  subject: string;
  text?: string;
  html?: string;
};

export class MailFactory {
  private static readonly SENDER = 'S1 Personal-Auth <personal-auth@email.com>';

  static create(data: InputMail): Mail {
    return new Mail(
      uuid(),
      MailFactory.SENDER,
      data.to,
      data.cc || [],
      data.subject,
      data.text || '',
      data.html || '',
    );
  }
}
