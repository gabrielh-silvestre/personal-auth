import { Types } from 'mongoose';

import { Token } from '../entity/Token';
import { TokenType } from '../entity/token.interface';

export class TokenFactory {
  public static createAccessToken(userId: string): Token {
    return new Token(
      new Types.ObjectId().toHexString(),
      userId,
      new Date(),
      false,
      TokenType.ACCESS,
    );
  }

  public static createRecoverPasswordToken(userId: string): Token {
    return new Token(
      new Types.ObjectId().toHexString(),
      userId,
      new Date(),
      false,
      TokenType.RECOVER_PASSWORD,
    );
  }
}
