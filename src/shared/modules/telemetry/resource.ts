import { randomUUID } from 'node:crypto';
import {
  defaultResource,
  detectResources,
  envDetector,
  hostDetector,
  processDetector,
  resourceFromAttributes,
  type Resource,
} from '@opentelemetry/resources';
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_INSTANCE_ID,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

import type { TelemetryEnv } from './env';

const SERVICE_INSTANCE_ID = randomUUID();

export const buildResource = (env: TelemetryEnv): Resource =>
  defaultResource()
    .merge(
      resourceFromAttributes({
        [ATTR_SERVICE_NAME]: env.OTEL_SERVICE_NAME,
        [ATTR_SERVICE_VERSION]: env.OTEL_SERVICE_VERSION,
        [ATTR_SERVICE_INSTANCE_ID]: SERVICE_INSTANCE_ID,
        [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env.NODE_ENV,
      }),
    )
    .merge(
      detectResources({
        detectors: [envDetector, hostDetector, processDetector],
      }),
    );
