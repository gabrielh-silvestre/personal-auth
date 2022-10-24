import { MailFactory } from '@mail/domain/factory/Mail.factory';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import type { IMailService, InputWelcomeMail } from './mail.service.interface';

import { EventFactory } from '@shared/modules/event/factory/Event.factory';

@Injectable()
export class MailServiceAdaptor implements IMailService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async welcomeMail(data: InputWelcomeMail): Promise<void> {
    const mail = MailFactory.create({
      to: data.email,
      subject: 'Welcome to S1 Personal-Auth',
      text: `Welcome to S1 Personal-Auth, ${data.username}!`,
      html: `<h1>Welcome to S1 Personal-Auth, ${data.username}!</h1>`,
    });

    const event = EventFactory.create('user.mail.welcome', mail);
    this.eventEmitter.emit(event.name, event);
  }
}
