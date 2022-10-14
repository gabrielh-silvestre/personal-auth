import { v4 as uuid } from 'uuid';

import { Mail } from '../entity/Mail';

export class MailFactory {
  public static createRecoverPasswordMail(
    recipient: string,
    token: string,
  ): Mail {
    return new Mail(
      uuid(),
      'recover@email.com',
      recipient,
      [],
      'Recover password',
      `Click on the link to recover your password: http://localhost:3000/recover-password/${token}`,
      `<a href="http://localhost:3000/recover-password/${token}">Click here to recover your password</a>`,
    );
  }

  public static createWelcomeMail(recipient: string): Mail {
    return new Mail(
      uuid(),
      'recover@email.com',
      recipient,
      [],
      'Welcome',
      'Welcome to our platform',
      '<h1>Welcome to our platform</h1>',
    );
  }
}
