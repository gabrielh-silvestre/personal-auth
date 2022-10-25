import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import type {
  IMailService,
  InputRecoverPasswordMail,
} from './mail.service.interface';

import { MailFactory } from '@mail/domain/factory/Mail.factory';
import { EventFactory } from '@shared/modules/event/factory/Event.factory';

@Injectable()
export class MailServiceAdaptor implements IMailService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async recoverPasswordMail(data: InputRecoverPasswordMail): Promise<void> {
    const mail = MailFactory.create({
      to: data.email,
      subject: 'S1 Personal-Auth | Recover Password',
      text: `Hi ${data.username} use this token to recover your password: ${data.token}`,
      html: `<h1>Hi ${data.username}</h1><p>use this token to recover your password: ${data.token}</p>`,
    });

    const event = EventFactory.create('user.mail.reset-password', mail);
    this.eventEmitter.emit(event.name, event);
  }
}
