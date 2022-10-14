import { Inject, Injectable } from '@nestjs/common/decorators';
import { Transporter } from 'nodemailer';

import { Mail } from './domain/entity/Mail';

@Injectable()
export class MailService {
  constructor(
    @Inject('MAILER_SERVICE') private readonly mailerService: Transporter,
  ) {}

  async sendMail(mail: Mail) {
    this.mailerService.sendMail({
      from: mail.from,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      cc: mail.cc,
    });
  }
}
