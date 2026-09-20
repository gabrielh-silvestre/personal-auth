import { Injectable } from '@nestjs/common';

import { createAuthGuard } from './createAuthGuard';

@Injectable()
export class RefreshTokenGuard extends createAuthGuard('refresh-token') {}
