import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import type { IUserRepository } from '@users/domain/repository/user.repository.interface';
import type { InputCreateUserDto, OutputCreateUserDto } from './CreateUser.dto';
import type { IUser } from '@users/domain/entity/user.interface';

import { UserFactory } from '@users/domain/factory/User.factory';
import { EventFactory } from '@shared/modules/event/factory/Event.factory';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('USER_REPO') private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async isEmailAlreadyInUse(email: string): Promise<boolean> {
    return this.userRepository.existsByEmail(email);
  }

  private async createUserEvent(user: IUser): Promise<void | never> {
    const event = EventFactory.create<IUser>('user.created', user);

    this.eventEmitter.emit(event.name, event);
  }

  async execute({
    email,
    confirmEmail,
    username,
    password,
    confirmPassword,
  }: InputCreateUserDto): Promise<OutputCreateUserDto | never> {
    const newUser = UserFactory.create(
      username,
      email,
      confirmEmail,
      password,
      confirmPassword,
    );

    const emailAlreadyRegistered = await this.isEmailAlreadyInUse(email);

    if (emailAlreadyRegistered) {
      throw ExceptionFactory.conflict('Email already registered');
    }

    await this.userRepository.create(newUser);
    this.createUserEvent(newUser);

    return {
      id: newUser.id,
      username: newUser.username,
    };
  }
}
