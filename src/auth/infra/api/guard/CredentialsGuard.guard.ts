import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import type { TokenPayload } from '@auth/infra/service/token/token.service.interface';
import type { InputLoginDto } from '@auth/useCase/login/Login.dto';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class CredentialsGuard extends AuthGuard('local') {
  private convertGrpcCredentialsToHttpBody(context: ExecutionContext): void {
    const { email, password } = context.switchToRpc().getData<InputLoginDto>();
    context.switchToHttp().getRequest().body = { email, password };
  }

  handleRequest<T = TokenPayload>(err: any, user: any): T {
    if (err || !user) {
      throw ExceptionFactory.forbidden('Invalid credentials');
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
