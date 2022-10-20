import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';
import type { OutputValidateTokenDto } from './ValidateToken.dto';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class ValidateTokenUseCase {
  constructor(
    @Inject('TOKEN_REPO') private readonly tokenRepository: ITokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(token: string): Promise<OutputValidateTokenDto | never> {
    const { tokenId } = await this.jwtService.verifyAsync<OutputValidateTokenDto>(
      token,
    );

    const foundToken = await this.tokenRepository.find(tokenId);
    const isTokenValid = foundToken && foundToken.isValid();

    if (!isTokenValid) {
      throw ExceptionFactory.invalidArgument('Invalid token');
    }

    return { tokenId, userId: foundToken.userId };
  }
}
