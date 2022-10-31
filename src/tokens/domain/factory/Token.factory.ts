import { v4 as uuid } from 'uuid';

import { Token } from '../entity/Token';
import { TokenType } from '../entity/token.interface';

export class TokenFactory {
  private static ACCESS_TOKEN_EXPIRE_TIME = 1000 * 60 * 60 * 24; // 1 day
  private static RECOVER_PASSWORD_TOKEN_EXPIRE_TIME = 1000 * 60 * 60 * 24; // 1 day
  private static REFRESH_TOKEN_EXPIRE_TIME = 1000 * 60 * 60 * 24 * 7; // 7 days

  public static createAccessToken(userId: string): Token {
    const tokenExpireTime =
      Number(process.env.ACCESS_TOKEN_EXPIRE_TIME) ||
      TokenFactory.ACCESS_TOKEN_EXPIRE_TIME;

    return new Token(
      uuid(),
      userId,
      tokenExpireTime,
      new Date(),
      false,
      TokenType.ACCESS,
    );
  }

  public static createRecoverPasswordToken(userId: string): Token {
    const tokenExpireTime =
      Number(process.env.RECOVER_PASSWORD_TOKEN_EXPIRE_TIME) ||
      TokenFactory.RECOVER_PASSWORD_TOKEN_EXPIRE_TIME;

    return new Token(
      uuid(),
      userId,
      tokenExpireTime,
      new Date(),
      false,
      TokenType.RECOVER_PASSWORD,
    );
  }

  public static createRefreshToken(userId: string): Token {
    const tokenExpireTime =
      Number(process.env.REFRESH_TOKEN_EXPIRE_TIME) ||
      TokenFactory.REFRESH_TOKEN_EXPIRE_TIME;

    return new Token(
      uuid(),
      userId,
      tokenExpireTime,
      new Date(),
      false,
      TokenType.REFRESH,
    );
  }
}
