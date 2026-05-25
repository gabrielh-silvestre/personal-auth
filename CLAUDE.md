# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev
npm run start:dev          # watch mode
docker-compose up          # full local stack (NestJS + MongoDB + RabbitMQ)

# Build
npm run build

# Lint / Format
npm run lint
npm run format

# Tests
npm run test:unit          # *.unit.spec.ts
npm run test:integration   # *.integration.spec.ts
npm run test:all           # unit + integration + e2e
npm run test:e2e           # REST e2e via supertest
npm run test:cov           # coverage (feeds SonarCloud)
npm run test:mutations     # Stryker incremental mutation testing
```

To run a single test file: `npx jest path/to/file.spec.ts --no-coverage`

## Architecture

Clean / Hexagonal architecture in three strict layers:

```
domain  →  useCase  →  infra
```

- **`domain/`** — Pure TypeScript. `Token` aggregate, `TokenFactory` (static, env-driven expiry), `ITokenRepository` interface. Zero framework imports.
- **`useCase/`** — Orchestration. `login`, `refresh`, `verifyToken`, `generateToken`. Each has `execute(input): Promise<output>`. Depends only on gateway interfaces and domain.
- **`infra/`** — Adapters (memory + Mongoose), gateways, HTTP/gRPC/RMQ controllers, Passport strategies, proto files.

The mandatory DI chain is: **adapter → gateway → use case**. Use cases never import adapters. Gateways are the only seam where the storage/transport implementation is visible.

## Triple Transport

`src/main.ts` wires three transports on a single Nest app:

| Transport | Binding |
|-----------|---------|
| REST (HTTP) | Express, `@Post` controllers |
| gRPC | `token.proto` + `auth.proto` via `@GrpcMethod` |
| RabbitMQ | `AUTH` queue via `@MessagePattern` |

A single controller class exposes the **same use case** through all three transports. Adding a new transport for an existing use case means extending the controller — not the use case.

## Dependency Injection Tokens

String tokens are declared in `src/auth/utils/constants/injectNames.ts`:

- `DATABASE_ADAPTER` / `DATABASE_GATEWAY`
- `USER_ADAPTER` / `USER_GATEWAY`

Always use these constants with `@Inject(TOKEN)`. Swap implementations by changing `useClass` in `auth.module.ts` only.

## Path Aliases

| Alias | Resolves to |
|-------|-------------|
| `@auth/*` | `src/auth/*` |
| `@shared/*` | `src/shared/*` |
| `@exceptions/*` | `src/shared/modules/exceptions/*` |

## Exception Handling

Domain errors are created via `ExceptionFactory` and carry paired gRPC/HTTP status codes. Two separate filters normalize them per transport:

- `GlobalExceptionRestFilter` — registered globally in `main.ts` for REST.
- `ExceptionFilterRpc` — applied per-handler via `@UseFilters(new ExceptionFilterRpc())` on gRPC/RMQ methods.

**Decorator order is critical on RPC handlers**: `@UseFilters` must wrap `@UseGuards` — reversing them bypasses exception handling.

## Key Patterns

- `ParseHalJsonInterceptor` is per-route only — never register globally (breaks gRPC/RMQ).
- `CredentialsGuard` bridges gRPC credentials into HTTP format for Passport local strategy — do not remove.
- Token refresh reuses the same token ID (non-rotational), extending expiry to preserve session continuity.
- `TokenFactory` uses a `switch` on `TokenType` for extension; expiry windows come from env vars (milliseconds).
- In-memory adapter matches on `userId` only; Mongoose adapter uses `userId + type` composite — behavior differs, test migrations carefully.

## Testing Conventions

- Unit tests: `*.unit.spec.ts` — no I/O, no mocks beyond Jest.
- Integration tests: `*.useCase.integration.spec.ts` — wire `DatabaseGateway` against `DatabaseMemoryAdapter`.
- E2E tests: bootstrap full `AppModule` with `cookie-parser` and `GlobalExceptionRestFilter` active; mirror `connectMicroservice` calls from `main.ts` when testing gRPC/RMQ transports.

## Environment

Copy `.env.example` to `.env`. Key variables: `PORT`, `MONGO_URI`, `RABBITMQ_URL`, JWT secret/expiry pairs per token type (access, refresh, recover-password) in milliseconds.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **personal-auth** (390 symbols, 805 relationships, 23 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/personal-auth/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/personal-auth/context` | Codebase overview, check index freshness |
| `gitnexus://repo/personal-auth/clusters` | All functional areas |
| `gitnexus://repo/personal-auth/processes` | All execution flows |
| `gitnexus://repo/personal-auth/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

- Re-index: `npx gitnexus analyze`
- Check freshness: `npx gitnexus status`
- Generate docs: `npx gitnexus wiki`

<!-- gitnexus:end -->
