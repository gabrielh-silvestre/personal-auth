import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from '@users/user.module';
import { TokenModule } from '@tokens/token.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nestjs';

@Module({
  imports: [MongooseModule.forRoot(MONGO_URI), UserModule, TokenModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
