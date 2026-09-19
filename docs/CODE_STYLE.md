# Code style

Conventions to follow from now on in this repo. Each rule points at a real
file as example.

## File naming

- Classes: `PascalCase.<layer>.ts` — `src/auth/domain/factory/Token.factory.ts`, `src/auth/useCase/login/Login.useCase.ts`, `src/auth/infra/api/controller/login/Login.controller.ts`.
- Contracts/ports (`*.interface.ts`): camelCase — `src/auth/infra/adapter/database/database.adapter.interface.ts`, `src/auth/infra/gateway/database/database.gateway.interface.ts`, `src/auth/domain/repository/token.repository.interface.ts`.
- Tests: `*.unit.spec.ts` (no I/O) — `src/auth/domain/entity/token.unit.spec.ts` — and `*.integration.spec.ts` (real DI wiring over `DatabaseMemoryAdapter`) — `src/auth/useCase/login/Login.useCase.integration.spec.ts`.

## Naming: `I` prefix

`I` prefixes a port/contract an implementation is injected against, never a
DTO. `ITokenRepository`, `IDatabaseAdapter`, `IDatabaseGateway`, `IUserGateway`
(all in `src/auth/**/*.interface.ts`) vs. plain `InputLoginDto`/`OutputLoginDto`
in `src/auth/useCase/login/Login.dto.ts` — DTOs are plain `interface`s with no
prefix and no `class-validator` decorators.

## Layer boundaries

`domain → useCase → infra`, dependencies point inward only:

- `domain/` (e.g. `src/auth/domain/entity/Token.ts`) imports nothing from
  `@shared`, `@nestjs/*`, or any adapter — not even `@shared`'s own
  `IRepository<T>` (`src/auth/domain/repository/token.repository.interface.ts`
  is a standalone interface, it does not extend anything from `@shared`).
- `useCase/` depends only on `domain/` and the `gateway/*.interface.ts` type
  from `infra/` (e.g. `Login.useCase.ts` imports the `IDatabaseGateway` type
  from `@auth/infra/gateway/database/database.gateway.interface.js`, never the
  concrete `Database.gateway.ts`).
- `infra/` is the only layer where adapters, gateways, controllers, guards,
  strategies and `.proto` files live.

## DI: adapter → gateway → use case

String tokens are UPPER_SNAKE constants declared once in
`src/auth/utils/constants/injectNames.ts` (`DATABASE_ADAPTER`,
`DATABASE_GATEWAY`, `USER_ADAPTER`, `USER_GATEWAY`) and bound in
`src/auth/auth.module.ts` (`{ provide: TOKEN, useClass: Impl }`). Swapping an
implementation (e.g. Mongo for the in-memory adapter) is a one-line
`useClass` change there — never reference a concrete adapter class outside
its gateway.

## Use case shape

One `execute(input): Promise<output>` per use case, no other public method —
see any file under `src/auth/useCase/*/`. Depends only on `domain/` and the
gateway interface; never touches an adapter directly.

## Modules and imports (ESM)

`package.json` has `"type": "module"`; TypeScript is `nodenext`. Every
relative and path-alias import carries an explicit `.js` extension, even
though the source is `.ts`:

```ts
import { TokenFactory } from '@auth/domain/factory/Token.factory.js';
import { DATABASE_GATEWAY } from '@auth/utils/constants/index.js';
```

Aliases that resolve: `@auth/*`, `@shared/*`, `@exceptions/*` (=
`src/shared/modules/exceptions/*`), declared in `tsconfig.json`'s `paths`.
`@users`, `@tokens`, `@mail` are declared there too but point at directories
that don't exist — don't use them.

## Error handling

- `DomainError` (`src/auth/domain/error/DomainError.ts`) is the only error
  type `domain/` throws — see `Token.refresh()` in `Token.ts` and
  `TokenFactory.createTokenFromType` in `Token.factory.ts`.
- Everywhere else, throw via `ExceptionFactory`
  (`src/shared/modules/exceptions/factory/Exception.factory.ts`), which pairs
  a gRPC status with an HTTP status.
- Translation happens in exactly two places: `GlobalExceptionRestFilter`
  (`src/shared/infra/GlobalException.filter.ts`, REST, global) and
  `ExceptionFilterRpc` (`src/shared/infra/filter/ExceptionFilter.grpc.ts`,
  gRPC/RMQ, applied per-handler with `@UseFilters(new ExceptionFilterRpc())`).
  Both catch `DomainError` and convert it via
  `ExceptionFactory.invalidArgument(error.message)`.
- Error messages thrown from `useCase/` are asserted literally by tests (e.g.
  `'Invalid token'` in `Refresh.useCase.ts`/`VerifyToken.useCase.ts`) — keep
  the message identical if you touch either.

## Entity modeling

Private fields with `_` prefix and public getters, mutated only through
domain methods, never built with `new` outside `TokenFactory` — see
`src/auth/domain/entity/Token.ts` (`_revoked`, `revoke()`, `isValid()`) and
`src/auth/domain/factory/Token.factory.ts` (`createAccessToken`,
`createTokenFromType`).

## Tests

- Runner is Vitest (`vitest.config.ts`), not Jest.
- `describe('<what is under test>', () => { it('should <behavior>', ...) })`
  in English — see `token.unit.spec.ts` and `Login.useCase.integration.spec.ts`.
- Integration specs reset shared state with
  `DatabaseMemoryAdapter.reset(TOKENS_MOCK)` in `beforeEach` (it's a static
  array, stale rows leak across tests otherwise).

## Tooling

- `tsconfig.json`: `strictNullChecks: true`, `noImplicitAny: true`.
- `eslint.config.js` — flat config, ESM, `@typescript-eslint` + `eslint-plugin-prettier`.
- Prettier: `singleQuote: true`, `trailingComma: "all"` (`.prettierrc`).

## Commits

Conventional Commits, subject ≤ 80 chars, no body — enforced by
`commitlint.config.js` + `.husky/commit-msg`.
