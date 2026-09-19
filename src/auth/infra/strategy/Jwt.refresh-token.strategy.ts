import type { Request } from 'express';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { TokenPayloadDto } from './JwtPayload.dto.js';

import { getJwtSecret } from '@shared/modules/jwt/jwt.util.js';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => (req as any).token, // Recover token from gRPC request
        (req: Request) => req?.cookies?.Refresh,
      ]),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(configService, 'REFRESH_TOKEN'),
    });
  }

  async validate(payload: TokenPayloadDto): Promise<TokenPayloadDto> {
    return payload;
  }
}
