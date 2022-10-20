import { Module } from '@nestjs/common/decorators';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { RevokeTokenController } from './infra/api/controller/RevokeToken.controller';
import { RevokeTokenUseCase } from './useCase/revoke/RevokeToken.useCase';

import { TokenMongooseRepository } from './infra/repository/mongoose/Token.repository';
import {
  tokenSchema,
  TokenSchema,
} from './infra/repository/mongoose/Token.schema';

const SECRET = process.env.JWT_SECRET || 'secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TokenSchema.name, schema: tokenSchema },
    ]),
    JwtModule.register({
      secret: SECRET,
      verifyOptions: { maxAge: EXPIRES_IN },
      signOptions: { expiresIn: EXPIRES_IN },
    }),
  ],
  controllers: [RevokeTokenController],
  providers: [
    RevokeTokenUseCase,
    {
      provide: 'TOKEN_REPO',
      useClass: TokenMongooseRepository,
    },
  ],
  exports: [],
})
export class TokenModule {}
