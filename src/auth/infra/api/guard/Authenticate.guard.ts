import { Injectable } from '@nestjs/common';

import type { TokenPayloadDto } from '#auth/infra/strategy/JwtPayload.dto';

import { createAuthGuard } from '#auth/infra/api/guard/createAuthGuard.guard';

@Injectable()
export class AuthenticateGuard extends createAuthGuard<TokenPayloadDto>(
  'access-token',
) {
  constructor() {
    super();
  }
}
