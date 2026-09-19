<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# test

## Purpose
E2E suites and Jest configs. General conventions in [CLAUDE.md](../CLAUDE.md#testing-conventions).

## Key Files
| File | Description |
|------|-------------|
| `jest-all.config.js` | Extends root `jest.config.js`; testRegex matches `*.spec.ts`/`*.e2e-spec.ts` under both `test/` and `src/`; ignores `src/@types`, `src/main.ts`. Backs `test:all` and `test:cov`. |
| `jest-e2e.config.js` | Extends root `jest.config.js`; testRegex matches only `*.e2e-spec.ts`. Backs `test:e2e`. |
| `app.e2e-spec.ts` | Placeholder — `expect(true).toBe(true)`, no app bootstrap. |
| `rest/app.rest.e2e-spec.ts` | Only one active assertion (`expect(true).toBeTruthy()`); the real REST e2e suite (login flow) is entirely commented out. |

## For AI Agents
### Working In This Directory
- No e2e test currently bootstraps the app — both `.e2e-spec.ts` files are stubs, despite `CLAUDE.md`'s testing conventions describing a full-bootstrap pattern.
- The commented-out block in `rest/app.rest.e2e-spec.ts` is the template for a real REST e2e test: `Test.createTestingModule({ imports: [AppModule] })`, override the `MAIL_SERVICE` and `USER_SERVICE` providers with jest mocks, `app.useGlobalFilters(new GlobalExceptionRestFilter())`, then drive it with `supertest` via `app.getHttpServer()`.
- `src/main.ts` additionally calls `app.use(cookieParser())` and `app.connectMicroservice(...)` twice (the `AUTH` RMQ queue, and gRPC with `token.proto`/`auth.proto`) before `listen()` — none of that is mirrored in the commented template. A real e2e exercising RMQ/gRPC transports needs to add `cookie-parser` and the matching `connectMicroservice` calls before `app.init()`.

### Testing Requirements
- Coverage is collected only from `src/auth/**` (set in the root `jest.config.js`), so files under `test/` never affect coverage numbers themselves.

## Dependencies
### External
- `supertest` (referenced, currently only inside commented-out code)
- `jest-sonar-reporter` (via root config, feeds `test:cov`)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
