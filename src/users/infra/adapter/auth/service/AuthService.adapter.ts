import { Inject, Injectable } from '@nestjs/common';
import { Observable, from, map, catchError } from 'rxjs';

import type { AuthResponse, IAuthAdapter } from '../Auth.adapter.interface';
import type { ITokenService } from '@auth/infra/service/token/token.service.interface';

@Injectable()
export class AuthServiceAdapter implements IAuthAdapter {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenService: ITokenService,
  ) {}

  verify(token: string): Observable<AuthResponse | null> {
    return from(this.tokenService.verifyJwtToken(token)).pipe(
      map(({ userId }) => ({ userId })),
      catchError(() => from([null])),
    );
  }
}
