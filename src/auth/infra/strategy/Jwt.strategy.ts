import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { TokenPayload } from '../service/token/Token.service.adaptor';
import type { ITokenService } from '../service/token/token.service.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenService: ITokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => (req as any).token,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: TokenPayload): Promise<TokenPayload> {
    await this.tokenService.verifyToken(payload.tokenId);

    return { userId: payload.userId, tokenId: payload.tokenId };
  }
}
