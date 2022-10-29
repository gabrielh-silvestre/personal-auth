import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { ITokenService } from './token.service.interface';

import { CreateTokenUseCase } from '@tokens/useCase/create/CreateToken.useCase';
import { ValidateTokenUseCase } from '@tokens/useCase/validate/ValidateToken.useCase';

export type TokenPayload = {
  userId: string;
  tokenId: string;
};

@Injectable()
export class TokenServiceAdaptor implements ITokenService {
  constructor(
    private readonly createTokenUseCase: CreateTokenUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly jwtService: JwtService,
  ) {}

  async generateToken(userId: string): Promise<string> {
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

  async verifyToken(tokenId: string): Promise<TokenPayload> {
    return this.validateTokenUseCase.execute(tokenId);
  }
}
