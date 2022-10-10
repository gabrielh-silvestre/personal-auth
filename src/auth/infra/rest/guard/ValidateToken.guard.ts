import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { AuthService } from '@auth/auth.service';

@Injectable()
export class ValidateTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;

    const token = (authorization as string).replace(/^Bearer\s/, '');

    await this.authService.validateToken(token);

    return true;
  }
}
