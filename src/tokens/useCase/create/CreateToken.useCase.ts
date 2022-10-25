import { Inject, Injectable } from '@nestjs/common';

import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';
import type { IJwtService } from '@tokens/infra/service/jwt/Jwt.service.interface';
import type { CreateTokenPayload, TokenTypeDto } from './CreateToken.dto';

import { TokenFactory } from '@tokens/domain/factory/Token.factory';

@Injectable()
export class CreateTokenUseCase {
  constructor(
    @Inject('TOKEN_REPO') private readonly tokenRepository: ITokenRepository,
    @Inject('JWT_SERVICE')
    private readonly jwtService: IJwtService<CreateTokenPayload>,
  ) {}

  async execute(id: string, type: TokenTypeDto): Promise<string> {
    const newToken =
      type === 'ACCESS'
        ? TokenFactory.createAccessToken(id)
        : TokenFactory.createRecoverPasswordToken(id);

    const jwtToken = await this.jwtService.encrypt({
      tokenId: newToken.id,
      userId: newToken.userId,
    });

    this.tokenRepository.create(newToken);

    return jwtToken;
  }
}
