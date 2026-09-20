<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# useCase

## Purpose
Orchestration layer of the `domain → useCase → infra` chain. Each subfolder holds one use case: `execute(input): Promise<output>`, depending only on the `IDatabaseGateway` interface and `domain/` (`Token`, `TokenFactory`) — never on adapters. Exposed to REST/gRPC/RMQ by the controllers in `../infra/api/controller/`.

## Key Files
| File | Description |
|------|-------------|
| `generateToken/GenerateToken.useCase.ts` | Issues a `recover` token via `TokenFactory.createRecoverPasswordToken`; rejects any other `type` with `ExceptionFactory.nonAcceptable` |
| `generateToken/GenerateToken.dto.ts` | `InputGenerateTokenDto` (`userId`, `type: 'recover'`) — only one `GenerateTokenType` value currently accepted |
| `login/Login.useCase.ts` | Creates an access + refresh token pair for a `userId`, persists both, returns their ids |
| `login/Login.dto.ts` | `InputLoginDto` / `OutputLoginDto` (`accessTokenId`, `refreshTokenId`, `userId`) |
| `refresh/Refresh.useCase.ts` | Looks up the user's `REFRESH` token, validates it, calls `Token.refresh()` (extends expiry, same id — non-rotational), issues a new access token |
| `refresh/Refresh.dto.ts` | Same shape as `Login.dto.ts` (`InputRefreshDto` / `OutputRefreshDto`) |
| `verifyToken/VerifyToken.useCase.ts` | Looks up a token by id, checks `Token.isValid()`, returns the owning `userId` |
| `verifyToken/VerifyToken.dto.ts` | `InputVerifyTokenDto` (`tokenId`) / `OutputVerifyTokenDto` (`userId`) |
| `*/**.useCase.integration.spec.ts` | One per use case, wiring `DatabaseGateway` + `DatabaseMemoryAdapter` against `TOKENS_MOCK` |

## For AI Agents
### Working In This Directory
- All four use cases inject `IDatabaseGateway` via the `DATABASE_GATEWAY` token from `#auth/utils/constants` — never a concrete adapter.
- `Refresh` and `VerifyToken` share the same private-helper pattern: fetch by id/type, return `null` on missing or `!isValid()`, then let `execute` throw `ExceptionFactory.unauthorized('Invalid token')`. Keep that message identical if you touch either — tests assert on it literally.
- `GenerateToken` is the outlier: it validates input (`type !== 'recover'`) before touching the domain, and throws `nonAcceptable`, not `unauthorized`.

### Testing Requirements
- New use case → add a `*.useCase.integration.spec.ts` next to it, wiring `DatabaseGateway` over `DatabaseMemoryAdapter` (see any existing spec for the `beforeEach` boilerplate: `DatabaseMemoryAdapter.reset(TOKENS_MOCK)` then construct gateway + use case).
- `stryker.conf.mjs` (repo root) runs mutation testing over this directory — keep assertions precise (`toStrictEqual`, exact error messages), not just `toBeDefined`.

### Common Patterns
- DTOs are plain `interface`s, no classes/decorators — validation happens in the use case body, not via `class-validator`.
- Output DTOs for `login`/`refresh` are structurally identical (`accessTokenId`, `refreshTokenId`, `userId`); the type name is what varies.

## Dependencies
### Internal
- `#auth/domain/entity/Token`, `#auth/domain/factory/Token.factory` — pure domain, no framework imports.
- `#auth/infra/gateway/database/database.gateway.interface` (type-only import) — the only infra seam use cases see.
- `#exceptions/factory/Exception.factory` — paired HTTP/gRPC status codes.
- `#auth/utils/constants` — `DATABASE_GATEWAY` DI token.

### External
- `@nestjs/common` (`@Inject`, `@Injectable`) only — no other framework coupling.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
