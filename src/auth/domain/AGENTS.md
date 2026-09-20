<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# domain

## Purpose
Pure TypeScript layer: the `Token` aggregate, its factory, and the repository contract. No framework imports, no `@shared` imports — see [CLAUDE.md](../../../CLAUDE.md) for the `domain → useCase → infra` layering this enforces.

## Key Files
| File | Description |
|------|--------------|
| `entity/Token.ts` | `Token` class implementing `IToken`. Private fields (`_id`, `_userId`, `_expireTime`, `_lastRefresh`, `_expires`, `_revoked`, `_type`) with getters. `isValid()` checks not-revoked and not-expired; `refresh()` extends `_expires` from now (throws `DomainError` if `type !== 'REFRESH'`); `revoke()` sets `_revoked = true`; `expiresIn()` returns ms remaining |
| `entity/token.interface.ts` | `TokenType = 'ACCESS' \| 'RECOVER_PASSWORD' \| 'REFRESH'`; `IToken` getter contract |
| `entity/token.unit.spec.ts` | Unit tests for `Token` (creation, validity, refresh, revoke) |
| `error/DomainError.ts` | `DomainError extends Error` — the only error type thrown from this layer; translated to `ExceptionFactory.invalidArgument` by `GlobalExceptionRestFilter`/`ExceptionFilterRpc` outside domain |
| `factory/Token.factory.ts` | `TokenFactory` — static, env-driven expiry (`ACCESS_TOKEN_EXPIRE_TIME`, `RECOVER_PASSWORD_TOKEN_EXPIRE_TIME`, `REFRESH_TOKEN_EXPIRE_TIME` ms, each with a hardcoded fallback). `createAccessToken`/`createRecoverPasswordToken`/`createRefreshToken` build a `Token` with a fresh `uuid()` id; `createTokenFromType(type, userId)` switches over `TokenType` and throws `DomainError` on an unknown type |
| `factory/token.factory.unit.spec.ts` | Unit tests for `TokenFactory` |
| `repository/token.repository.interface.ts` | `ITokenRepository` — standalone interface, extends nothing from `@shared`: `create`/`update`/`find` plus `findByUserIdAndType(userId, type): Promise<Token \| null>` |

## For AI Agents

### Working In This Directory
- New token type → add it to the `TokenType` union in `entity/token.interface.ts`, add a `case` in `TokenFactory.createTokenFromType`, and add a dedicated `createXToken` factory method with its own env-driven expiry constant.
- Never import Nest, Mongoose, `@shared`, or any adapter here — this layer stays framework-free and dependency-free by design. Invalid state throws `DomainError`, never `ExceptionFactory`.

### Testing Requirements
- `*.unit.spec.ts` naming, no I/O, no mocks beyond Vitest (per [CLAUDE.md](../../../CLAUDE.md)). Both `Token` and `TokenFactory` already have full unit coverage — extend those specs rather than adding new files for new methods on the same class.

### Common Patterns
- Token refresh reuses the same token id (non-rotational): `refresh()` mutates `_expires` in place instead of creating a new `Token`.

## Dependencies

### Internal
- None — this layer has zero internal dependencies, including `@shared`.

### External
- `uuid` (`v4`)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
