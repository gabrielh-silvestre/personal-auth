import { Inject, Injectable } from '@nestjs/common';

import type {
  InputCreateUserDto,
  OutputCreateUserDto,
} from './dto/CreateUser.dto';
import type { IUserRepository } from './domain/repository/user.repository.interface';

import { UserFactory } from './domain/factory/User.factory';
import { ExceptionRpcFactory } from '../exceptions/factory/Exception.rpc.factory';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPO') private readonly userRepository: IUserRepository,
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
      throw ExceptionRpcFactory.conflict('Email already registered');
    }

    await this.userRepository.create(newUser);

    return {
      id: newUser.id,
      username: newUser.username,
    };
  }
}
