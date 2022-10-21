import { ExceptionFactory } from '@exceptions/factory/Exception.factory';
import { Inject, Injectable } from '@nestjs/common';

import type { IUserRepository } from '@users/domain/repository/user.repository.interface';
import type { InputCreateUserDto, OutputCreateUserDto } from './CreateUser.dto';

import { UserFactory } from '@users/domain/factory/User.factory';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('USER_REPO') private readonly userRepository: IUserRepository,
  ) {}

  private async isEmailAlreadyInUse(email: string): Promise<boolean> {
    return this.userRepository.existsByEmail(email);
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

    return {
      id: newUser.id,
      username: newUser.username,
    };
  }
}
