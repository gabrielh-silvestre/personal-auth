import { Module } from '@nestjs/common/decorators';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { TokenMongooseRepository } from './infra/repository/mongoose/Token.repository';
import {
  tokenSchema,
  TokenSchema,
} from './infra/repository/mongoose/Token.schema';

import { TokenService } from './token.service';
import { TokenGrpcServerController } from './infra/grpc/controller/Token.grpc-server.controller';

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
  controllers: [TokenGrpcServerController],
  providers: [
    TokenService,
    {
      provide: 'TOKEN_REPO',
      useClass: TokenMongooseRepository,
    },
  ],
  exports: [TokenService],
})
export class TokenModule {}
