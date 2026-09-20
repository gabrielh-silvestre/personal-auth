import { Injectable } from '@nestjs/common';

import { createAuthGuard } from './createAuthGuard';

@Injectable()
export class AuthenticateGuard extends createAuthGuard('access-token') {}
