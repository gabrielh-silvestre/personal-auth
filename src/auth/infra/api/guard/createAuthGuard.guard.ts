import { AuthGuard } from '@nestjs/passport';

import { ExceptionFactory } from '#exceptions/factory/Exception.factory';

// Shared by AuthenticateGuard and RefreshTokenGuard: same rejection rule,
// different passport strategy and different default payload type.
export function createAuthGuard<TDefault>(strategy: string) {
  return class extends AuthGuard(strategy) {
    handleRequest<T = TDefault>(err: Error | null, user: T, info: any): T {
      if (info || err) {
        throw ExceptionFactory.forbidden(err?.message || info?.message);
      }

      return user;
    }
  };
}
