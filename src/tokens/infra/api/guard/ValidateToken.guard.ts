import type { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { ValidateTokenUseCase } from '@tokens/useCase/validate/ValidateToken.useCase';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class ValidateTokenGuard implements CanActivate {
  constructor(private readonly validateTokenUseCase: ValidateTokenUseCase) {}

  private recoverToken(context: ExecutionContext) {
    const contextType = context.getType();

    switch (contextType) {
      case 'http':
        const httpRequest = context.switchToHttp().getRequest<Request>();
        return (
          httpRequest.headers.authorization ||
          httpRequest.params.token ||
          httpRequest.body.token
        );
      case 'rpc':
        return context.switchToRpc().getData<{ token: string }>().token;
      default:
        throw ExceptionFactory.nonAcceptable(
          `Context type ${contextType} not supported`,
        );
    }
  }

  private async validateToken(token: string): Promise<void | never> {
    await this.validateTokenUseCase.execute(token);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = this.recoverToken(context);

    return this.validateToken(token)
      .then(() => true)
      .catch(() => false);
  }
}
