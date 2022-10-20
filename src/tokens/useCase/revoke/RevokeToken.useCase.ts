import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';
import type { OutputValidateTokenDto } from '../validate/ValidateToken.dto';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class RevokeTokenUseCase {
  constructor(
    @Inject('TOKEN_REPO') private readonly tokenRepository: ITokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(token: string): Promise<void | never> {
    const { tokenId } = await this.jwtService.verifyAsync<OutputValidateTokenDto>(
      token,
    );

    const foundToken = await this.tokenRepository.find(tokenId);

    if (!foundToken || !foundToken.isValid()) {
      throw ExceptionFactory.invalidArgument('Invalid token');
    }

    foundToken.revoke();
  }
}
