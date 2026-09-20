import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { getJwtExpiresIn, getJwtSecret } from '#shared/modules/jwt/jwt.util';

@Injectable()
export class JwtAccessService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async sign<T = unknown>(data: T): Promise<string | never> {
    return this.jwtService.signAsync(data as object, {
      secret: getJwtSecret(this.configService, 'ACCESS_TOKEN'),
      expiresIn: getJwtExpiresIn(this.configService, 'ACCESS_TOKEN', 86400000),
    });
  }

  public async verify<T = unknown>(token: string): Promise<T | never> {
    return this.jwtService.verifyAsync(token, {
      secret: getJwtSecret(this.configService, 'ACCESS_TOKEN'),
      maxAge: getJwtExpiresIn(this.configService, 'ACCESS_TOKEN', 86400000),
    }) as T;
  }
}
