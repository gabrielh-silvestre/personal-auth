import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { TokenPayloadDto } from '#auth/infra/strategy/JwtPayload.dto';

import { getJwtSecret } from '#shared/modules/jwt/jwt.util';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-token',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => (req as any).token, // Recover token from gRPC request
        (req) => req?.cookies?.Access,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(configService, 'ACCESS_TOKEN'),
    });
  }

  async validate(payload: TokenPayloadDto): Promise<TokenPayloadDto> {
    return payload;
  }
}
