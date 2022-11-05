import { v4 as uuid } from 'uuid';

import { Token } from '@tokens/domain/entity/Token';
import { TokenFactory } from '@tokens/domain/factory/Token.factory';

export const TOKENS_MOCK: Token[] = [
  TokenFactory.createAccessToken(uuid()),
  TokenFactory.createAccessToken(uuid()),
  TokenFactory.createAccessToken(uuid()),
  TokenFactory.createRefreshToken(uuid()),
];
