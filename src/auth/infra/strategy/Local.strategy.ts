import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { catchError, lastValueFrom, map } from 'rxjs';
import { Strategy } from 'passport-local';

import type { IUserService } from '@auth/infra/service/user/user.service.interface';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: IUserService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const obsUserId = this.userService.verifyCredentials(email, password).pipe(
      map(({ id }) => ({ userId: id })),
      catchError(() => {
        throw ExceptionFactory.forbidden('Unauthorized');
      }),
    );

    return lastValueFrom(obsUserId);
  }
}
