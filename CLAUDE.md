# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev
npm run start:dev          # watch mode
docker-compose up          # full local stack (NestJS + MongoDB + RabbitMQ)

# Build
npm run build

# Lint / Format
npm run lint
npm run format

# Tests
npm run test:unit          # *.unit.spec.ts
npm run test:integration   # *.integration.spec.ts
npm run test:all           # unit + integration + e2e
npm run test:e2e           # REST e2e via supertest
npm run test:cov           # coverage (feeds SonarCloud)
npm run test:mutations     # Stryker incremental mutation testing
```

To run a single test file: `npx jest path/to/file.spec.ts --no-coverage`

## Architecture

Clean / Hexagonal architecture in three strict layers:

```
domain  →  useCase  →  infra
```

- **`domain/`** — Pure TypeScript. `Token` aggregate, `TokenFactory` (static, env-driven expiry), `ITokenRepository` interface. Zero framework imports.
- **`useCase/`** — Orchestration. `login`, `refresh`, `verifyToken`, `generateToken`. Each has `execute(input): Promise<output>`. Depends only on gateway interfaces and domain.
- **`infra/`** — Adapters (memory + Mongoose), gateways, HTTP/gRPC/RMQ controllers, Passport strategies, proto files.

The mandatory DI chain is: **adapter → gateway → use case**. Use cases never import adapters. Gateways are the only seam where the storage/transport implementation is visible.

## Triple Transport

`src/main.ts` wires three transports on a single Nest app:

| Transport | Binding |
|-----------|---------|
| REST (HTTP) | Express, `@Post` controllers |
| gRPC | `token.proto` + `auth.proto` via `@GrpcMethod` |
| RabbitMQ | `AUTH` queue via `@MessagePattern` |

A single controller class exposes the **same use case** through all three transports. Adding a new transport for an existing use case means extending the controller — not the use case.

## Dependency Injection Tokens

String tokens are declared in `src/auth/utils/constants/injectNames.ts`:

- `DATABASE_ADAPTER` / `DATABASE_GATEWAY`
- `USER_ADAPTER` / `USER_GATEWAY`

Always use these constants with `@Inject(TOKEN)`. Swap implementations by changing `useClass` in `auth.module.ts` only.

## Path Aliases

| Alias | Resolves to |
|-------|-------------|
| `@auth/*` | `src/auth/*` |
| `@shared/*` | `src/shared/*` |
| `@exceptions/*` | `src/shared/modules/exceptions/*` |

## Exception Handling

Domain errors are created via `ExceptionFactory` and carry paired gRPC/HTTP status codes. Two separate filters normalize them per transport:

- `GlobalExceptionRestFilter` — registered globally in `main.ts` for REST.
- `ExceptionFilterRpc` — applied per-handler via `@UseFilters(new ExceptionFilterRpc())` on gRPC/RMQ methods.

**Decorator order is critical on RPC handlers**: `@UseFilters` must wrap `@UseGuards` — reversing them bypasses exception handling.

## Key Patterns

- `ParseHalJsonInterceptor` is per-route only — never register globally (breaks gRPC/RMQ).
- `CredentialsGuard` bridges gRPC credentials into HTTP format for Passport local strategy — do not remove.
- Token refresh reuses the same token ID (non-rotational), extending expiry to preserve session continuity.
- `TokenFactory` uses a `switch` on `TokenType` for extension; expiry windows come from env vars (milliseconds).
- In-memory adapter matches on `userId` only; Mongoose adapter uses `userId + type` composite — behavior differs, test migrations carefully.

## Testing Conventions

- Unit tests: `*.unit.spec.ts` — no I/O, no mocks beyond Jest.
- Integration tests: `*.useCase.integration.spec.ts` — wire `DatabaseGateway` against `DatabaseMemoryAdapter`.
- E2E tests: bootstrap full `AppModule` with `cookie-parser` and `GlobalExceptionRestFilter` active; mirror `connectMicroservice` calls from `main.ts` when testing gRPC/RMQ transports.

## Environment

Copy `.env.example` to `.env`. Key variables: `PORT`, `MONGO_URI`, `RABBITMQ_URL`, JWT secret/expiry pairs per token type (access, refresh, recover-password) in milliseconds.
