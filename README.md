# app-backend

Application backend (REST API) — property-management app

## Tech stack

Node.js 22 (LTS), TypeScript, [Fastify](https://fastify.dev/), and
[Drizzle ORM](https://orm.drizzle.team/). The service is packaged as a
multi-stage Alpine container image.

> This is the skeleton. The `properties` schema, database migrations,
> `/healthz`, the CRUD API, and the Helm chart are added in later changes.

## Prerequisites

- **Node.js 22.22.3** — the exact version is pinned in [`.nvmrc`](./.nvmrc).
  Use any version manager that reads `.nvmrc` (fnm, Volta, nvm) or a matching
  system install.
- **npm** (ships with Node).
- **Docker** with Docker Compose — only needed to run the local Postgres.

## Local development

```bash
# 1. Switch to the pinned Node version (example with fnm / nvm)
fnm use            # or: nvm use

# 2. Create your local env file from the template (never commit .env)
cp .env.example .env

# 3. Start the local Postgres (development only)
docker compose up -d

# 4. Install dependencies
npm install

# 5. Run the server with live reload
npm run dev
```

The server then listens on `http://localhost:3000/` and answers the placeholder
route `GET /`.

## Scripts

| Script          | Purpose                                     |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Start the server with live reload (`tsx`).  |
| `npm run build` | Compile TypeScript to `dist/`.              |
| `npm start`     | Run the compiled server (`dist/server.js`). |
| `npm run lint`  | Lint the codebase with ESLint.              |
| `npm test`      | Run the Vitest test suite.                  |

## Environment variables

| Variable       | Required | Default | Description                   |
| -------------- | -------- | ------- | ----------------------------- |
| `DATABASE_URL` | yes      | —       | PostgreSQL connection string. |
| `PORT`         | no       | `3000`  | HTTP server listen port.      |

The local-development `DATABASE_URL` in `.env.example`
(`postgresql://app:app@localhost:5432/app`) matches the Postgres service in
[`docker-compose.yml`](./docker-compose.yml), which is for **local development
only** and is not part of any deployment path.
