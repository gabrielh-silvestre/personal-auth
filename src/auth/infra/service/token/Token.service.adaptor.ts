import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { ITokenService } from './token.service.interface';

import { CreateTokenUseCase } from '@tokens/useCase/create/CreateToken.useCase';
import { ValidateTokenUseCase } from '@tokens/useCase/validate/ValidateToken.useCase';
import { RefreshTokenUseCase } from '@tokens/useCase/refresh/RefreshToken.useCase';

export type TokenPayload = {
  userId: string;
  tokenId: string;
};

@Injectable()
export class TokenServiceAdaptor implements ITokenService {
  constructor(
    private readonly createTokenUseCase: CreateTokenUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly jwtService: JwtService,
  ) {}

  async generateAccessToken(userId: string): Promise<string> {
    const token = await this.createTokenUseCase.execute(userId, 'ACCESS');

    return this.jwtService.signAsync({
      userId: token.userId,
      tokenId: token.id,
    });
  }

  async generateRecoverPasswordToken(userId: string): Promise<string> {
    const token = await this.createTokenUseCase.execute(
      userId,
      'RECOVER_PASSWORD',
    );

    return this.jwtService.signAsync({
      userId: token.userId,
      tokenId: token.id,
    });
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = await this.createTokenUseCase.execute(userId, 'REFRESH');

    return this.jwtService.signAsync({
      userId: token.userId,
      tokenId: token.id,
    });
  }

  async refreshToken(tokenId: string): Promise<string> {
    const token = await this.refreshTokenUseCase.execute(tokenId);

    return this.jwtService.signAsync({
      userId: token.userId,
      tokenId: token.tokenId,
    });
  }

  async verifyToken(tokenId: string): Promise<TokenPayload> {
    return this.validateTokenUseCase.execute(tokenId);
  }
}
