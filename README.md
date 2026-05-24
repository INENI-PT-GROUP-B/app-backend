# app-backend

Application backend (REST API) — property-management app

## Tech stack

Node.js 22 (LTS), TypeScript, [Fastify](https://fastify.dev/), and
[Drizzle ORM](https://orm.drizzle.team/). The service is packaged as a
multi-stage Alpine container image.

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

The server listens on `http://localhost:3000/` and serves the API below;
database migrations run automatically on startup.

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

## API

Authentication is handled at the ingress (Traefik BasicAuth); the API itself is
unauthenticated. Database migrations are applied automatically on startup.

| Method   | Path                  | Description                                          | Success |
| -------- | --------------------- | ---------------------------------------------------- | ------- |
| `GET`    | `/healthz`            | Readiness: 200 once migrations ran and the DB is up. | `200`   |
| `GET`    | `/api/properties`     | List all properties.                                 | `200`   |
| `POST`   | `/api/properties`     | Create a property.                                   | `201`   |
| `GET`    | `/api/properties/:id` | Fetch a property by id.                              | `200`   |
| `PATCH`  | `/api/properties/:id` | Update fields of a property.                         | `200`   |
| `DELETE` | `/api/properties/:id` | Delete a property.                                   | `204`   |

Invalid request bodies and malformed ids return `400`; unknown ids return `404`.

A property has `label`, `street`, `zip`, `city` (strings), `sizeSqm` and
`rentEur` (numbers ≥ 0), an optional `notes` string, and server-managed `id`
(UUID), `createdAt` and `updatedAt` (timestamps).
