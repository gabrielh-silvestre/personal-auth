import { Inject, Injectable } from '@nestjs/common';

import type { IUserRepository } from '@users/domain/repository/user.repository.interface';
import type { OutputGetUserDto } from '../getByEmail/GetUserByEmail.dto';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

import { USER_REPOSITORY } from '@users/utils/constants';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<OutputGetUserDto | never> {
    const foundUser = await this.userRepository.find(id);

    if (!foundUser) {
      throw ExceptionFactory.notFound('User not found');
    }

    return foundUser;
  }
}
