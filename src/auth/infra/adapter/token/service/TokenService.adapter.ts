import { Injectable } from '@nestjs/common';

import type {
  ITokenAdapter,
  TokenPayload,
  TokenType,
} from '../Token.adapter.interface';

import { CreateTokenUseCase } from '@tokens/useCase/create/CreateToken.useCase';
import { ValidateTokenUseCase } from '@tokens/useCase/validate/ValidateToken.useCase';

import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service';

@Injectable()
export class TokenServiceAdapter implements ITokenAdapter {
  constructor(
    private readonly createTokenUseCase: CreateTokenUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly jwtAccessService: JwtAccessService,
  ) {}

  async generate(userId: string, type: TokenType): Promise<string | never> {
    const { id: tokenId } = await this.createTokenUseCase.execute(userId, type);
    const jwtToken = await this.jwtAccessService.sign({
      tokenId,
      userId,
    });

    return jwtToken;
  }

  async verify(token: string): Promise<TokenPayload | never> {
    const { tokenId, userId } = await this.validateTokenUseCase.execute(token);

    return { tokenId, userId };
  }
}
