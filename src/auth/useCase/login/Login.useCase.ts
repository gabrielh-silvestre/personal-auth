import { Inject, Injectable } from '@nestjs/common';
import { Trace } from '@hex/hextelemetry';

import type { InputLoginDto, OutputLoginDto } from './Login.dto';
import type { IDatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.interface';

import { TokenFactory } from '@auth/domain/factory/Token.factory';

import { DATABASE_GATEWAY } from '@auth/utils/constants';

@Injectable()
@Trace()
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
