<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# utils

## Purpose
DI/env string tokens and test fixtures shared across bounded contexts. See [CLAUDE.md](../../../CLAUDE.md) for the environment variables these tokens name.

## Key Files
| File | Description |
|------|--------------|
| `constants/envVariables.ts` | `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `RABBITMQ_URL`, plus the `TOKEN_SECRET(name)` / `TOKEN_EXPIRES_IN(name)` / `RABBITMQ_QUEUE(name)` builders |
| `constants/index.ts` | Barrel re-export of `envVariables.ts` |
| `mocks/tokens.mock.ts` | `TOKENS_MOCK` — fixture array of `Token` entities built via `TokenFactory`, imported across `src/auth` unit/integration specs |

## For AI Agents
### Working In This Directory
- New env var → add its name here, then read it through `ConfigService`; see `jwt/jwt.util.ts` and `rmq/rmq.service.ts` in `../modules/` for the fail-fast pattern (`getJwtSecret`/`getRequiredEnv`).

## Dependencies
### Internal
- Consumed via `@shared/utils/constants` / `@shared/utils/mocks`.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
