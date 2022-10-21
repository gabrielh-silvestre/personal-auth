import { Inject, Injectable } from '@nestjs/common';

import type { OutputValidateTokenDto } from '../validate/ValidateToken.dto';
import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';
import type { IJwtService } from '@tokens/infra/service/jwt/Jwt.service.interface';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class RevokeTokenUseCase {
  constructor(
    @Inject('TOKEN_REPO') private readonly tokenRepository: ITokenRepository,
    @Inject('JWT_SERVICE') private readonly jwtService: IJwtService<OutputValidateTokenDto>,
  ) {}

  async execute(token: string): Promise<void | never> {
    const { tokenId } = await this.jwtService.decrypt(token);

    const foundToken = await this.tokenRepository.find(tokenId);

    if (!foundToken || !foundToken.isValid()) {
      throw ExceptionFactory.invalidArgument('Invalid token');
    }

    foundToken.revoke();
  }
}
