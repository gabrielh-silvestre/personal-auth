<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# infra

## Purpose
Transport-facing adapters shared across the app: the global REST exception filter, the gRPC/RMQ exception filter, the HAL-JSON response interceptor, and its response types.

## Key Files
| File | Description |
|------|--------------|
| `GlobalException.filter.ts` | `GlobalExceptionRestFilter` (`@Catch(Error)`) — registered globally in `main.ts`; normalizes any `Error`/`HttpException`/domain error into `Exception` (an error matching `isDomainError` becomes `ExceptionFactory[error.domainErrorKind]`) and writes `{ statusCode, message, path }` for HTTP requests only (`requestType === 'http'`) |
| `filter/ExceptionFilter.grpc.ts` | `ExceptionFilterRpc` (`@Catch()`, extends `BaseRpcExceptionFilter`) — an error matching `isDomainError` is converted via `ExceptionFactory[error.domainErrorKind]`, an `Exception` re-thrown unchanged, any other error delegated to `super.catch()` so Nest sanitizes and logs it instead of leaking it to the client; applied per-handler with `@UseFilters(new ExceptionFilterRpc())` on the gRPC/RMQ controllers in `src/auth/infra/api/controller/*` |
| `interceptor/Parse.hal-json.interceptor.ts` | `ParseHalJsonInterceptor<T>` — wraps a REST handler's response in a HAL `{ _links: { self: { href } }, data }` envelope; used per-route (`login`, `refresh` controllers), never registered globally |
| `rest/Response.type.ts` | `ResponseLinkSection`, `RestResponseCreateUser<T>` — the HAL envelope types consumed by `Parse.hal-json.interceptor.ts` |
| `GlobalException.filter.unit.spec.ts`, `filter/ExceptionFilter.grpc.unit.spec.ts` | Unit specs for both filters, including the domain-error translation. Both use a local stub class satisfying `DomainErrorLike` instead of importing the concrete error from `src/auth` |

## For AI Agents
### Working In This Directory
- `ParseHalJsonInterceptor` must stay per-route (`@UseInterceptors`) — global registration breaks gRPC/RMQ responses (see CLAUDE.md's Transports section).
- On RPC handlers, `@UseFilters` must wrap `@UseGuards`, or exception handling is bypassed.

## Dependencies
### Internal
- `GlobalException.filter.ts` and `filter/ExceptionFilter.grpc.ts` both import `Exception`/`ExceptionFactory` from `../modules/exceptions` (see [../modules/AGENTS.md](../modules/AGENTS.md)) via the `#exceptions/*` subpath import, and `isDomainError` from `#shared/domain/error/domainError`.
- Neither filter imports from `src/auth`. A domain error is recognised structurally, by the `domainErrorKind` marker the `DomainErrorLike` contract defines, so `src/shared` never depends on a bounded context's concrete error class. Keep it that way: recognise a new error kind by adding it to `DOMAIN_ERROR_KINDS`, never by importing the class and testing `instanceof`.
### External
- `@nestjs/common`, `express` (`Response` type), `rxjs`.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
