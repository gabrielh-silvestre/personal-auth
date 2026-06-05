import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { TelemetryInterceptor } from './interceptor/Telemetry.interceptor';

@Module({
  providers: [{ provide: APP_INTERCEPTOR, useClass: TelemetryInterceptor }],
})
export class TelemetryModule {}
