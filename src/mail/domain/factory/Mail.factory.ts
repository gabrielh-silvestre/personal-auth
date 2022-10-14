import { v4 as uuid } from 'uuid';

import { Mail } from '../entity/Mail';

export class MailFactory {
  private static readonly SENDER: 'S1 Personal-Auth <personal-auth@email.com>';

  public static createRecoverPasswordMail(
    recipient: string,
    token: string,
  ): Mail {
    return new Mail(
      uuid(),
      MailFactory.SENDER,
      recipient,
      [],
      'Recover password',
      `Click on the link to recover your password: http://localhost:3000/recover-password/${token}`,
      `<a href="http://localhost:3000/recover-password/${token}">Click here to recover your password</a>`,
    );
  }

  public static createWelcomeMail(
    recipientName: string,
    recipientEmail: string,
  ): Mail {
    return new Mail(
      uuid(),
      MailFactory.SENDER,
      recipientEmail,
      [],
      'Welcome',
      `Welcome to S1 Personal-Auth, ${recipientName}!`,
      `<h1>Welcome to S1 Personal-Auth, ${recipientName}!</h1>`,
    );
  }
}
