import { Inject, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import type { IUserGateway, OutputUser } from './user.gateway.interface';
// import type { IUserAdapter } from '@auth/infra/adapter/user/User.adapter.interface';

import { USER_ADAPTER } from '@auth/utils/constants';

@Injectable()
export class UserGateway implements IUserGateway {
  constructor(@Inject(USER_ADAPTER) private readonly userAdapter: any) {}

  verifyCredentials(email: string, password: string): Promise<OutputUser> {
    return lastValueFrom(
      this.userAdapter.send({ email, password }, 'verify_user_credentials'),
    );
  }
}
