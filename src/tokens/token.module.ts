import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TokenMongooseRepository } from './infra/repository/mongoose/Token.repository';
import {
  tokenSchema,
  TokenSchema,
} from './infra/repository/mongoose/Token.schema';
import { TokenRestController } from './infra/rest/Token.rest.controller';
import { TokenService } from './token.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TokenSchema.name, schema: tokenSchema },
    ]),
  ],
  controllers: [TokenRestController],
  providers: [
    {
      provide: 'TOKEN_REPO',
      useClass: TokenMongooseRepository,
    },
    TokenService,
  ],
})
export class TokenModule {}
