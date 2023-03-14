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
  ) {}

  private async resetTokens(userId: string): Promise<void> {
    Promise.allSettled([
      this.databaseGateway.deleteByUserIdAndType(userId, 'ACCESS'),
      this.databaseGateway.deleteByUserIdAndType(userId, 'REFRESH'),
    ]);
  }

  async execute({ userId }: InputLoginDto): Promise<OutputLoginDto | never> {
    await this.resetTokens(userId);

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
