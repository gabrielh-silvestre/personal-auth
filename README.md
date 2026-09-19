# personal-auth

Token issuer for a microservice system. It does **not** own users:
credentials are verified by an external user service over RabbitMQ
(`verify_user_credentials` on the `USER` queue). Tokens are persisted in
MongoDB as `Token` aggregates; the signed JWT only carries
`{ tokenId, userId }` — validity (expiry, revocation) lives in the stored
entity, not only in the JWT.

## Architecture

`src/auth` is split into three layers, dependencies pointing inward:

- `domain/` — `Token` entity, `TokenFactory`, `ITokenRepository`. No framework imports.
- `useCase/` — `login`, `refresh`, `verifyToken`, `generateToken`; each exposes a single `execute(input)`.
- `infra/` — adapters, gateways, controllers, guards, Passport strategies, `.proto` files.

DI is wired **adapter → gateway → use case** with string tokens from
`src/auth/utils/constants/injectNames.ts`. `src/shared` holds cross-cutting
pieces: exception handling, JWT signing, RabbitMQ client. Conventions to
follow when touching any of this are in [docs/CODE_STYLE.md](docs/CODE_STYLE.md).

## Transports

One Nest app exposes REST + an RMQ microservice (`AUTH` queue) + gRPC
(`proto.tokens`, `proto.auth`):

| Use case | REST | gRPC | RMQ pattern |
|---|---|---|---|
| login | `POST /auth/login` | `AuthService.LoginUser` | — |
| refresh | `GET /auth/refresh` | `AuthService.RefreshToken` | — |
| verifyToken | — | — | `auth.verify_token` |
| generateToken (recover password) | — | — | `auth.generate_recover_token` |

## Setup

Requires Node 22 (see `.nvmrc`).

```bash
npm ci
cp .env.example .env
docker-compose up   # NestJS + MongoDB 7 + RabbitMQ 3.13
```

Ports: `$PORT` (REST), `50051` (gRPC), `27017` (Mongo), `5672`/`15672` (RabbitMQ AMQP/management).

## Environment variables

All variables are documented inline in `.env.example`. Summary:

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` \| `test` \| `production`; only dev/test allow the JWT secret to fall back to `secret` |
| `PORT` | HTTP port |
| `GRPC_URL` | gRPC server bind address |
| `DB_NAME`, `MONGO_PORT`, `MONGO_URI` | Mongo connection |
| `JWT_{ACCESS,REFRESH}_TOKEN_{SECRET,EXPIRES_IN}` | JWT signing config |
| `{ACCESS,REFRESH,RECOVER_PASSWORD}_TOKEN_EXPIRE_TIME` | persisted entity validity, ms (independent of the JWT expiry above) |
| `RABBITMQ_{PORT,MANAGEMENT_PORT,USER,PASS,URL}` | RabbitMQ connection |
| `RABBITMQ_{AUTH,USER,MAIL}_QUEUE` | queue names |

Outside dev/test, a missing required var throws at boot naming the variable
(`getRequiredEnv` in `rmq.service.ts`, `getJwtSecret`/`getJwtExpiresIn` in
`jwt.util.ts`) rather than silently defaulting.

## Commands

```bash
npm run start:dev          # watch mode
npm run build
npm run lint                # eslint --fix
npm run format

npm run test                # everything except *.e2e-spec.ts
npm run test:unit           # *.unit.spec.ts
npm run test:integration    # *.integration.spec.ts
npm run test:all            # everything under src/ and test/
npm run test:e2e            # *.e2e-spec.ts
npm run test:cov            # coverage of src/auth/** only, feeds SonarCloud
npm run test:mutations      # Stryker incremental; mutates only domain/ and useCase/

npx vitest run path/to/file.spec.ts --no-coverage   # single file
```

Tests run on Vitest. CI: `.github/workflows/main.yml` runs `test:cov` +
SonarCloud on PRs to `main`; `pullRequest.yml` runs `npm run test` on PRs to
`dev`.

Commit messages are enforced by commitlint (Conventional Commits, subject
≤ 80 chars, no body) via a `commit-msg` husky hook.
