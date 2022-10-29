import { Inject, Injectable } from '@nestjs/common';

import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class RevokeTokenUseCase {
  constructor(
    @Inject('TOKEN_REPO') private readonly tokenRepository: ITokenRepository,
  ) {}

  async execute(tokenId: string): Promise<void | never> {
    const foundToken = await this.tokenRepository.find(tokenId);

    if (!foundToken || !foundToken.isValid()) {
      throw ExceptionFactory.invalidArgument('Invalid token');
    }

    foundToken.revoke();
  }
}
