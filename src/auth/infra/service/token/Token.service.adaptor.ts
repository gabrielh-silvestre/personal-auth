import { Injectable } from '@nestjs/common';

import type { ITokenService, TokenPayload } from './token.service.interface';

import { CreateTokenUseCase } from '@tokens/useCase/create/CreateToken.useCase';
import { ValidateTokenUseCase } from '@tokens/useCase/validate/ValidateToken.useCase';
import { RefreshTokenUseCase } from '@tokens/useCase/refresh/RefreshToken.useCase';

@Injectable()
export class TokenServiceAdaptor implements ITokenService {
  constructor(
    private readonly createTokenUseCase: CreateTokenUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
  ) {}

  async generateAccessToken(userId: string): Promise<TokenPayload | never> {
    const token = await this.createTokenUseCase.execute(userId, 'ACCESS');

    return {
      userId: token.userId,
      tokenId: token.id,
    };
  }

  async generateRecoverPasswordToken(
    userId: string,
  ): Promise<TokenPayload | never> {
    const token = await this.createTokenUseCase.execute(
      userId,
      'RECOVER_PASSWORD',
    );

    return {
      userId: token.userId,
      tokenId: token.id,
    };
  }

  async generateRefreshToken(userId: string): Promise<TokenPayload | never> {
    const token = await this.createTokenUseCase.execute(userId, 'REFRESH');

    return {
      userId: token.userId,
      tokenId: token.id,
    };
  }

  async refreshToken(tokenId: string): Promise<TokenPayload | never> {
    const token = await this.refreshTokenUseCase.execute(tokenId);

    return {
      userId: token.userId,
      tokenId: token.tokenId,
    };
  }

  async verifyToken(tokenId: string): Promise<TokenPayload | never> {
    return this.validateTokenUseCase.execute(tokenId);
  }
}
