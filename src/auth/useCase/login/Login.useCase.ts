import { Inject, Injectable } from '@nestjs/common';

import type {
  InputLoginDto,
  OutputLoginDto,
} from '#auth/useCase/login/Login.dto';
import type { ITokenRepository } from '#auth/domain/repository/token.repository.interface';

import { TokenFactory } from '#auth/domain/factory/Token.factory';

import { DATABASE_GATEWAY } from '#auth/utils/constants/index';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(DATABASE_GATEWAY)
    private readonly databaseGateway: ITokenRepository,
  ) {}

  async execute({ userId }: InputLoginDto): Promise<OutputLoginDto | never> {
    const accessToken = TokenFactory.createAccessToken(userId);
    const refreshToken = TokenFactory.createRefreshToken(userId);

    await this.databaseGateway.create(accessToken);
    await this.databaseGateway.create(refreshToken);

    return {
      accessTokenId: accessToken.id,
      refreshTokenId: refreshToken.id,
      userId,
    };
  }
}
