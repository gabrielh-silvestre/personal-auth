import { v4 as uuid } from 'uuid';

import { Token } from '../entity/Token';
import { TokenType } from '../entity/token.interface';

export class TokenFactory {
  public static createAccessToken(userId: string): Token {
    return new Token(uuid(), userId, new Date(), false, TokenType.ACCESS);
  }

  public static createRecoverPasswordToken(userId: string): Token {
    return new Token(
      uuid(),
      userId,
      new Date(),
      false,
      TokenType.RECOVER_PASSWORD,
    );
  }
}
