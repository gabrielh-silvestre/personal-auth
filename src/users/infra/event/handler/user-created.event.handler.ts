import { Injectable } from '@nestjs/common/decorators';
import { OnEvent } from '@nestjs/event-emitter';

import type { IUser } from '@users/domain/entity/user.interface';
import type { IEvent } from '@shared/domain/event/event.interface';
import type { IEventHandler } from '@shared/domain/event/event.handler.interface';

@Injectable()
export class UserCreatedEventHandler implements IEventHandler<IUser> {
  @OnEvent('user.created', { async: true })
  async handle(event: IEvent<IUser>): Promise<void> {
    console.log(`Received event: ${event.name}`);
    console.log(`Payload: ${JSON.stringify(event.payload)}`);
  }
}
