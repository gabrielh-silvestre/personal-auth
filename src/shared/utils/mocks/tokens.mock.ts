import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

import { Token } from '@auth/domain/entity/Token';
import { TokenFactory } from '@auth/domain/factory/Token.factory';

const tokenFactory = new TokenFactory(new ConfigService({}));

export const TOKENS_MOCK: Token[] = [
  tokenFactory.createAccessToken(uuid()),
  tokenFactory.createAccessToken(uuid()),
  tokenFactory.createAccessToken(uuid()),
  tokenFactory.createRefreshToken(uuid()),
];
