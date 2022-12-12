import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import type { IUserService } from '@auth/infra/service/user/user.service.interface';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: IUserService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    const isCredentialsValid = user && user.password.isEqual(password);

    if (!isCredentialsValid) {
      throw ExceptionFactory.forbidden('Invalid credentials');
    }

    return user;
  }
}
