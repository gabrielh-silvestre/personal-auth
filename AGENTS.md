<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# personal-auth

## Purpose
NestJS token-issuing service (REST + gRPC + RabbitMQ on one app). Commands, architecture, transports, token semantics and test conventions live in [CLAUDE.md](CLAUDE.md) — read it first; this file is only the directory map.

## Key Files
| File | Description |
|------|-------------|
| `src/main.ts` | Bootstraps REST, connects RMQ (`AUTH` queue) and gRPC microservices |
| `src/app.module.ts` | Root module: global `ConfigModule`, Mongoose connection, `AuthModule` |
| `src/@types/` | Express `Request.user` augmentation |
| `.env.example` | Every env var, with an inline comment each |
| `docker-compose.yml` | Backend + MongoDB + RabbitMQ; dev image from `.docker/Dockerfile.dev` |
| `stryker.conf.mjs` | Mutation testing over `domain/` and `useCase/` (Vitest runner) |
| `commitlint.config.js`, `.husky/commit-msg` | Enforce Conventional Commits (subject ≤ 80 chars, no body) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/auth/` | The auth bounded context: domain, use cases, infra (see [src/auth/AGENTS.md](src/auth/AGENTS.md)) |
| `src/shared/` | Cross-cutting modules: exceptions, JWT, RMQ, filters, interceptors (see [src/shared/AGENTS.md](src/shared/AGENTS.md)) |
| `test/` | E2E suites, run by Vitest (see [test/AGENTS.md](test/AGENTS.md)) |
| `.github/workflows/` | CI: `main.yml` (PRs to `main`, coverage + build/boot smoke) |
| `.docker/` | `Dockerfile.dev` / `Dockerfile.prod` |

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
