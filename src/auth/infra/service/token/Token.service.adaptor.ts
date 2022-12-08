import { Injectable } from '@nestjs/common';

import type { ITokenService, TokenPayload } from './token.service.interface';

import { CreateTokenUseCase } from '@tokens/useCase/create/CreateToken.useCase';
import { ValidateTokenUseCase } from '@tokens/useCase/validate/ValidateToken.useCase';
import { RefreshTokenUseCase } from '@tokens/useCase/refresh/RefreshToken.useCase';

import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service';

@Injectable()
export class TokenServiceAdaptor implements ITokenService {
  constructor(
    private readonly createTokenUseCase: CreateTokenUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly jwtAccessService: JwtAccessService,
  ) {}

  async generateAccessToken(userId: string): Promise<string | never> {
    const token = await this.createTokenUseCase.execute(userId, 'ACCESS');
    return token.id;
  }

  async generateRecoverPasswordToken(userId: string): Promise<string | never> {
    const token = await this.createTokenUseCase.execute(
      userId,
      'RECOVER_PASSWORD',
    );

    return token.id;
  }

  async generateRefreshToken(userId: string): Promise<string | never> {
    const token = await this.createTokenUseCase.execute(userId, 'REFRESH');
    return token.id;
  }

  async refreshToken(tokenId: string): Promise<string | never> {
    const token = await this.refreshTokenUseCase.execute(tokenId);
    return token.tokenId;
  }

  async verifyToken(tokenId: string): Promise<TokenPayload | never> {
    return this.validateTokenUseCase.execute(tokenId);
  }

  async verifyJwtToken(token: string): Promise<TokenPayload> {
    const { tokenId } = await this.jwtAccessService.verify<TokenPayload>(token);
    return this.verifyToken(tokenId);
  }
}
