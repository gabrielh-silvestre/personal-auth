import { Inject, Injectable } from '@nestjs/common';

import type { ITokenService } from '@auth/infra/service/token/token.service.interface';
import type { IUserService } from '@auth/infra/service/user/user.service.interface';
import type { InputLoginDto, OutputLoginDto } from './Login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenService: ITokenService,
    @Inject('USER_SERVICE') private readonly userService: IUserService,
  ) {}

  async execute({ email }: InputLoginDto): Promise<OutputLoginDto | never> {
    const { id: userId } = await this.userService.findByEmail(email);

    const accessTokenId = await this.tokenService.generateAccessToken(userId);
    const refreshTokenId = await this.tokenService.generateRefreshToken(userId);

    return { accessTokenId, refreshTokenId, userId };
  }
}
