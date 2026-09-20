# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev          # watch mode
docker-compose up          # NestJS + MongoDB 7 + RabbitMQ 3.13 (ports: $PORT, 50051 gRPC, 27017, 5672/15672)
npm run build
npm run lint               # eslint --fix
npm run format

npm run test:unit          # *.unit.spec.ts
npm run test:integration   # *.integration.spec.ts
npm run test:all           # everything under src/ and test/ (test/jest-all.config.js)
npm run test:e2e           # *.e2e-spec.ts (test/jest-e2e.config.js)
npm run test:cov           # coverage of src/auth/** only, feeds SonarCloud via jest-sonar-reporter
npm run test:mutations     # Stryker incremental; mutates only domain/ and useCase/

npx jest path/to/file.spec.ts --no-coverage   # single file
```

CI: `.github/workflows/main.yml` runs `test:cov` + SonarCloud on PRs to `main`; `pullRequest.yml` runs `npm run test` on PRs to `dev`.

## Branches

**Never work on `main` directly.** `dev` is the integration branch; feature branches
branch off `dev` and merge back into it through a PR. `main` receives only merges
from `dev`.

Three layers enforce this, and each fails differently:

- `.claude/hooks/no-main-edits.cjs` (wired in `.claude/settings.json`) refuses
  `Edit`/`Write`/`NotebookEdit` and `git commit` while the active worktree is on
  `main`. Paths under `.omc/` and `.ignore/` pass — they are git-ignored.
- `.husky/pre-commit` rejects any commit made on `main`, including from the
  terminal. `git commit --no-verify` is the deliberate escape hatch.
- GitHub branch protection on `main` blocks direct pushes.

Worktrees and branches go through Worktrunk: `wt switch -c <name> -b dev`.

Releases follow full Git Flow (`release/<nome>` off `dev`, `hotfix/x.y.z` off
`main`), with the version read from `package.json` and the tag derived from it.
The step-by-step lives in [docs/RELEASE.md](./docs/RELEASE.md).

## What the service is

Token issuer for a microservice system. It does **not** own users: credentials are checked by an external user service over RabbitMQ (`verify_user_credentials` on the `USER` queue, via `UserRmqAdapter` → `UserGateway` → `LocalStrategy`).

Tokens are persisted (Mongo) as `Token` aggregates; the signed JWT only carries `{ tokenId, userId }`. Validity (expiry, `revoked`) lives in the stored entity, not only in the JWT.

## Architecture

`src/auth` is split in three layers, dependencies pointing inward:

- `domain/` — `Token` entity (`isValid()`, `refresh()`), `TokenFactory`, `ITokenRepository`. No Nest imports.
- `useCase/` — `login`, `refresh`, `verifyToken`, `generateToken`; each exposes `execute(input)` and depends only on `DATABASE_GATEWAY`.
- `infra/` — adapters, gateways, controllers, guards, Passport strategies, `.proto` files.

DI chain is **adapter → gateway → use case**, wired with string tokens from `src/auth/utils/constants/injectNames.ts` (`DATABASE_*`, `USER_*`). Swap storage/transport by changing `useClass` in `src/auth/auth.module.ts`. `TOKEN_ADAPTER`/`TOKEN_GATEWAY` are declared but unused.

`src/shared` holds cross-cutting pieces: `ExceptionFactory` (each error carries a gRPC status + HTTP status pair), `JwtAccessService`/`JwtRefreshService`, `RmqModule.register(name)`, REST/RPC exception filters, `ParseHalJsonInterceptor`.

Path aliases that resolve: `@auth/*`, `@shared/*`, `@exceptions/*` (= `src/shared/modules/exceptions/*`). `@users`, `@tokens`, `@mail` in `tsconfig.json` point to directories that don't exist.

## Transports

`src/main.ts` runs one Nest app with REST + an RMQ microservice (`AUTH` queue) + a gRPC microservice (`proto.tokens`, `proto.auth`, default `localhost:50051`). Each controller exposes its use case only on some transports:

| Use case | REST | gRPC | RMQ pattern |
|---|---|---|---|
| login | `POST /auth/login` | `AuthService.LoginUser` | — |
| refresh | `GET /auth/refresh` | `AuthService.RefreshToken` | — |
| verifyToken | — | — | `auth.verify_token` |
| generateToken (recover password) | — | — | `auth.generate_recover_token` |

`token.proto` declares `TokenService.RevokeToken`, but nothing implements it.

To add a transport, add another handler method on the same controller that calls the shared private `handle()`.

Transport glue you must preserve:

- `CredentialsGuard` copies gRPC `{ email, password }` into the HTTP request body so `passport-local` works for gRPC.
- JWT strategies extract the token from, in order: `req.token` (gRPC), cookie `Access`/`Refresh`, Bearer header (access only).
- `GlobalExceptionRestFilter` is global (REST). RPC handlers need `@UseFilters(new ExceptionFilterRpc())` per method.
- `ParseHalJsonInterceptor` wraps REST responses in `{ _links, data }`; apply per REST route only, never globally (it would wrap gRPC/RMQ replies).

## Token behavior

- One token per `userId + type` in Mongo: `DatabaseMongooseAdapter.create` upserts on that pair, so a new login replaces the previous session.
- Refresh is non-rotational: it looks up the user's `REFRESH` token, calls `refresh()` (same id, new `lastRefresh`), and issues a new access token.
- **Two independent expiry configs:** JWT signing reads `JWT_{ACCESS,REFRESH}_TOKEN_{SECRET,EXPIRES_IN}`; the persisted entity reads `ACCESS_TOKEN_EXPIRE_TIME`, `REFRESH_TOKEN_EXPIRE_TIME`, `RECOVER_PASSWORD_TOKEN_EXPIRE_TIME` in `TokenFactory` (default 1d/7d/1d). All in ms.
- RMQ queue names come from `RABBITMQ_{AUTH,USER,MAIL}_QUEUE` (`RABBITMQ_QUEUE(name)`); these are not in `.env.example`.

## Tests

- Integration specs (use cases and controllers) build a `Test.createTestingModule` with `DatabaseMemoryAdapter` + real `DatabaseGateway`, reset state with `DatabaseMemoryAdapter.reset(TOKENS_MOCK)`, and stub JWT services with `useValue`.
- `DatabaseMemoryAdapter` stores tokens in a **static** array and its `create` matches on `userId` only (Mongo uses `userId + type`). Login's access and refresh tokens overwrite each other in memory, so don't use the memory adapter to assert Mongo semantics.
- E2E suites under `test/` are mostly commented out.

## GitNexus

Indexed as `personal-auth`. Before editing a symbol run `gitnexus_impact({target, direction: "upstream"})` and report HIGH/CRITICAL risk; treat `risk: UNKNOWN` as unresolved, not safe. Run `gitnexus_detect_changes()` before committing. Reindex with `npx gitnexus analyze --index-only`; without `--index-only` it re-injects its own block into `CLAUDE.md`/`AGENTS.md`.
