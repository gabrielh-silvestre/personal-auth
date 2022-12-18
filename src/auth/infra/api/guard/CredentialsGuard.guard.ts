import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import type { TokenPayloadDto } from '@auth/infra/strategy/JwtPayload.dto';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

export type InputCredentialsDto = {
  email: string;
  password: string;
};

@Injectable()
export class CredentialsGuard extends AuthGuard('local') {
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
