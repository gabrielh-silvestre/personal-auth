import { Inject, Injectable } from '@nestjs/common';

import type { InputRefreshDto, OutputRefreshDto } from './Refresh.dto';
import type { ITokenGateway } from '@auth/infra/gateway/token/token.gateway.interface';

import { TOKEN_GATEWAY } from '@auth/utils/constants';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(TOKEN_GATEWAY) private readonly tokenGateway: ITokenGateway,
  ) {}

  async execute({
    userId,
  }: InputRefreshDto): Promise<OutputRefreshDto | never> {
    const accessTokenId = await this.tokenGateway.generateAccessToken(userId);
    const refreshTokenId = await this.tokenGateway.generateRefreshToken(userId);

    return { accessTokenId, refreshTokenId, userId };
  }
}
