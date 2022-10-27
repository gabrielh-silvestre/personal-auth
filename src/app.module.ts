import { Module } from '@nestjs/common/decorators';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { UserModule } from '@users/user.module';
import { TokenModule } from '@tokens/token.module';
import { AuthModule } from '@auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nestjs';

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URI),
    EventEmitterModule.forRoot(),
    UserModule,
    TokenModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
