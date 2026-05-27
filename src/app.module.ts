import { Module } from '@nestjs/common/decorators';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '@auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MONGO_URI } from '@shared/utils/constants';

import { TelemetryModule } from '@shared/modules/telemetry/Telemetry.module';
import { TelemetryShutdownModule } from '@shared/modules/telemetry/telemetry-shutdown.module';

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
    AuthModule,
    TelemetryModule,
    TelemetryShutdownModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
