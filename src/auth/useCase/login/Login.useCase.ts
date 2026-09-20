import { Inject, Injectable } from '@nestjs/common';

import type { InputLoginDto, OutputLoginDto } from './Login.dto';
import type { IDatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.interface';

import { TokenFactory } from '@auth/domain/factory/Token.factory';

import { DATABASE_GATEWAY } from '@auth/utils/constants';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(DATABASE_GATEWAY)
    private readonly databaseGateway: IDatabaseGateway,
    private readonly tokenFactory: TokenFactory,
  ) {}

  async execute({ userId }: InputLoginDto): Promise<OutputLoginDto | never> {
    const accessToken = this.tokenFactory.createAccessToken(userId);
    const refreshToken = this.tokenFactory.createRefreshToken(userId);

    await this.databaseGateway.create(accessToken);
    await this.databaseGateway.create(refreshToken);

    return {
      accessTokenId: accessToken.id,
      refreshTokenId: refreshToken.id,
      userId,
    };
  }
}
