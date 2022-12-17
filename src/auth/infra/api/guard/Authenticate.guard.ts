import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import type { TokenPayload } from '@auth/infra/gateway/token/token.gateway.interface';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class AuthenticateGuard extends AuthGuard('access-token') {
  constructor() {
    super();
  }

  handleRequest<T = TokenPayload>(err: Error | null, user: T, info: any): T {
    if (info || err) {
      throw ExceptionFactory.forbidden(err?.message || info?.message);
    }

    return user;
  }
}
