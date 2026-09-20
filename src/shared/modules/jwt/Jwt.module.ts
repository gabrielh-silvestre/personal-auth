import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtAccessService } from '#shared/modules/jwt/JwtAccess.service';
import { JwtRefreshService } from '#shared/modules/jwt/JwtRefresh.service';

@Module({
  imports: [JwtModule],
  providers: [JwtAccessService, JwtRefreshService],
  exports: [JwtAccessService, JwtRefreshService],
})
export class CustomJwtModule {}
