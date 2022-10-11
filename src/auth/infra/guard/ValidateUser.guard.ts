import type { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import type { InputLoginUserDto } from '@users/dto/LoginUser.dto';

import { UserService } from '@users/user.service';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class ValidateUserGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  private recoverData(context: ExecutionContext): InputLoginUserDto {
    const contextType = context.getType();

    switch (contextType) {
      case 'http':
        return context.switchToHttp().getRequest<Request>().body;
      case 'rpc':
        return context.switchToRpc().getData<InputLoginUserDto>();
      default:
        throw ExceptionFactory.internal(
          `Context type ${contextType} not supported`,
        );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { email, password } = this.recoverData(context);

    const user = await this.userService.findByEmail(email);
    const isUserCredentialsValid = user && user.password.isEqual(password);

    if (!isUserCredentialsValid) {
      throw ExceptionFactory.unauthorized('Invalid credentials');
    }

    return true;
  }
}
