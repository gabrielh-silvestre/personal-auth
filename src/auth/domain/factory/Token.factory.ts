import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

import { Token } from '../entity/Token';

const DEFAULT_ACCESS_TOKEN_EXPIRE_TIME = 1000 * 60 * 60 * 24; // 1 day
const DEFAULT_REFRESH_TOKEN_EXPIRE_TIME = 1000 * 60 * 60 * 24 * 7; // 7 days

@Injectable()
export class TokenFactory {
  constructor(private readonly configService: ConfigService) {}

  createAccessToken(userId: string): Token {
    const tokenExpireTime =
      Number(this.configService.get<string>('ACCESS_TOKEN_EXPIRE_TIME')) ||
      DEFAULT_ACCESS_TOKEN_EXPIRE_TIME;

    return new Token(
      uuid(),
      userId,
      tokenExpireTime,
      new Date(),
      false,
      'ACCESS',
    );
  }

  createRefreshToken(userId: string): Token {
    const tokenExpireTime =
      Number(this.configService.get<string>('REFRESH_TOKEN_EXPIRE_TIME')) ||
      DEFAULT_REFRESH_TOKEN_EXPIRE_TIME;

    return new Token(
      uuid(),
      userId,
      tokenExpireTime,
      new Date(),
      false,
      'REFRESH',
    );
  }
}
