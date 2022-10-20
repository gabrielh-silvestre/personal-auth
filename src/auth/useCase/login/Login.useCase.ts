import { Inject, Injectable } from '@nestjs/common';

import type { ITokenService } from '@auth/infra/service/token/token.service.interface';
import type { IUserService } from '@auth/infra/service/user/user.service.interface';
import type { InputLoginDto } from './Login.dto';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenService: ITokenService,
    @Inject('USER_SERVICE') private readonly userService: IUserService,
  ) {}

  async execute({ email, password }: InputLoginDto): Promise<string | never> {
    const foundUser = await this.userService.findByEmail(email);

    const isCredentialsValid =
      foundUser && foundUser.password.isEqual(password);

    if (!isCredentialsValid) {
      throw ExceptionFactory.unauthorized('Invalid credentials');
    }

    return this.tokenService.generateToken(foundUser.id);
  }
}
