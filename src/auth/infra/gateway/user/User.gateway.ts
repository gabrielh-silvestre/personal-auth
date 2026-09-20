import { Inject, Injectable } from '@nestjs/common';
import { catchError, lastValueFrom, throwError, timeout, TimeoutError } from 'rxjs';

import type { IUserGateway, OutputUser } from './user.gateway.interface';
import type { IUserAdapter } from '@auth/infra/adapter/user/User.adapter.interface';

import { ExceptionFactory } from '@exceptions/factory/Exception.factory';
import { USER_ADAPTER } from '@auth/utils/constants';

const USER_SERVICE_TIMEOUT_MS = 5000;

@Injectable()
export class UserGateway implements IUserGateway {
  constructor(
    @Inject(USER_ADAPTER) private readonly userAdapter: IUserAdapter,
  ) {}

  verifyCredentials(email: string, password: string): Promise<OutputUser> {
    return lastValueFrom(
      this.userAdapter.send({ email, password }, 'verify_user_credentials').pipe(
        timeout(USER_SERVICE_TIMEOUT_MS),
        catchError((error) => {
          if (error instanceof TimeoutError) {
            return throwError(() => ExceptionFactory.internal('User service timeout'));
          }
          return throwError(() => error);
        }),
      ),
    );
  }
}
