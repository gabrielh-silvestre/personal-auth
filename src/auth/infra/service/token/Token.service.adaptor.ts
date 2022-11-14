import { Injectable } from '@nestjs/common';

import type { ITokenService, TokenPayload } from './token.service.interface';

import { TokenFacade } from '@tokens/infra/facade/Token.facade';

@Injectable()
export class TokenServiceAdaptor implements ITokenService {
  constructor(private readonly tokenFacade: TokenFacade) {}

  async generateAccessToken(userId: string): Promise<string | never> {
    const token = await this.tokenFacade.create(userId, 'ACCESS');
    return token.id;
  }

  async generateRecoverPasswordToken(userId: string): Promise<string | never> {
    const token = await this.tokenFacade.create(userId, 'RECOVER_PASSWORD');

    return token.id;
  }

  async generateRefreshToken(userId: string): Promise<string | never> {
    const token = await this.tokenFacade.create(userId, 'REFRESH');
    return token.id;
  }

  async refreshToken(tokenId: string): Promise<string | never> {
    const token = await this.tokenFacade.refresh(tokenId);
    return token.tokenId;
  }

  async verifyToken(tokenId: string): Promise<TokenPayload | never> {
    return this.tokenFacade.validate(tokenId);
  }
}
