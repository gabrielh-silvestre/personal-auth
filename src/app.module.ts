import { Module } from '@nestjs/common/decorators';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { UserModule } from '@users/user.module';
import { TokenModule } from '@tokens/token.module';
import { AuthModule } from '@auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MONGO_URI } from '@shared/utils/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(
          MONGO_URI,
          'mongodb://localhost:27017/nestjs',
        ),
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    TokenModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
