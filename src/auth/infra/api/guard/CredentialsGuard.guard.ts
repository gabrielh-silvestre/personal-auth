import { ExecutionContext, Injectable, Optional } from '@nestjs/common';
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport';
import { Observable } from 'rxjs';

import type { TokenPayloadDto } from '@auth/infra/strategy/JwtPayload.dto.js';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory.js';

export type InputCredentialsDto = {
  email: string;
  password: string;
};

@Injectable()
export class CredentialsGuard extends AuthGuard('local') {
  // Nest 12's DI reads @Optional() metadata with getOwnMetadata (no prototype
  // fallback), so a subclass with no constructor of its own is treated as
  // requiring AuthModuleOptions. Redeclaring the constructor re-attaches the
  // metadata directly on this class.
  constructor(@Optional() options?: AuthModuleOptions) {
    super(options);
  }

  private convertGrpcCredentialsToHttpBody(context: ExecutionContext): void {
    const { email, password } = context
      .switchToRpc()
      .getData<InputCredentialsDto>();
    context.switchToHttp().getRequest().body = { email, password };
  }

  handleRequest<T = TokenPayloadDto>(err: any, user: any, info: any): T {
    if (err || !user) {
      throw ExceptionFactory.forbidden(err?.message || info?.message);
    }

    return user;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isGrpcRequest = context.getType() === 'rpc';

    if (isGrpcRequest) {
      this.convertGrpcCredentialsToHttpBody(context);
    }

    return super.canActivate(context);
  }
}
