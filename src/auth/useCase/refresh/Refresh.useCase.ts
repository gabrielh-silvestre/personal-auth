import { Inject, Injectable } from '@nestjs/common';

import type { InputRefreshDto, OutputRefreshDto } from './Refresh.dto';
import type { IDatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.interface';

import { Token } from '@auth/domain/entity/Token';
import { TokenFactory } from '@auth/domain/factory/Token.factory';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

import { DATABASE_GATEWAY } from '@auth/utils/constants';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(DATABASE_GATEWAY)
    private readonly databaseGateway: IDatabaseGateway,
  ) {}

  private async findValidRefreshToken(userId: string): Promise<Token | null> {
    const refreshToken = await this.databaseGateway.findByUserIdAndType(
      userId,
      'REFRESH',
    );

    if (!refreshToken) return null;
    if (!refreshToken.isValid()) return null;

    return refreshToken;
  }

  async execute({
    userId,
  }: InputRefreshDto): Promise<OutputRefreshDto | never> {
    const refreshToken = await this.findValidRefreshToken(userId);
    if (!refreshToken) throw ExceptionFactory.unauthorized('Invalid token');

    const accessToken = TokenFactory.createAccessToken(userId);

    refreshToken.refresh();

    await this.databaseGateway.update(refreshToken);
    await this.databaseGateway.create(accessToken);

    return {
      accessTokenId: accessToken.id,
      refreshTokenId: refreshToken.id,
      userId,
    };
  }
}
