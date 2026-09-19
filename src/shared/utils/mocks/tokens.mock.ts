import { v4 as uuid } from 'uuid';

import { Token } from '@auth/domain/entity/Token.js';
import { TokenFactory } from '@auth/domain/factory/Token.factory.js';

export const TOKENS_MOCK: Token[] = [
  TokenFactory.createAccessToken(uuid()),
  TokenFactory.createAccessToken(uuid()),
  TokenFactory.createAccessToken(uuid()),
  TokenFactory.createRefreshToken(uuid()),
];
