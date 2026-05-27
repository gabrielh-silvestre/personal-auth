import { SetMetadata } from '@nestjs/common';

export const TELEMETRY_TOKEN_TYPE_KEY = 'telemetry:tokenType';

export type TelemetryTokenTypeValue = 'access' | 'refresh' | 'recover';

/** Declarative label for the AUTH_TOKEN_TYPE span attribute. */
export const TelemetryTokenType = (value: TelemetryTokenTypeValue) =>
  SetMetadata(TELEMETRY_TOKEN_TYPE_KEY, value);
