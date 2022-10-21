import { Injectable } from '@nestjs/common';

import type {
  ITokenService,
  OutputCreateToken,
} from './token.service.interface';

import { CreateTokenUseCase } from '@tokens/useCase/create/CreateToken.useCase';
import { ValidateTokenUseCase } from '@tokens/useCase/validate/ValidateToken.useCase';

@Injectable()
export class TokenServiceAdaptor implements ITokenService {
  constructor(
    private readonly createTokenUseCase: CreateTokenUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
  ) {}

  async generateToken(userId: string): Promise<string> {
    return this.createTokenUseCase.execute(userId);
  }

  async verifyToken(token: string): Promise<OutputCreateToken> {
    return this.validateTokenUseCase.execute(token);
  }
}
