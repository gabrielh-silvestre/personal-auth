import { Inject, Injectable } from '@nestjs/common';

import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';
import type { IJwtService } from '@tokens/infra/service/jwt/Jwt.service.interface';

import { TokenFactory } from '@tokens/domain/factory/Token.factory';

type CreateTokenPayload = {
  userId: string;
  tokenId: string;
};

@Injectable()
export class CreateTokenUseCase {
  constructor(
    @Inject('TOKEN_REPO') private readonly tokenRepository: ITokenRepository,
    @Inject('JWT_SERVICE') private readonly jwtService: IJwtService<CreateTokenPayload>,
  ) {}

  async execute(id: string): Promise<string> {
    const newToken = TokenFactory.create(id);

    const jwtToken = await this.jwtService.encrypt({
      tokenId: newToken.id,
      userId: newToken.userId,
    });

    this.tokenRepository.create(newToken);

    return jwtToken;
  }
}
