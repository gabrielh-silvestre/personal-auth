import { ConfigService } from '@nestjs/config';

import {
  NODE_ENV,
  TOKEN_EXPIRES_IN,
  TOKEN_SECRET,
} from '@shared/utils/constants/index.js';

const FALLBACK_SECRET = 'secret';

function isDevOrTest(configService: ConfigService): boolean {
  const env = configService.get<string>(NODE_ENV);

  return env === 'development' || env === 'test';
}

export function getJwtSecret(
  configService: ConfigService,
  name: string,
): string {
  const key = TOKEN_SECRET(name);
  const value = configService.get<string>(key);

  if (value) return value;
  if (isDevOrTest(configService)) return FALLBACK_SECRET;

  throw new Error(`Missing required environment variable: ${key}`);
}

export function getJwtExpiresIn(
  configService: ConfigService,
  name: string,
  devTestFallback: number,
): number {
  const key = TOKEN_EXPIRES_IN(name);
  const value = configService.get<number>(key);

  if (value) return value;
  if (isDevOrTest(configService)) return devTestFallback;

  throw new Error(`Missing required environment variable: ${key}`);
}
