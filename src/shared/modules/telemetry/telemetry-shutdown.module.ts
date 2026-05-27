import {
  BeforeApplicationShutdown,
  Injectable,
  Logger,
  Module,
} from '@nestjs/common';

import { getTelemetryShutdown } from './shutdown';

@Injectable()
export class TelemetryShutdownService implements BeforeApplicationShutdown {
  private readonly logger = new Logger('TelemetryShutdown');

  async beforeApplicationShutdown(signal?: string): Promise<void> {
    const shutdown = getTelemetryShutdown();
    if (!shutdown) return;
    this.logger.log(`Flushing OpenTelemetry providers (signal=${signal})...`);
    try {
      await shutdown();
    } catch (error) {
      this.logger.error(
        `Telemetry shutdown failed: ${(error as Error).message}`,
      );
    }
  }
}

@Module({ providers: [TelemetryShutdownService] })
export class TelemetryShutdownModule {}
