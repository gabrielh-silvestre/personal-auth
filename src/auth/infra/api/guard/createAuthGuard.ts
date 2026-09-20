import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import type { TokenPayloadDto } from '@auth/infra/strategy/JwtPayload.dto';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

export function createAuthGuard(strategy: string) {
  @Injectable()
  class MixinAuthGuard extends AuthGuard(strategy) {
    handleRequest<T = TokenPayloadDto>(err: Error | null, user: T, info: any): T {
      if (info || err) {
        throw ExceptionFactory.forbidden(err?.message || info?.message);
      }

      return user;
    }
  }

  return MixinAuthGuard;
}
