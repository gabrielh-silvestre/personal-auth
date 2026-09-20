import type { ConfigService } from '@nestjs/config';

import {
  assertDistinctJwtSecrets,
  getJwtExpiresIn,
  getJwtSecret,
} from '#shared/modules/jwt/jwt.util';

function fakeConfigService(
  values: Record<string, string | number>,
): ConfigService {
  return { get: (key: string) => values[key] } as ConfigService;
}

describe('Unit test Jwt config helpers', () => {
  describe('getJwtSecret', () => {
    it('should return the configured secret when set', () => {
      const configService = fakeConfigService({
        JWT_ACCESS_TOKEN_SECRET: 'my-secret',
      });

      expect(getJwtSecret(configService, 'ACCESS_TOKEN')).toBe('my-secret');
    });

    it('should fall back to a dev secret when NODE_ENV is development', () => {
      const configService = fakeConfigService({ NODE_ENV: 'development' });

      expect(getJwtSecret(configService, 'ACCESS_TOKEN')).toBe(
        'dev-access-secret',
      );
    });

    it('should fall back to a dev secret when NODE_ENV is test', () => {
      const configService = fakeConfigService({ NODE_ENV: 'test' });

      expect(getJwtSecret(configService, 'REFRESH_TOKEN')).toBe(
        'dev-refresh-secret',
      );
    });

    it('should throw naming the variable when NODE_ENV is production', () => {
      const configService = fakeConfigService({ NODE_ENV: 'production' });

      expect(() => getJwtSecret(configService, 'ACCESS_TOKEN')).toThrow(
        'Missing required environment variable: JWT_ACCESS_TOKEN_SECRET',
      );
    });

    it('should throw naming the variable when NODE_ENV is undefined', () => {
      const configService = fakeConfigService({});

      expect(() => getJwtSecret(configService, 'REFRESH_TOKEN')).toThrow(
        'Missing required environment variable: JWT_REFRESH_TOKEN_SECRET',
      );
    });
  });

  describe('getJwtExpiresIn', () => {
    it('should return the configured value when set', () => {
      const configService = fakeConfigService({
        JWT_ACCESS_TOKEN_EXPIRES_IN: 123,
      });

      expect(getJwtExpiresIn(configService, 'ACCESS_TOKEN', 1)).toBe(123);
    });

    it('should fall back to the given default (in seconds) when NODE_ENV is test', () => {
      const configService = fakeConfigService({ NODE_ENV: 'test' });

      expect(getJwtExpiresIn(configService, 'ACCESS_TOKEN', 86400)).toBe(86400);
    });

    it('should throw naming the variable when NODE_ENV is production', () => {
      const configService = fakeConfigService({ NODE_ENV: 'production' });

      expect(() =>
        getJwtExpiresIn(configService, 'REFRESH_TOKEN', 604800),
      ).toThrow(
        'Missing required environment variable: JWT_REFRESH_TOKEN_EXPIRES_IN',
      );
    });
  });

  describe('assertDistinctJwtSecrets', () => {
    it('should not throw when the access and refresh secrets differ', () => {
      const configService = fakeConfigService({
        JWT_ACCESS_TOKEN_SECRET: 'access-secret',
        JWT_REFRESH_TOKEN_SECRET: 'refresh-secret',
      });

      expect(() => assertDistinctJwtSecrets(configService)).not.toThrow();
    });

    it('should throw when the access and refresh secrets are the same', () => {
      const configService = fakeConfigService({
        JWT_ACCESS_TOKEN_SECRET: 'same-secret',
        JWT_REFRESH_TOKEN_SECRET: 'same-secret',
      });

      expect(() => assertDistinctJwtSecrets(configService)).toThrow(
        'JWT_ACCESS_TOKEN_SECRET and JWT_REFRESH_TOKEN_SECRET must be different',
      );
    });

    it('should not throw with the dev/test fallback secrets', () => {
      const configService = fakeConfigService({ NODE_ENV: 'test' });

      expect(() => assertDistinctJwtSecrets(configService)).not.toThrow();
    });
  });
});
