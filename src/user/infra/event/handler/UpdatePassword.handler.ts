import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import type { IEventHandler } from '@shared/domain/event/event.handler.interface';
import type { IEvent } from '@shared/domain/event/event.interface';

import { UpdatePasswordUseCase } from '@user/useCase/updatePassword/UpdatePassword.useCase';

type UpdatePasswordEventPayload = {
  id: string;
  email: string;
  password: string;
};

@Controller()
export class UpdatePasswordHandler implements IEventHandler {
  constructor(private readonly updatePasswordUseCase: UpdatePasswordUseCase) {}

  @EventPattern('UserChangedPassword')
  handle(@Payload() event: IEvent<UpdatePasswordEventPayload>): void {
    console.log('UserChangedPassword event received', event);
    this.updatePasswordUseCase.execute(event.payload);
  }
}
