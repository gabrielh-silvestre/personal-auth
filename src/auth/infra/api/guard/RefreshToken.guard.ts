import { Injectable } from '@nestjs/common';

import { createAuthGuard } from '#auth/infra/api/guard/createAuthGuard.guard';

@Injectable()
export class RefreshTokenGuard extends createAuthGuard<any>('refresh-token') {
  constructor() {
    super();
  }
}
