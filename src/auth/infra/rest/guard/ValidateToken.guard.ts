import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { TokenService } from '@tokens/token.service';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class ValidateTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    const token = authorization
      ? (authorization as string).replace(/^Bearer\s/, '')
      : request.params.token;

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
