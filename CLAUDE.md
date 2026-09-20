# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Code conventions (naming, layer boundaries, DI, error handling, tests, tooling) live in [docs/CODE_STYLE.md](docs/CODE_STYLE.md) — read it before writing or reviewing code.

## Stack

NestJS 12, TypeScript 6, Node 22 (`.nvmrc`, `engines.node >=22`). ESM
throughout: `package.json` has `"type": "module"`, `tsconfig.json` targets
`nodenext`, every import goes through a Node subpath import (no relative
imports, no `.js`/`.ts` extension) — see Architecture below.
`tsconfig.json` has `strictNullChecks: true` and `noImplicitAny: true`.
Tests run on Vitest (`vitest.config.ts`), not Jest.

## Commands

```bash
npm run start:dev          # watch mode
docker-compose up          # NestJS + MongoDB 7 + RabbitMQ 3.13 (ports: $PORT, 50051 gRPC, 27017, 5672/15672)
npm run build
npm run lint               # eslint --fix (flat config, eslint.config.js)
npm run format

npm run test:unit          # *.unit.spec.ts
npm run test:integration   # *.integration.spec.ts
npm run test:all           # everything under src/ and test/ (vitest.config.ts)
npm run test:e2e           # *.e2e-spec.ts
npm run test:cov           # coverage of src/auth/** only, feeds SonarCloud via vitest-sonar-reporter
npm run test:mutations     # Stryker incremental; mutates only domain/ and useCase/

npx vitest run path/to/file.spec.ts --no-coverage   # single file
```

CI: `.github/workflows/main.yml` is the only workflow — on PRs to `main` it runs `test:cov`, then a build + boot smoke check, on Node 22 via `actions/setup-node@v5`. The SonarCloud step is commented out until the `SONAR_TOKEN` is rotated. Commit messages are enforced by commitlint (`commitlint.config.js` + `.husky/commit-msg`): Conventional Commits, subject ≤ 80 chars, no body.

## What the service is

Token issuer for a microservice system. It does **not** own users: credentials are checked by an external user service over RabbitMQ (`verify_user_credentials` on the `USER` queue, via `UserRmqAdapter` → `UserGateway` → `LocalStrategy`).

Tokens are persisted (Mongo) as `Token` aggregates; the signed JWT only carries `{ tokenId, userId }`. Validity (expiry, `revoked`) lives in the stored entity, not only in the JWT.

## Architecture

`src/auth` is split in three layers, dependencies pointing inward:

- `domain/` — `Token` entity (`isValid()`, `refresh()`), `TokenFactory`, `ITokenRepository`. No framework imports, no `@shared` imports either: `ITokenRepository` is a standalone interface that extends nothing. Throws `DomainError` (`src/auth/domain/error/DomainError.ts`) on invalid state, never `ExceptionFactory`.
- `useCase/` — `login`, `refresh`, `verifyToken`, `generateToken`; each exposes `execute(input)` and depends only on `DATABASE_GATEWAY`.
- `infra/` — adapters, gateways, controllers, guards, Passport strategies, `.proto` files. The three interface files here are camelCase: `database.adapter.interface.ts`, `user.adapter.interface.ts`, `database.gateway.interface.ts`.

DI chain is **adapter → gateway → use case**, wired with string tokens from `src/auth/utils/constants/injectNames.ts` (`DATABASE_*`, `USER_*`). Swap storage/transport by changing `useClass` in `src/auth/auth.module.ts`.

`src/shared` holds cross-cutting pieces: `ExceptionFactory` (each error carries a gRPC status + HTTP status pair), `JwtAccessService`/`JwtRefreshService`, `RmqModule.register(name)`, REST/RPC exception filters, `ParseHalJsonInterceptor`. `RmqService`'s `getRequiredEnv` and `jwt.util.ts`'s `getJwtSecret`/`getJwtExpiresIn` throw at boot naming the missing variable when `NODE_ENV` is not `development`/`test` — no silent fallback outside those two envs.

Imports are Node subpath imports, no extension, no relative paths: `#app/*` (files directly under `src/`), `#auth/*`, `#shared/*`, `#exceptions/*` (= `src/shared/modules/exceptions/*`). The mapping lives in `package.json`'s `imports`, condition-split per namespace: `development` → `./src/**/*.ts` (picked by tsc via `customConditions: ["development"]` and by Vitest via `resolve: { conditions: ['development'] }`), `default` → `./dist/**/*.js` (what Node resolves at runtime, no flag needed). tsc does not rewrite the specifiers; Node's resolver does. There used to be tsconfig `paths` aliases (`@auth/*`, `@shared/*`, `@exceptions/*`, plus three phantom ones pointing at non-existent directories) — those are gone.

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
- `GlobalExceptionRestFilter` is global (REST). RPC handlers need `@UseFilters(new ExceptionFilterRpc())` per method. Both filters translate a `DomainError` thrown from `domain/` into `ExceptionFactory.invalidArgument(error.message)` — that's the only place `DomainError` crosses into `Exception`.
- `ParseHalJsonInterceptor` wraps REST responses in `{ _links, data }`; apply per REST route only, never globally (it would wrap gRPC/RMQ replies).

## Token behavior

- One token per `userId + type` in Mongo: `DatabaseMongooseAdapter.create` upserts on that pair, so a new login replaces the previous session.
- Refresh is non-rotational: it looks up the user's `REFRESH` token, calls `refresh()` (same id, new `lastRefresh`), and issues a new access token.
- **Two independent expiry configs:** JWT signing reads `JWT_{ACCESS,REFRESH}_TOKEN_{SECRET,EXPIRES_IN}`; the persisted entity reads `ACCESS_TOKEN_EXPIRE_TIME`, `REFRESH_TOKEN_EXPIRE_TIME`, `RECOVER_PASSWORD_TOKEN_EXPIRE_TIME` in `TokenFactory` (default 1d/7d/1d). All in ms.
- RMQ queue names come from `RABBITMQ_{AUTH,USER,MAIL}_QUEUE` (`RABBITMQ_QUEUE(name)`), listed with comments in `.env.example`.

## Tests

- Integration specs all wire `DatabaseMemoryAdapter` + real `DatabaseGateway` and reset state with `DatabaseMemoryAdapter.reset(TOKENS_MOCK)`. Use-case specs construct the classes directly (`new DatabaseGateway(new DatabaseMemoryAdapter())`); controller specs go through `Test.createTestingModule` and stub the JWT services with `useValue`.
- `DatabaseMemoryAdapter` stores tokens in a **static** array and its `create` matches on `userId` only (Mongo uses `userId + type`). Login's access and refresh tokens overwrite each other in memory, so don't use the memory adapter to assert Mongo semantics.
- E2E suites under `test/` are mostly commented out.

## GitNexus

Indexed as `personal-auth`. Before editing a symbol run `gitnexus_impact({target, direction: "upstream"})` and report HIGH/CRITICAL risk; treat `risk: UNKNOWN` as unresolved, not safe. Run `gitnexus_detect_changes()` before committing. Reindex with `npx gitnexus analyze --index-only`; without `--index-only` it re-injects its own block into `CLAUDE.md`/`AGENTS.md`.
