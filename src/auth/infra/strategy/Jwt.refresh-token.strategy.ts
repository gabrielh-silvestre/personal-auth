import type { Request } from 'express';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { TokenPayload } from '@auth/infra/service/token/token.service.interface';

import { TOKEN_SECRET } from '@shared/utils/constants';

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
      secretOrKey: configService.get<string>(
        TOKEN_SECRET('REFRESH_TOKEN'),
        'secret',
      ),
    });
  }

  async validate(payload: TokenPayload): Promise<TokenPayload> {
    return { userId: payload.userId, tokenId: payload.tokenId };
  }
}
