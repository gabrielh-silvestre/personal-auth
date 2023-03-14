import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import type { IEventHandler } from '@shared/domain/event/event.handler.interface';
import type { IEvent } from '@shared/domain/event/event.interface';

import { CreateUserUseCase } from '@user/useCase/create/CreateUser.useCase';

type CreateUserEventPayload = {
  id: string;
  email: string;
  password: string;
};

@Controller()
export class CreateUserHandler implements IEventHandler {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @EventPattern('UserCreated')
  handle(@Payload() event: IEvent<CreateUserEventPayload>): void {
    this.createUserUseCase.execute(event.payload);
  }
}
