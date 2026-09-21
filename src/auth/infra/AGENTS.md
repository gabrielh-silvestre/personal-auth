<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# infra

## Purpose
The only layer where storage/transport implementations are visible — adapters, gateways, HTTP/gRPC/RMQ controllers, Passport strategies and proto files. Use cases only ever see the `gateway/` interfaces; swapping `DATABASE_ADAPTER`/`USER_ADAPTER` implementation is a one-line change in `auth.module.ts` (`useClass`). Transport wiring (REST/gRPC/RMQ) is documented in [CLAUDE.md](../../../../CLAUDE.md).

## Key Files
### adapter/database
| File | Description |
|------|-------------|
| `database.adapter.interface.ts` | `IDatabaseAdapter`: `findOne<T>`, `create`, `update`. Deliberately narrower than a generic CRUD port — `findAll`/`delete` were in the contract with no caller anywhere and were removed; add a method here only when a gateway actually calls it |
| `memory/DatabaseMemory.adapter.ts` | In-process array-backed adapter; static `TOKENS` shared across instances, `reset()` for tests. `create` matches existing rows by `userId` only |
| `memory/DatabaseMemory.adapter.unit.spec.ts` | Unit spec exercising the three contract methods against `TOKENS_MOCK` |
| `mongoose/DatabaseMongoose.adapter.ts` | Maps `Token` ↔ `TokenDocument`. `create` checks for an existing `userId` + `type` composite before inserting (falls back to `update`) — **differs from the memory adapter's userId-only match** |
| `mongoose/MongooseSchema.ts` | `TokenSchema` (`@Schema`/`@Prop`) mirrors `IToken`; exports `tokenSchema` for `MongooseModule.forFeature` |

### adapter/user
| File | Description |
|------|-------------|
| `user.adapter.interface.ts` | `IUserAdapter.send<T>(data, pattern): Observable<OutputUser>` |
| `rmq/UserRmq.adapter.ts` | Wraps a `ClientProxy` (`@Inject('USER')`) to call the external user service over RMQ |

### gateway
| File | Description |
|------|-------------|
| `database/Database.gateway.ts` | Implements `ITokenRepository` (`find`, `findByUserIdAndType`, `create`, `update`) by delegating to the injected `IDatabaseAdapter` (`DATABASE_ADAPTER` token). There is no `IDatabaseGateway` alias — it was a second name for `ITokenRepository` and was removed; consumers import the domain interface directly |
| `user/user.gateway.interface.ts` | `IUserGateway.verifyCredentials(email, password): Promise<OutputUser>` |
| `user/User.gateway.ts` | Implements it by calling `IUserAdapter.send(..., 'verify_user_credentials')` via `lastValueFrom` |

### api/controller
One folder per use case (`login/`, `refresh/`, `revokeToken/`, `verifyToken/`), each with a `.controller.ts` + `.controller.integration.spec.ts`. All inject the matching use case directly (no extra service layer) and sign JWTs via `JwtAccessService`/`JwtRefreshService` after `execute()` returns.

Every controller follows the same shape: a `private handle()` holding the logic, and one public method per transport (`handleRest`/`handleGrpc`/`handleRmq`) carrying the decorators and delegating to it. Specs enter through the public transport method — `handle` is not reachable from outside, by design.

| File | Description |
|------|-------------|
| `login/Login.controller.ts` | REST (`POST /auth/login`) + gRPC (`AuthService.LoginUser`), both behind `CredentialsGuard`; signs access + refresh JWTs |
| `refresh/Refresh.controller.ts` | REST (`GET /auth/refresh`) + gRPC (`AuthService.RefreshToken`), behind `RefreshTokenGuard` |
| `revokeToken/RevokeToken.controller.ts` | RMQ only (`auth.revoke_token`), behind `AuthenticateGuard` |
| `verifyToken/VerifyToken.controller.ts` | RMQ only (`auth.verify_token`), behind `AuthenticateGuard` |

### api/guard
| File | Description |
|------|-------------|
| `createAuthGuard.guard.ts` | `createAuthGuard<T>(strategy)` — returns an `AuthGuard(strategy)` subclass whose `handleRequest` throws `ExceptionFactory.forbidden` on `err`/`info` instead of Passport's default 401. The single home of that behaviour |
| `Authenticate.guard.ts` | `createAuthGuard<TokenPayloadDto>('access-token')` |
| `RefreshToken.guard.ts` | `createAuthGuard('refresh-token')` |
| `CredentialsGuard.guard.ts` | `AuthGuard('local')`; overrides `canActivate` to copy the RPC payload (`email`/`password`) into `request.body` before delegating, so the same Passport local strategy serves REST, gRPC and RMQ. Does not use `createAuthGuard` — its `handleRequest` branches on `!user`, not on `info` |

### proto / strategy
| File | Description |
|------|-------------|
| `proto/auth.proto` | `AuthService` (`LoginUser`, `RefreshToken`) — backs the gRPC handlers in `login/` and `refresh/` controllers |
| `strategy/Jwt.access-token.strategy.ts` | Passport `'access-token'`; extracts JWT from `req.token` (gRPC bridge), `cookies.Access`, or bearer header |
| `strategy/Jwt.refresh-token.strategy.ts` | Passport `'refresh-token'`; same gRPC bridge + `cookies.Refresh` |
| `strategy/JwtPayload.dto.ts` | `TokenPayloadDto` (`userId`, `tokenId`) — shared payload shape for both JWT strategies |
| `strategy/Local.strategy.ts` | Passport local strategy; calls `IUserGateway.verifyCredentials`. Logs the original cause, then re-throws an `Exception` as-is (the gateway only builds one for a user-service timeout, so it is the infra signal) and converts anything else to `forbidden('Invalid credentials')`. An outage must not read as a wrong password |

## For AI Agents
### Working In This Directory
- Never let a use case import from here directly — only `gateway/*.interface.ts` types cross into `useCase/`.
- The in-memory vs. Mongoose adapters have **different `create` matching semantics** (userId-only vs. userId+type) — a change that works against `DatabaseMemoryAdapter` in tests may behave differently against Mongoose in production.
- `ParseHalJsonInterceptor` (used in `login`/`refresh` REST handlers) is applied per-route with `new ParseHalJsonInterceptor()` — do not move it to a global interceptor, it breaks gRPC/RMQ payloads.
- `CredentialsGuard`'s gRPC→HTTP body bridge is load-bearing for `Local.strategy.ts` to work over gRPC; don't remove it when touching login.

### Testing Requirements
- Controller specs build a real Nest `Test.createTestingModule` with `DatabaseMemoryAdapter` + `DatabaseGateway` wired to the real `DATABASE_ADAPTER`/`DATABASE_GATEWAY` tokens, and stub only the JWT services (`useValue` with `vi.fn()`).
- Reset shared state per test with `DatabaseMemoryAdapter.reset(TOKENS_MOCK)` in `beforeEach` — it's a static array, stale data leaks across tests otherwise.
- `reset()` restores the array, **not the objects in it**: it re-pushes the same `Token` references from `TOKENS_MOCK`. A test that calls `TOKEN.revoke()` (or any mutator) on a mock token poisons every later test in the run. Build a local `Token` for a test that needs a specific state instead of mutating the shared mock.

### Common Patterns
- Guards throw `ExceptionFactory.forbidden(err?.message || info?.message)` from `handleRequest`, never the Passport default. A new JWT-style guard should extend `createAuthGuard(strategy)` rather than copy that method again.
- Every RPC handler (gRPC/RMQ) needs its own `@UseFilters(new ExceptionFilterRpc())`; the global filter only covers REST. Decorator order relative to `@UseGuards` varies across controllers today.

## Dependencies
### Internal
- `#auth/domain/*` (via `TokenFactory`, `Token`, `ITokenRepository`) and `#auth/useCase/*` (controllers only).
- `#auth/utils/constants` for all DI tokens (`DATABASE_ADAPTER`, `DATABASE_GATEWAY`, `USER_ADAPTER`, `USER_GATEWAY`).
- `#shared/modules/jwt/*` (sign/verify), `#shared/infra/filter/ExceptionFilter.grpc`, `#shared/infra/interceptor/Parse.hal-json.interceptor`, `#exceptions/factory/Exception.factory`.

### External
- `@nestjs/common`, `@nestjs/microservices`, `@nestjs/mongoose`, `@nestjs/passport`, `@nestjs/config`.
- `mongoose`, `passport-jwt`, `passport-local`, `rxjs`.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
