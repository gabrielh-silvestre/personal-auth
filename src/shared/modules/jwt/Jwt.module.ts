import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtAccessService } from './JwtAccess.service.js';
import { JwtRefreshService } from './JwtRefresh.service.js';

@Module({
  imports: [JwtModule],
  providers: [JwtAccessService, JwtRefreshService],
  exports: [JwtAccessService, JwtRefreshService],
})
export class CustomJwtModule {}
