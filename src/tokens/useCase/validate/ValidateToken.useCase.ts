import { Inject, Injectable } from '@nestjs/common';

import type { OutputValidateTokenDto } from './ValidateToken.dto';
import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class ValidateTokenUseCase {
  constructor(
    @Inject('TOKEN_REPO') private readonly tokenRepository: ITokenRepository,
  ) {}

  async execute(tokenId: string): Promise<OutputValidateTokenDto | never> {
    const foundToken = await this.tokenRepository.find(tokenId);
    const isTokenValid = foundToken && foundToken.isValid();

    if (!isTokenValid) {
      throw ExceptionFactory.invalidArgument('Invalid token');
    }

    return { tokenId, userId: foundToken.userId };
  }
}
