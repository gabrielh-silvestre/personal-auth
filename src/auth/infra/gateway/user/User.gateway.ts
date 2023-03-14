import { Inject, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';

import type { IUserGateway, OutputUser } from './user.gateway.interface';
import type { IUserRepository } from '@user/domain/repository/user.repository.interface';

import { USER_REPOSITORY } from '@shared/utils/constants/injectNames';

@Injectable()
export class UserGateway implements IUserGateway {
  constructor(
    @Inject(USER_REPOSITORY) private readonly repository: IUserRepository,
  ) {}

  async verifyCredentials(
    email: string,
    password: string,
  ): Promise<OutputUser> {
    const user = await this.repository.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) return null;

    return { id: user.id };
  }
}
