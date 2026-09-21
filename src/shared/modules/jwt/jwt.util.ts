import { ConfigService } from '@nestjs/config';

import {
  NODE_ENV,
  TOKEN_EXPIRES_IN,
  TOKEN_SECRET,
} from '#shared/utils/constants/index';

const FALLBACK_SECRET: Record<string, string> = {
  ACCESS_TOKEN: 'dev-access-secret',
  REFRESH_TOKEN: 'dev-refresh-secret',
};

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
  if (isDevOrTest(configService)) return FALLBACK_SECRET[name];

  throw new Error(`Missing required environment variable: ${key}`);
}

// Both token types share one payload shape with no `type` field, so the
// secret is the only thing telling access and refresh tokens apart —
// identical secrets let an access token pass as a refresh token.
export function assertDistinctJwtSecrets(configService: ConfigService): void {
  const accessSecret = getJwtSecret(configService, 'ACCESS_TOKEN');
  const refreshSecret = getJwtSecret(configService, 'REFRESH_TOKEN');

  if (accessSecret === refreshSecret) {
    throw new Error(
      'JWT_ACCESS_TOKEN_SECRET and JWT_REFRESH_TOKEN_SECRET must be different',
    );
  }
}

// jsonwebtoken treats a numeric expiresIn as seconds but a numeric *string*
// (what .env vars always are) as milliseconds via the `ms` package — so
// devTestFallback, being a genuine JS number, must be given in seconds.
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
