import { Inject, Injectable } from '@nestjs/common';

import type {
  InputCreateUserDto,
  OutputCreateUserDto,
} from './dto/CreateUser.dto';
import type { IUserRepository } from './domain/repository/user.repository.interface';

import { UserFactory } from './domain/factory/User.factory';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';
import { User } from './domain/entity/User';

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
      throw ExceptionFactory.conflict('Email already registered');
    }

    await this.userRepository.create(newUser);

    return {
      id: newUser.id,
      username: newUser.username,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
