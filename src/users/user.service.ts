import { Injectable } from '@nestjs/common';

import type {
  InputCreateUserDto,
  OutputCreateUserDto,
} from './dto/CreateUser.dto';

import { UserFactory } from './domain/factory/User.factory';
import { UserInMemoryRepository } from './infra/repository/memory/User.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserInMemoryRepository) {}

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
      throw new Error('Email already registered');
    }

    await this.userRepository.create(newUser);

    return {
      id: newUser.id,
      username: newUser.username,
    };
  }
}
