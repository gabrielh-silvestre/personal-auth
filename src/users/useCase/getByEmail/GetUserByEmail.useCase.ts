import { ExceptionFactory } from '@exceptions/factory/Exception.factory';
import { Inject, Injectable } from '@nestjs/common';

import type { IUserRepository } from '@users/domain/repository/user.repository.interface';
import type { OutputGetUserDto } from './GetUserByEmail.dto';

@Injectable()
export class GetUserByEmailUseCase {
  constructor(
    @Inject('USER_REPO') private readonly userRepository: IUserRepository,
  ) {}

  async execute(email: string): Promise<OutputGetUserDto | never> {
    const foundUser = await this.userRepository.findByEmail(email);

    if (!foundUser) {
      throw ExceptionFactory.notFound('User not found');
    }

    return foundUser;
  }
}
