import { Injectable } from '@nestjs/common/decorators';
import { OnEvent } from '@nestjs/event-emitter';

import type { IUser } from '@users/domain/entity/user.interface';
import type { IEvent } from '@shared/domain/event/event.interface';
import type { IEventHandler } from '@shared/domain/event/event.handler.interface';

import { MailService } from '@mail/mail.service';
import { MailFactory } from '@mail/domain/factory/Mail.factory';

@Injectable()
export class UserCreatedEventHandler implements IEventHandler<IUser> {
  constructor(private readonly mailService: MailService) {}

  @OnEvent('user.created', { async: true })
  async handle(event: IEvent<IUser>): Promise<void> {
    const { username, email } = event.payload;
    const newMail = MailFactory.createWelcomeMail(username, email);

    await this.mailService.sendMail(newMail);
  }
}
