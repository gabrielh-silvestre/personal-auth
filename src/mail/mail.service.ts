import { Inject, Injectable } from '@nestjs/common/decorators';
import { OnEvent } from '@nestjs/event-emitter';
import { Transporter } from 'nodemailer';

import type { IEvent } from '@shared/modules/event/entity/event.interface';

import { Mail } from './domain/entity/Mail';

@Injectable()
export class MailService {
  constructor(
    @Inject('MAILER_SERVICE') private readonly mailerService: Transporter,
  ) {}

  private async sendMail(mail: IEvent<Mail>) {
    const { payload } = mail;

    this.mailerService.sendMail({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      cc: payload.cc,
    });
  }

  @OnEvent('user.mail.welcome')
  async welcomeEmail(mail: IEvent<Mail>) {
    await this.sendMail(mail);
  }

  @OnEvent('user.mail.reset-password')
  async resetPasswordEmail(mail: IEvent<Mail>) {
    await this.sendMail(mail);
  }
}
