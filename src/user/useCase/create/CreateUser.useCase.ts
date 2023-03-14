import { Inject, Injectable } from '@nestjs/common';

import type { IUserRepository } from '@user/domain/repository/user.repository.interface';
import type { InputCreateUserDto } from './CreateUser.dto';

import { UserFactory } from '@user/domain/factory/User.factory';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: InputCreateUserDto): Promise<void> {
    const userExists = await this.userRepository.findByEmail(dto.email);

    if (!userExists) {
      const newUser = UserFactory.createFromPersistence(dto);
      await this.userRepository.create(newUser);
    }
  }
}
