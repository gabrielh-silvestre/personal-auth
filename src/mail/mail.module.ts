import { Module } from '@nestjs/common/decorators';
import { createTestAccount, createTransport } from 'nodemailer';

import { MailService } from './mail.service';

const MAILER_HOST = process.env.MAILER_HOST || 'smtp.ethereal.email';
const MAILER_PORT = process.env.MAILER_PORT || 587;
const MAILER_USER = process.env.MAILER_USER;
const MAILER_PASS = process.env.MAILER_PASS;

@Module({
  providers: [
    MailService,
    {
      provide: 'MAILER_SERVICE',
      useFactory: async () => {
        const fakeAccount = await createTestAccount();

        return createTransport({
          host: MAILER_HOST,
          port: Number(MAILER_PORT),
          auth: {
            user: MAILER_USER || fakeAccount.user,
            pass: MAILER_PASS || fakeAccount.pass,
          },
        });
      },
    },
  ],
})
export class MailModule {}
