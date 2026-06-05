// Permanent ESLint fixture: each import below MUST trigger
// `no-restricted-imports`. CI runs `npm run lint:eslint-fixtures` and
// asserts both rule violations fire. Do NOT remove the imports.

// 1) Importing @opentelemetry/* from outside src/shared/modules/telemetry/.
import { trace } from '@opentelemetry/api';

// 2) Importing the preload entrypoint from a non-preload caller.
// (Target may not exist on disk yet; the rule matches on the import string.)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as preload from '../../src/shared/modules/telemetry/instrumentation';

export const __fixtureRefs = [typeof trace, typeof preload];
