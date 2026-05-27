# Telemetry (OpenTelemetry facade)

This module wires OpenTelemetry into `personal-auth` via a static `Telemetry` facade. Read the five-sentence contract below before adding anything new here.

1. The facade is intentionally **static** — there is no Nest DI involvement so existing tests do not need to register a new module to keep passing.
2. Every facade method is a **no-op** when `trace.getActiveSpan()` returns `undefined` or no global provider has been registered, which keeps `Jest` runs byte-identical to today.
3. Existing tests do **not** preload `instrumentation.ts`, so they observe the no-op path automatically.
4. To opt a test into telemetry, register a `BasicTracerProvider` + `InMemorySpanExporter` in `beforeAll` (see `telemetry-pipeline.integration.spec.ts`).
5. Production preload registers globals exactly once at process boot (`node -r .../instrumentation.js dist/src/main`) and shuts them down through the Nest `beforeApplicationShutdown` lifecycle hook.

> See `.omc/plans/otel-observability-plan.md` for the architectural rationale and `.env.example` for the runtime knobs.
