import { Inject, Injectable } from '@nestjs/common';

import type {
  InputCreateTokenDto,
  OutputCreateTokenDto,
} from './dto/CreateToken.dto';
import type { ITokenRepository } from './domain/repository/token.repository.interface';

import { TokenFactory } from './domain/factory/Token.factory';

@Injectable()
export class TokenService {
  constructor(
    @Inject('TOKEN_REPO') private readonly tokenRepository: ITokenRepository,
  ) {}

  async createToken({
    userId,
  }: InputCreateTokenDto): Promise<OutputCreateTokenDto> {
    const newToken = TokenFactory.create(userId);

    await this.tokenRepository.create(newToken);

    return { token: newToken.id };
  }
}
