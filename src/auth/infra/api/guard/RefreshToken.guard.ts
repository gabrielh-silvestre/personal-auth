import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh-token') {
  constructor() {
    super();
  }

  handleRequest<T = any>(err: Error | null, user: T, info: any): T {
    if (info || err) {
      throw ExceptionFactory.forbidden(err?.message || info?.message);
    }

    return user;
  }
}
