import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import type { IEventHandler } from '@shared/domain/event/event.handler.interface';
import type { IEvent } from '@shared/domain/event/event.interface';

import { UpdateEmailUseCase } from '@user/useCase/updateEmail/UpdateEmail.useCase';

type UpdateEmailEventPayload = {
  id: string;
  email: string;
  password: string;
};

@Controller()
export class UpdateEmailHandler implements IEventHandler {
  constructor(private readonly updateEmailUseCase: UpdateEmailUseCase) {}

  @EventPattern('UserChangedEmail')
  handle(@Payload() event: IEvent<UpdateEmailEventPayload>): void {
    this.updateEmailUseCase.execute(event.payload);
  }
}
