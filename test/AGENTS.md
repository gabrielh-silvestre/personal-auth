<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# test

## Purpose
E2E suites, run by Vitest via the root `vitest.config.ts` (`include: ['{src,test}/**/*.{spec,e2e-spec}.ts']`). General conventions in [CLAUDE.md](../CLAUDE.md).

## Key Files
| File | Description |
|------|-------------|
| `app.e2e-spec.ts` | Placeholder — `expect(true).toBe(true)`, no app bootstrap. |
| `rest/app.rest.e2e-spec.ts` | Only one active assertion (`expect(true).toBeTruthy()`); the real REST e2e suite (login flow) is entirely commented out. |

## For AI Agents
### Working In This Directory
- No e2e test currently bootstraps the app — both `.e2e-spec.ts` files are stubs, despite `CLAUDE.md`'s testing conventions describing a full-bootstrap pattern.
- The commented-out block in `rest/app.rest.e2e-spec.ts` is the template for a real REST e2e test: `Test.createTestingModule({ imports: [AppModule] })`, override the `MAIL_SERVICE` and `USER_SERVICE` providers with `vi.fn()` mocks, `app.useGlobalFilters(new GlobalExceptionRestFilter())`, then drive it with `supertest` via `app.getHttpServer()`.
- `src/main.ts` additionally calls `app.use(cookieParser())` and `app.connectMicroservice(...)` twice (the `AUTH` RMQ queue, and gRPC with `token.proto`/`auth.proto`) before `listen()` — none of that is mirrored in the commented template. A real e2e exercising RMQ/gRPC transports needs to add `cookie-parser` and the matching `connectMicroservice` calls before `app.init()`.

### Testing Requirements
- Coverage is collected only from `src/auth/**` (set in `vitest.config.ts`'s `coverage.include`), so files under `test/` never affect coverage numbers themselves.

## Dependencies
### External
- `supertest` (referenced, currently only inside commented-out code)
- `vitest-sonar-reporter` (via root `vitest.config.ts`, feeds `test:cov`)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
