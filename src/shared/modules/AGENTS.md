<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# modules

## Purpose
NestJS modules shared across bounded contexts: the domain exception type/factory, JWT signing services, and the RabbitMQ client wrapper.

## Key Files
| File | Description |
|------|--------------|
| `exceptions/entity/Exception.ts` | `Exception extends Error implements IException` — carries a paired `code` (gRPC) and `status` (HTTP) |
| `exceptions/entity/exception.interface.ts` | `IException` — `code`/`message`/`status` getters |
| `exceptions/factory/Exception.factory.ts` | `ExceptionFactory` — static builders (`notFound`, `conflict`, `invalidArgument`, `internal`, `unauthorized`, `forbidden`, `nonAcceptable`), each pairing a `@grpc/grpc-js` `status` code with a Nest `HttpStatus` |
| `jwt/Jwt.module.ts` | `CustomJwtModule` — wraps Nest's `JwtModule`, exports `JwtAccessService` + `JwtRefreshService`; imported by `auth.module.ts` |
| `jwt/JwtAccess.service.ts` | `JwtAccessService.sign`/`verify` — access tokens, secret/expiry from `TOKEN_SECRET('ACCESS_TOKEN')` / `TOKEN_EXPIRES_IN('ACCESS_TOKEN')` (default 86400000ms) |
| `jwt/JwtRefresh.service.ts` | `JwtRefreshService.sign`/`verify` — same shape for refresh tokens, keyed on `'REFRESH_TOKEN'` (default expiry 604800000ms) |
| `jwt/jwt.util.ts` | `getJwtSecret`/`getJwtExpiresIn` — read via `ConfigService`; fall back to `'secret'`/a default only when `NODE_ENV` is `development` or `test`, otherwise throw naming the missing variable |
| `rmq/rmq.module.ts` | `RmqModule.register(name)` — dynamic module registering a named RMQ client via `ClientsModule.registerAsync`, urls/queue from `RABBITMQ_URL`/`RABBITMQ_QUEUE(name)` |
| `rmq/rmq.service.ts` | `RmqService` — `getOptions(queue, noAck?)` for microservice bootstrap, plus `ack`/`nack` helpers over an `RmqContext`. Exports `getRequiredEnv`, which throws naming the variable if it's missing — no silent fallback for `RABBITMQ_URL`/`RABBITMQ_{AUTH,USER,MAIL}_QUEUE` |

## For AI Agents
### Working In This Directory
- `ExceptionFactory` is the only way domain/useCase code should construct an `Exception` — keeps the gRPC/HTTP status pairing consistent across transports (see `GlobalExceptionRestFilter` and `ExceptionFilterRpc` in `../infra/AGENTS.md`).
- JWT secret/expiry env vars are read in milliseconds via `TOKEN_SECRET`/`TOKEN_EXPIRES_IN` from `@shared/utils/constants` — see CLAUDE.md's Environment section.

### Testing Requirements
- `exceptions/` has unit specs (`*.unit.spec.ts`) covering the entity and factory. `jwt/jwt.util.unit.spec.ts` covers the fail-fast/fallback branches of `getJwtSecret`/`getJwtExpiresIn`; `rmq/rmq.service.unit.spec.ts` covers `getRequiredEnv`. The `JwtAccessService`/`JwtRefreshService`/`RmqModule` classes themselves have no specs of their own; they're exercised indirectly through the `auth` module's integration/e2e suites.

## Dependencies
### Internal
- `exceptions/` imported via the `@exceptions/*` alias; `jwt/`/`rmq/` consumed via `@shared/modules/jwt` and `@shared/modules/rmq`.
### External
- `@grpc/grpc-js`, `@nestjs/common`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/microservices`, `rxjs`.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
