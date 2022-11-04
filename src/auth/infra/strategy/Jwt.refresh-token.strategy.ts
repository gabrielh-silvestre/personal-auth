import type { Request } from 'express';

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type {
  ITokenService,
  TokenPayload,
} from '@auth/infra/service/token/token.service.interface';

import { TOKEN_SECRET } from '@shared/utils/constants';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenService: ITokenService,
    private readonly configService: ConfigService,
  ) {
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
    await this.tokenService.verifyToken(payload.tokenId);
    return payload;
  }
}
