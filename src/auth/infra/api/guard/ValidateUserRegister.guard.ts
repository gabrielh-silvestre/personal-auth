import type { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';

import type { IUserService } from '@auth/infra/service/user/user.service.interface';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class ValidateUserRegisterGuard implements CanActivate {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: IUserService,
  ) {}

  private recoverData(context: ExecutionContext): { email: string } {
    const contextType = context.getType();

    switch (contextType) {
      case 'http':
        return context.switchToHttp().getRequest<Request>().body;
      case 'rpc':
        return context.switchToRpc().getData<{ email: string }>();
      default:
        throw ExceptionFactory.nonAcceptable(
          `Context type ${contextType} not supported`,
        );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean | never> {
    const { email } = this.recoverData(context);
    await this.userService.findByEmail(email);

    return true;
  }
}
