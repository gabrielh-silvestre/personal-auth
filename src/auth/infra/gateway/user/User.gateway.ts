import { Inject, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import type { IUserGateway, OutputUser } from './user.gateway.interface.js';
import type { IUserAdapter } from '@auth/infra/adapter/user/user.adapter.interface.js';

import { USER_ADAPTER } from '@auth/utils/constants/index.js';

@Injectable()
export class UserGateway implements IUserGateway {
  constructor(
    @Inject(USER_ADAPTER) private readonly userAdapter: IUserAdapter,
  ) {}

  verifyCredentials(email: string, password: string): Promise<OutputUser> {
    return lastValueFrom(
      this.userAdapter.send({ email, password }, 'verify_user_credentials'),
    );
  }
}
