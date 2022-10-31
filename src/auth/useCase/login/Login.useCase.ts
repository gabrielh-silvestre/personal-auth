import { Inject, Injectable } from '@nestjs/common';

import type { ITokenService } from '@auth/infra/service/token/token.service.interface';
import type { IUserService } from '@auth/infra/service/user/user.service.interface';
import type { InputLoginDto } from './Login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenService: ITokenService,
    @Inject('USER_SERVICE') private readonly userService: IUserService,
  ) {}

  async execute({ email }: InputLoginDto): Promise<string | never> {
    const foundUser = await this.userService.findByEmail(email);
    return this.tokenService.generateAccessToken(foundUser.id);
  }
}
