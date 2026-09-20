import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { TOKEN_EXPIRES_IN, TOKEN_SECRET } from '@shared/utils/constants';

@Injectable()
export abstract class TokenJwtService {
  protected constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    private readonly tokenName: string,
  ) {}

  public async sign<T = unknown>(data: T): Promise<string | never> {
    return this.jwtService.signAsync(data as object, {
      secret: this.configService.get<string>(TOKEN_SECRET(this.tokenName)),
      // Unitless numeric string, jsonwebtoken/ms treats it as milliseconds.
      expiresIn: this.configService.get(TOKEN_EXPIRES_IN(this.tokenName)),
    });
  }

  public async verify<T = unknown>(token: string): Promise<T | never> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>(TOKEN_SECRET(this.tokenName)),
      maxAge: this.configService.get(TOKEN_EXPIRES_IN(this.tokenName)),
    }) as T;
  }
}
