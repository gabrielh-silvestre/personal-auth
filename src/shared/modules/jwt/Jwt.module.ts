import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { JwtAccessService } from '#shared/modules/jwt/JwtAccess.service';
import { JwtRefreshService } from '#shared/modules/jwt/JwtRefresh.service';
import { assertDistinctJwtSecrets } from '#shared/modules/jwt/jwt.util';

@Module({
  imports: [JwtModule],
  providers: [JwtAccessService, JwtRefreshService],
  exports: [JwtAccessService, JwtRefreshService],
})
export class CustomJwtModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    assertDistinctJwtSecrets(this.configService);
  }
}
