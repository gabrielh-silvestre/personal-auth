import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { UserService } from '@users/user.service';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class ValidateUserGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { email, password } = request.body;

    const user = await this.userService.findByEmail(email);
    const isUserCredentialsValid = user && user.password.isEqual(password);

    if (!isUserCredentialsValid) {
      throw ExceptionFactory.unauthorized('Invalid credentials');
    }

    return true;
  }
}
