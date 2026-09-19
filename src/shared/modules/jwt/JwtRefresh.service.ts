import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { getJwtExpiresIn, getJwtSecret } from './jwt.util.js';

@Injectable()
export class JwtRefreshService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async sign<T = unknown>(data: T): Promise<string | never> {
    return this.jwtService.signAsync(data as object, {
      secret: getJwtSecret(this.configService, 'REFRESH_TOKEN'),
      expiresIn: getJwtExpiresIn(
        this.configService,
        'REFRESH_TOKEN',
        604800000,
      ),
    });
  }

  public async verify<T = unknown>(token: string): Promise<T | never> {
    return this.jwtService.verifyAsync(token, {
      secret: getJwtSecret(this.configService, 'REFRESH_TOKEN'),
      maxAge: getJwtExpiresIn(this.configService, 'REFRESH_TOKEN', 604800000),
    }) as T;
  }
}
