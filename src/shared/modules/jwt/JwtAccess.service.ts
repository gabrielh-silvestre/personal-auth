import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { TokenJwtService } from './TokenJwt.service';

@Injectable()
export class JwtAccessService extends TokenJwtService {
  constructor(jwtService: JwtService, configService: ConfigService) {
    super(jwtService, configService, 'ACCESS_TOKEN');
  }
}
