import { Inject, Injectable } from '@nestjs/common/decorators';
import { EventEmitter2 } from '@nestjs/event-emitter';

import type {
  InputCreateUserDto,
  OutputCreateUserDto,
} from './dto/CreateUser.dto';
import type { IUserRepository } from './domain/repository/user.repository.interface';
import type { OutputGetUserDto } from './dto/GetUser.dto';

import { User } from './domain/entity/User';
import { UserFactory } from './domain/factory/User.factory';
import { UserCreatedEvent } from './domain/event/user-created.event';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPO') private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async emailAlreadyTaken(email: string): Promise<boolean> {
    return this.userRepository.existsByEmail(email);
  }

  async create({
    username,
    email,
    confirmEmail,
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

    const emailAlreadyRegistered = await this.emailAlreadyTaken(email);

    if (emailAlreadyRegistered) {
      throw ExceptionFactory.conflict('Email already registered');
    }

    await this.userRepository.create(newUser);
    this.eventEmitter.emitAsync('user.created', new UserCreatedEvent(newUser));

    return {
      id: newUser.id,
      username: newUser.username,
    };
  }

  async getUser(id: string): Promise<OutputGetUserDto | null> {
    const foundUser = await this.userRepository.find(id);

    if (!foundUser) {
      return null;
    }

    return {
      id: foundUser.id,
      username: foundUser.username,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
