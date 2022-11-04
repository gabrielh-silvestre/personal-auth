import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtFactory } from './Jwt.factory';

@Module({
  imports: [JwtFactory.register({ name: 'REFRESH_TOKEN' })],
  providers: [
    {
      provide: 'REFRESH_TOKEN_SERVICE',
      useExisting: JwtService,
    },
  ],
  exports: ['REFRESH_TOKEN_SERVICE'],
})
export class JwtRefreshModule {}
