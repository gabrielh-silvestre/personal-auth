import { Inject, Injectable } from '@nestjs/common';

import type { ITokenGateway } from '@auth/infra/gateway/token/token.gateway.interface';
import type { InputLoginDto, OutputLoginDto } from './Login.dto';

import { TOKEN_GATEWAY } from '@auth/utils/constants';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(TOKEN_GATEWAY) private readonly tokenService: ITokenGateway,
  ) {}

  async execute({ userId }: InputLoginDto): Promise<OutputLoginDto | never> {
    const accessTokenId = await this.tokenService.generateAccessToken(userId);
    const refreshTokenId = await this.tokenService.generateRefreshToken(userId);

    return { accessTokenId, refreshTokenId, userId };
  }
}
