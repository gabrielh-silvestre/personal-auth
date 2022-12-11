import { Inject, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import type { IAuthAdapter } from '@users/infra/adapter/auth/Auth.adapter.interface';
import type { AuthGatewayOutput, IAuthGateway } from './auth.gateway.interface';

import { AUTH_ADAPTER } from '@users/utils/constants';

@Injectable()
export class AuthGateway implements IAuthGateway {
  constructor(
    @Inject(AUTH_ADAPTER) private readonly authAdapter: IAuthAdapter,
  ) {}

  verify(token: string): Promise<AuthGatewayOutput | null> {
    return lastValueFrom(this.authAdapter.verify(token));
  }
}
