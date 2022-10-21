import type { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';

import type { IUserService } from '@auth/infra/service/user/user.service.interface';
import type { InputLoginDto } from '@auth/useCase/login/Login.dto';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class ValidateUserCredentialsGuard implements CanActivate {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: IUserService,
  ) {}

  private recoverData(context: ExecutionContext): InputLoginDto {
    const contextType = context.getType();

    switch (contextType) {
      case 'http':
        return context.switchToHttp().getRequest<Request>().body;
      case 'rpc':
        return context.switchToRpc().getData<InputLoginDto>();
      default:
        throw ExceptionFactory.nonAcceptable(
          `Context type ${contextType} not supported`,
        );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { email, password } = this.recoverData(context);

    const user = await this.userService.findByEmail(email);
    const isCredentialsValid = user && user.password.isEqual(password);

    if (!isCredentialsValid) {
      return false;
    }

    return true;
  }
}
