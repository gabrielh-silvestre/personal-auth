<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# infra

## Purpose
Transport-facing adapters shared across the app: the global REST exception filter, the gRPC/RMQ exception filter, the HAL-JSON response interceptor, and its response types.

## Key Files
| File | Description |
|------|--------------|
| `GlobalException.filter.ts` | `GlobalExceptionRestFilter` (`@Catch(Error)`) — registered globally in `main.ts`; normalizes any `Error`/`HttpException`/`DomainError` into `Exception` (a `DomainError` becomes `ExceptionFactory.invalidArgument`) and writes `{ statusCode, message, path }` for HTTP requests only (`requestType === 'http'`) |
| `filter/ExceptionFilter.grpc.ts` | `ExceptionFilterRpc` (`@Catch(Exception, DomainError)`) — re-throws `Exception` as an RxJS error, converting a caught `DomainError` to `ExceptionFactory.invalidArgument` first; applied per-handler with `@UseFilters(new ExceptionFilterRpc())` on the gRPC/RMQ controllers in `src/auth/infra/api/controller/*` |
| `interceptor/Parse.hal-json.interceptor.ts` | `ParseHalJsonInterceptor<T>` — wraps a REST handler's response in a HAL `{ _links: { self: { href } }, data }` envelope; used per-route (`login`, `refresh` controllers), never registered globally |
| `rest/Response.type.ts` | `ResponseLinkSection`, `RestResponseCreateUser<T>` — the HAL envelope types consumed by `Parse.hal-json.interceptor.ts` |
| `GlobalException.filter.unit.spec.ts`, `filter/ExceptionFilter.grpc.unit.spec.ts` | Unit specs for both filters, including the `DomainError` → `invalidArgument` translation |

## For AI Agents
### Working In This Directory
- `ParseHalJsonInterceptor` must stay per-route (`@UseInterceptors`) — global registration breaks gRPC/RMQ responses (see CLAUDE.md's Key Patterns).
- On RPC handlers, `@UseFilters` must wrap `@UseGuards`, or exception handling is bypassed.

## Dependencies
### Internal
- `GlobalException.filter.ts` and `filter/ExceptionFilter.grpc.ts` both import `Exception`/`ExceptionFactory` from `../modules/exceptions` (see [../modules/AGENTS.md](../modules/AGENTS.md)) via the `@exceptions/*` alias, and `DomainError` from `@auth/domain/error/DomainError.js` — the one place `src/shared` reaches into `src/auth`.
### External
- `@nestjs/common`, `express` (`Response` type), `rxjs`.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
