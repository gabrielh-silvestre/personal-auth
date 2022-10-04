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

  async create({
    username,
    email,
    confirmEmail,
  }: InputCreateUserDto): Promise<OutputCreateUserDto> {
    const newUser = UserFactory.create(username, email, confirmEmail);

    await this.userRepository.create(newUser);

    return {
      id: newUser.id,
      username: newUser.username,
    };
  }
}
