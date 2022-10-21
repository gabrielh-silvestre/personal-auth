import type { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';

import type { ITokenService } from '@auth/infra/service/token/token.service.interface';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class ValidateTokenGuard implements CanActivate {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenService: ITokenService,
  ) {}

  private recoverToken(context: ExecutionContext): string {
    const contextType = context.getType();

    switch (contextType) {
      case 'http':
        const token =
          context.switchToHttp().getRequest<Request>().body.token ||
          context.switchToHttp().getRequest<Request>().params.token ||
          context.switchToHttp().getRequest<Request>().query.token;
        return token;
      case 'rpc':
        return context.switchToRpc().getData<{ token: string }>().token;
      default:
        throw ExceptionFactory.nonAcceptable(
          `Context type ${contextType} not supported`,
        );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = this.recoverToken(context);
    return this.tokenService
      .verifyToken(token)
      .then(() => true)
      .catch(() => false);
  }
}
