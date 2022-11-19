import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { TOKEN_EXPIRES_IN, TOKEN_SECRET } from '@shared/utils/constants';

@Injectable()
export class JwtRefreshService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async sign<T = unknown>(data: T): Promise<string | never> {
    return this.jwtService.signAsync(data as object, {
      secret: this.configService.get<string>(
        TOKEN_SECRET('REFRESH_TOKEN'),
        'secret',
      ),
      expiresIn: this.configService.get<number>(
        TOKEN_EXPIRES_IN('REFRESH_TOKEN'),
        604800000,
      ),
    });
  }

  public async verify<T = unknown>(token: string): Promise<T | never> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>(
        TOKEN_SECRET('REFRESH_TOKEN'),
        'secret',
      ),
      maxAge: this.configService.get<number>(TOKEN_EXPIRES_IN('REFRESH_TOKEN')),
    }) as T;
  }
}
