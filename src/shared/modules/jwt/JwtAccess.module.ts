import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtFactory } from './Jwt.factory';

@Module({
  imports: [JwtFactory.register({ name: 'ACCESS_TOKEN' })],
  providers: [
    {
      provide: 'ACCESS_TOKEN_SERVICE',
      useExisting: JwtService,
    },
  ],
  exports: ['ACCESS_TOKEN_SERVICE'],
})
export class JwtAccessModule {}
