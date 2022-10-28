import { Inject, Injectable } from '@nestjs/common';

import type { OutputValidateTokenDto } from './ValidateToken.dto';
import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';
import type { IJwtService } from '@tokens/infra/service/jwt/Jwt.service.interface';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class ValidateTokenUseCase {
  constructor(
    @Inject('TOKEN_REPO') private readonly tokenRepository: ITokenRepository,
    @Inject('JWT_SERVICE')
    private readonly jwtService: IJwtService<OutputValidateTokenDto>,
  ) {}

  async execute(token: string): Promise<OutputValidateTokenDto | never> {
    const { tokenId } = await this.jwtService.decrypt(token);

    const foundToken = await this.tokenRepository.find(tokenId);
    const isTokenValid = foundToken && foundToken.isValid();

    if (!isTokenValid) {
      throw ExceptionFactory.invalidArgument('Invalid token');
    }

    return { tokenId, userId: foundToken.userId };
  }
}
