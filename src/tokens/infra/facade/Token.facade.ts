import { Injectable } from '@nestjs/common';

import type { IToken } from '@tokens/domain/entity/token.interface';
import type { TokenTypeDto } from '@tokens/useCase/create/CreateToken.dto';
import type { OutputRefreshTokenDto } from '@tokens/useCase/refresh/RefreshToken.dto';
import type { OutputValidateTokenDto } from '@tokens/useCase/validate/ValidateToken.dto';

import { CreateTokenUseCase } from '@tokens/useCase/create/CreateToken.useCase';
import { RefreshTokenUseCase } from '@tokens/useCase/refresh/RefreshToken.useCase';
import { RevokeTokenUseCase } from '@tokens/useCase/revoke/RevokeToken.useCase';
import { ValidateTokenUseCase } from '@tokens/useCase/validate/ValidateToken.useCase';

@Injectable()
export class TokenFacade {
  constructor(
    private readonly createTokenUseCase: CreateTokenUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly revokeTokenUseCase: RevokeTokenUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
  ) {}

  async create(id: string, tokenType: TokenTypeDto): Promise<IToken> {
    return this.createTokenUseCase.execute(id, tokenType);
  }

  async refresh(tokenId: string): Promise<OutputRefreshTokenDto> {
    return this.refreshTokenUseCase.execute(tokenId);
  }

  async revoke(tokenId: string): Promise<void> {
    return this.revokeTokenUseCase.execute(tokenId);
  }

  async validate(tokenId: string): Promise<OutputValidateTokenDto> {
    return this.validateTokenUseCase.execute(tokenId);
  }
}
