import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { ITokenRepository } from '@tokens/domain/repository/token.repository.interface';

import { TokenFactory } from '@tokens/domain/factory/Token.factory';

@Injectable()
export class CreateTokenUseCase {
  constructor(
    @Inject('TOKEN_REPO') private readonly tokenRepository: ITokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(id: string): Promise<string> {
    const newToken = TokenFactory.create(id);

    const jwtToken = await this.jwtService.signAsync({
      tokenId: newToken.id,
      userId: newToken.userId,
    });

    this.tokenRepository.create(newToken);

    return jwtToken;
  }
}
