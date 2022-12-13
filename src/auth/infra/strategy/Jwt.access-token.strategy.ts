import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type {
  ITokenGateway,
  TokenPayload,
} from '../gateway/token/token.gateway.interface';

import { TOKEN_SECRET } from '@shared/utils/constants';
import { TOKEN_GATEWAY } from '@auth/utils/constants';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-token',
) {
  constructor(
    @Inject(TOKEN_GATEWAY) private readonly tokenGateway: ITokenGateway,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => (req as any).token, // Recover token from gRPC request
        (req) => req?.cookies?.Access,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        TOKEN_SECRET('ACCESS_TOKEN'),
        'secret',
      ),
    });
  }

  async validate(payload: TokenPayload): Promise<TokenPayload> {
    await this.tokenGateway.verifyToken(payload.tokenId);
    return payload;
  }
}
