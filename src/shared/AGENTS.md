<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# shared

## Purpose
Cross-cutting code shared by every bounded context: base domain interfaces, DI/env constants, and test fixtures. Architecture layers and DI-token conventions are in [CLAUDE.md](../../CLAUDE.md); this file only maps what lives here.

## Key Files
| File | Description |
|------|--------------|
| `domain/repository/repository.interface.ts` | `IRepository<T>` — generic CRUD contract (`create`, `update`, `find`, `findAll`); currently unused — `ITokenRepository` in `src/auth/domain/repository/` is a standalone interface, it does **not** extend this (domain stays free of `@shared` imports) |
| `domain/validator/validator.interface.ts` | `IValidator<T>` — `validate(entity): void \| never` contract; currently no implementation or import anywhere in `src/` |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `modules/` | NestJS modules: exceptions, JWT signing, RabbitMQ (see [modules/AGENTS.md](modules/AGENTS.md)) |
| `infra/` | Transport-facing adapters: REST/gRPC exception filters, HAL interceptor, response types (see [infra/AGENTS.md](infra/AGENTS.md)) |
| `utils/` | DI/env constants and test fixtures (see [utils/AGENTS.md](utils/AGENTS.md)) |

## For AI Agents
### Working In This Directory
- `domain/` here stays framework-free like `src/auth/domain/` — no Nest decorators.
- `IValidator<T>` has no current implementer; before adding one, check whether the need is real (see CLAUDE.md's clean-architecture layering) rather than wiring speculative validation.

## Dependencies
### Internal
- Consumed via the `@shared/*` path alias (e.g. `@shared/utils/constants`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
