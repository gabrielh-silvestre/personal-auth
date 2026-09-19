import { Inject, Injectable } from '@nestjs/common';

import type { InputLoginDto, OutputLoginDto } from './Login.dto.js';
import type { IDatabaseGateway } from '@auth/infra/gateway/database/database.gateway.interface.js';

import { TokenFactory } from '@auth/domain/factory/Token.factory.js';

import { DATABASE_GATEWAY } from '@auth/utils/constants/index.js';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(DATABASE_GATEWAY)
    private readonly databaseGateway: IDatabaseGateway,
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
