import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import type { IUserGateway } from '../gateway/user/user.gateway.interface.js';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory.js';

import { USER_GATEWAY } from '@auth/utils/constants/index.js';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(USER_GATEWAY) private readonly userGateway: IUserGateway,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      const { id } = await this.userGateway.verifyCredentials(email, password);

      return { userId: id };
    } catch {
      throw ExceptionFactory.forbidden('Invalid credentials');
    }
  }
}
