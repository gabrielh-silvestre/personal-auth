<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# useCase

## Purpose
Orchestration layer of the `domain → useCase → infra` chain. Each subfolder holds one use case: `execute(input): Promise<output>`, depending only on `domain/` (`Token`, `TokenFactory`, `ITokenRepository`) — never on adapters, and no longer on any infra-side type. Exposed to REST/gRPC/RMQ by the controllers in `../infra/api/controller/`.

## Key Files
| File | Description |
|------|-------------|
| `revokeToken/RevokeToken.useCase.ts` | Looks up a token by id, calls `Token.revoke()`, persists it; throws `ExceptionFactory.notFound('Token not found')` when the id has no token |
| `revokeToken/RevokeToken.dto.ts` | `InputRevokeTokenDto` (`tokenId`) / `OutputRevokeTokenDto` (`revoked: true`) |
| `login/Login.useCase.ts` | Creates an access + refresh token pair for a `userId`, persists both, returns their ids |
| `login/Login.dto.ts` | `InputLoginDto` / `OutputLoginDto` (`accessTokenId`, `refreshTokenId`, `userId`) |
| `refresh/Refresh.useCase.ts` | Looks up the user's `REFRESH` token, validates it, calls `Token.refresh()` (extends expiry, same id — non-rotational), issues a new access token |
| `refresh/Refresh.dto.ts` | Same shape as `Login.dto.ts` (`InputRefreshDto` / `OutputRefreshDto`) |
| `verifyToken/VerifyToken.useCase.ts` | Looks up a token by id, checks `Token.isValid()`, returns the owning `userId` |
| `verifyToken/VerifyToken.dto.ts` | `InputVerifyTokenDto` (`tokenId`) / `OutputVerifyTokenDto` (`userId`) |
| `*/**.useCase.integration.spec.ts` | One per use case, wiring `DatabaseGateway` + `DatabaseMemoryAdapter` against `TOKENS_MOCK` |

## For AI Agents
### Working In This Directory
- All four use cases inject `ITokenRepository` via the `DATABASE_GATEWAY` token from `#auth/utils/constants` — never a concrete adapter. The DI token still carries the `DATABASE_` prefix; the type it resolves to is the domain repository interface.
- `Refresh` and `VerifyToken` share the same private-helper pattern: fetch by id/type, return `null` on missing or `!isValid()`, then let `execute` throw `ExceptionFactory.unauthorized('Invalid token')`. Keep that message identical if you touch either — tests assert on it literally.
- `RevokeToken` is the outlier: a missing token is `notFound`, not `unauthorized` — it is an explicit kill-switch, not a validity check, so the caller is told the id does not exist.

### Testing Requirements
- New use case → add a `*.useCase.integration.spec.ts` next to it, wiring `DatabaseGateway` over `DatabaseMemoryAdapter` (see any existing spec for the `beforeEach` boilerplate: `DatabaseMemoryAdapter.reset(TOKENS_MOCK)` then construct gateway + use case).
- **Do not use `DatabaseMemoryAdapter` to assert Mongo semantics.** Its `create` matches on `userId` alone; Mongo upserts on `userId + type`, so access and refresh overwrite each other in memory and a "new login replaces the previous session" test would pass against the wrong behaviour. `Login.useCase.integration.spec.ts` carries an inline double keyed by `userId:type` for exactly that case — copy it rather than reaching for the memory adapter.
- `reset(TOKENS_MOCK)` clones each token, so it undoes a mutation like `TOKEN.revoke()` on a token fetched from the adapter. A test that needs a revoked or expired token still builds its own `Token` rather than mutating `TOKENS_MOCK` directly — that array is shared module state, not reset by `reset()`.
- `stryker.conf.mjs` (repo root) runs mutation testing over this directory — keep assertions precise (`toStrictEqual`, exact error messages), not just `toBeDefined`.

### Common Patterns
- DTOs are plain `interface`s, no classes/decorators — validation happens in the use case body, not via `class-validator`.
- Output DTOs for `login`/`refresh` are structurally identical (`accessTokenId`, `refreshTokenId`, `userId`); the type name is what varies.

## Dependencies
### Internal
- `#auth/domain/entity/Token`, `#auth/domain/factory/Token.factory`, `#auth/domain/repository/token.repository.interface` (type-only) — pure domain, no framework imports. This layer imports nothing from `infra/`.
- `#exceptions/factory/Exception.factory` — paired HTTP/gRPC status codes.
- `#auth/utils/constants` — `DATABASE_GATEWAY` DI token.

### External
- `@nestjs/common` (`@Inject`, `@Injectable`) only — no other framework coupling.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
