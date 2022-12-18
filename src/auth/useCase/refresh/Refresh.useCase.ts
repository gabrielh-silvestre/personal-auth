import { Inject, Injectable } from '@nestjs/common';

import type { InputRefreshDto, OutputRefreshDto } from './Refresh.dto';
import type { IDatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.interface';

import { TokenFactory } from '@auth/domain/factory/Token.factory';

import { DATABASE_GATEWAY } from '@auth/utils/constants';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(DATABASE_GATEWAY)
    private readonly databaseGateway: IDatabaseGateway,
  ) {}

  // TODO: Implement more complete logic
  async execute({
    userId,
  }: InputRefreshDto): Promise<OutputRefreshDto | never> {
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
