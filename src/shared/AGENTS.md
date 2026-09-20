<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-09-19 | Updated: 2026-09-19 -->

# shared

## Purpose
Cross-cutting code shared by every bounded context: Nest modules, transport-facing adapters, DI/env constants, and test fixtures. Architecture layers and DI-token conventions are in [CLAUDE.md](../../CLAUDE.md); this file only maps what lives here.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `modules/` | NestJS modules: exceptions, JWT signing, RabbitMQ (see [modules/AGENTS.md](modules/AGENTS.md)) |
| `infra/` | Transport-facing adapters: REST/gRPC exception filters, HAL interceptor, response types (see [infra/AGENTS.md](infra/AGENTS.md)) |
| `utils/` | DI/env constants and test fixtures (see [utils/AGENTS.md](utils/AGENTS.md)) |

## For AI Agents
### Working In This Directory
- There is no `domain/` here: the generic `IRepository<T>`/`IValidator<T>` contracts were removed for having no implementer. `src/auth/domain/` owns its own contracts and imports nothing from `@shared`.

## Dependencies
### Internal
- Consumed via the `#shared/*` subpath import (e.g. `#shared/utils/constants`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
