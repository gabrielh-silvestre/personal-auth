import { Types } from 'mongoose';

import { Token } from '../entity/Token';

export class TokenFactory {
  public static create(userId: string): Token {
    return new Token(
      new Types.ObjectId().toHexString(),
      userId,
      new Date(),
      false,
    );
  }
}
