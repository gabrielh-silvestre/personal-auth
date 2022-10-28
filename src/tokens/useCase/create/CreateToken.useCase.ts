import { Inject, Injectable } from '@nestjs/common';

import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';
import type { TokenTypeDto } from './CreateToken.dto';
import type { IToken } from '@tokens/domain/entity/token.interface';

import { TokenFactory } from '@tokens/domain/factory/Token.factory';

@Injectable()
export class CreateTokenUseCase {
  constructor(
    @Inject('TOKEN_REPO') private readonly tokenRepository: ITokenRepository,
  ) {}

  async execute(id: string, type: TokenTypeDto): Promise<IToken> {
    const newToken =
      type === 'ACCESS'
        ? TokenFactory.createAccessToken(id)
        : TokenFactory.createRecoverPasswordToken(id);

    this.tokenRepository.create(newToken);

    return newToken;
  }
}
