import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtAccessService } from './JwtAccess.service';
import { JwtRefreshService } from './JwtRefresh.service';

@Module({
  imports: [JwtModule],
  providers: [JwtAccessService, JwtRefreshService],
  exports: [JwtAccessService, JwtRefreshService],
})
export class CustomJwtModule {}
