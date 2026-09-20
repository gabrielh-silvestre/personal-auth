import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { TokenJwtService } from './TokenJwt.service';

@Injectable()
export class JwtRefreshService extends TokenJwtService {
  constructor(jwtService: JwtService, configService: ConfigService) {
    super(jwtService, configService, 'REFRESH_TOKEN');
  }
}
