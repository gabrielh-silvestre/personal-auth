import type { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { TokenService } from '@tokens/token.service';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class ValidateTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  private recoverToken(context: ExecutionContext): string {
    const contextType = context.getType();

    switch (contextType) {
      case 'http':
        const httpRequest = context.switchToHttp().getRequest<Request>();
        return httpRequest.headers.authorization || httpRequest.params.token;
      case 'rpc':
        return context.switchToRpc().getData<{ token: string }>().token;
      default:
        throw ExceptionFactory.internal(
          `Context type ${contextType} not supported`,
        );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = this.recoverToken(context);

    try {
      const isTokenValid = await this.tokenService.validateToken(token);

      if (!isTokenValid) {
        throw ExceptionFactory.unauthorized('Invalid token');
      }

      return true;
    } catch (err) {
      throw ExceptionFactory.unauthorized(err.message);
    }
  }
}
