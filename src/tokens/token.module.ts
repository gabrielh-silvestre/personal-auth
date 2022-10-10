import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { TokenMongooseRepository } from './infra/repository/mongoose/Token.repository';
import {
  tokenSchema,
  TokenSchema,
} from './infra/repository/mongoose/Token.schema';
import { TokenService } from './token.service';

const SECRET = process.env.JWT_SECRET || 'secret';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TokenSchema.name, schema: tokenSchema },
    ]),
    JwtModule.register({
      secret: SECRET,
      verifyOptions: { maxAge: '3m' },
      signOptions: { expiresIn: '3m' },
    }),
  ],
  providers: [
    {
      provide: 'TOKEN_REPO',
      useClass: TokenMongooseRepository,
    },
    TokenService,
  ],
  exports: [TokenService],
})
export class TokenModule {}
