import { Inject, Injectable } from '@nestjs/common';

import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';
import type { OutputRefreshTokenDto } from './RefreshToken.dto';

import { TokenType } from '@tokens/domain/entity/token.interface';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('TOKEN_REPO') private readonly tokenRepository: ITokenRepository,
  ) {}

  async execute(tokenId: string): Promise<OutputRefreshTokenDto | never> {
    const foundToken = await this.tokenRepository.find(tokenId);
    const isTokenValid =
      foundToken &&
      foundToken.isValid() &&
      foundToken.type === TokenType.REFRESH;

    if (!isTokenValid) {
      throw ExceptionFactory.invalidArgument('Invalid token');
    }

    foundToken.refresh();
    await this.tokenRepository.update(foundToken);

    return { tokenId, userId: foundToken.userId };
  }
}
