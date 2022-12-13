import { Inject, Injectable } from '@nestjs/common';

import type { ITokenGateway } from '@auth/infra/gateway/token/token.gateway.interface';
import type { InputLoginDto, OutputLoginDto } from './Login.dto';

import { TOKEN_GATEWAY } from '@auth/utils/constants';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(TOKEN_GATEWAY) private readonly tokenGateway: ITokenGateway,
  ) {}

  async execute({ userId }: InputLoginDto): Promise<OutputLoginDto | never> {
    const accessTokenId = await this.tokenGateway.generateAccessToken(userId);
    const refreshTokenId = await this.tokenGateway.generateRefreshToken(userId);

    return { accessTokenId, refreshTokenId, userId };
  }
}
