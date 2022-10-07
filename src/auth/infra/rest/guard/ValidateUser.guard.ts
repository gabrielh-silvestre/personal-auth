import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { AuthService } from '@auth/auth.service';

@Injectable()
export class ValidateUserGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { email, password } = request.body;

    const user = await this.authService.validateUser({ email, password });

    if (user) {
      request.user = user;
      return true;
    }

    return false;
  }
}
