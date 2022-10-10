import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type {
  InputCreateTokenDto,
  JwtTokenPayload,
  OutputCreateTokenDto,
} from './dto/CreateToken.dto';
import type { ITokenRepository } from './domain/repository/token.repository.interface';

import { TokenFactory } from './domain/factory/Token.factory';

@Injectable()
export class TokenService {
  constructor(
    @Inject('TOKEN_REPO') private readonly tokenRepository: ITokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createToken({
    userId,
  }: InputCreateTokenDto): Promise<OutputCreateTokenDto> {
    const newToken = TokenFactory.create(userId);

    await this.tokenRepository.create(newToken);

    const jwtToken = await this.jwtService.signAsync({
      tokenId: newToken.id,
      userId: newToken.userId,
    });

    return { token: jwtToken };
  }

  async validateToken(token: string): Promise<boolean> {
    const { tokenId } = await this.jwtService.verifyAsync<JwtTokenPayload>(
      token,
    );

    const foundToken = await this.tokenRepository.find(tokenId);

    return foundToken ? foundToken.isValid() : false;
  }
}
