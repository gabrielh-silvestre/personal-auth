<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# auth

## Purpose
The auth bounded context. `auth.module.ts` is the Nest wiring point that assembles domain, useCase and infra into the DI container; see [CLAUDE.md](../../CLAUDE.md) for the layering rules and triple-transport design this module implements.

## Key Files
| File | Description |
|------|--------------|
| `auth.module.ts` | Nest `@Module`: imports `CustomJwtModule` and `RmqModule.register('MAIL'\|'USER')`, registers `TokenSchema` via `MongooseModule.forFeature`; declares the 4 use-case controllers (`Login`, `Refresh`, `VerifyToken`, `GenerateToken`), the 4 use cases, the 3 Passport strategies (`JwtAccessTokenStrategy`, `JwtRefreshTokenStrategy`, `LocalStrategy`), and binds `USER_ADAPTER`/`USER_GATEWAY`/`DATABASE_ADAPTER`/`DATABASE_GATEWAY` to their concrete classes |
| `utils/constants/injectNames.ts` | DI token strings: `DATABASE_ADAPTER`, `DATABASE_GATEWAY`, `USER_ADAPTER`, `USER_GATEWAY`, `TOKEN_ADAPTER`, `TOKEN_GATEWAY` |
| `utils/constants/index.ts` | Barrel re-export of `injectNames.ts` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `domain/` | `Token` aggregate, `TokenFactory`, `ITokenRepository` — pure TypeScript, zero framework imports (see [domain/AGENTS.md](domain/AGENTS.md)) |
| `useCase/` | `login`, `refresh`, `verifyToken`, `generateToken` orchestration (see [useCase/AGENTS.md](useCase/AGENTS.md)) |
| `infra/` | Adapters, gateways, HTTP/gRPC/RMQ controllers, Passport strategies, proto files (see [infra/AGENTS.md](infra/AGENTS.md)) |

## For AI Agents

### Working In This Directory
- New inject token → add it to `utils/constants/injectNames.ts`, then bind it in `auth.module.ts`'s `providers` array as `{ provide: TOKEN, useClass: Impl }`. Never reference an adapter class directly outside its gateway.
- `TOKEN_ADAPTER`/`TOKEN_GATEWAY` are declared in `injectNames.ts` but not currently bound in `auth.module.ts` — no adapter/gateway pair for them exists yet under `infra/`.
- Adding a transport for an existing use case means extending its controller in `infra/api/controller/**`, not touching the use case or this module (per [CLAUDE.md](../../CLAUDE.md)).

### Common Patterns
- Every provider pair here follows adapter → gateway → use case; `auth.module.ts` is the only place implementations are swapped (`useClass`).

## Dependencies

### Internal
- `@shared/modules/rmq/rmq.module`, `@shared/modules/jwt/Jwt.module`

### External
- `@nestjs/common`, `@nestjs/mongoose`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
