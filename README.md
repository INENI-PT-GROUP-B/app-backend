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

A property has `label`, `street`, `zip`, `city` (strings), `sizeSqm` (a
number > 0), `rentEur` (a number ≥ 0), an optional `notes` string, and
server-managed `id` (UUID), `createdAt` and `updatedAt` (timestamps).

## Chart

The Helm chart in [`chart/`](./chart) packages one tenant's full app
stack — backend and frontend Deployments + Services, plus a Traefik
Ingress — and is published as the OCI artifact `app-chart` (see
Releases). It deploys both apps because each tenant gets one app
stack; per-app charts would force the Crossplane Composition to
coordinate two releases instead of one.

The Composition in
[`platform-gitops`](https://github.com/INENI-PT-GROUP-B/platform-gitops/blob/main/crossplane/compositions/xtenant-default.yaml)
(S3-04) fills the contract values at onboarding:

| Value                                     | Source                                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| `tenant`, `host`                          | tenant `XR` spec                                                                  |
| `db.secretName`                           | CloudNativePG-generated secret in the tenant namespace                            |
| `image.backend.tag`, `image.frontend.tag` | `values/app-version.yaml` in `platform-gitops` (S3-10 global rollout mechanism)   |
| `basicAuthMiddlewareRef`                  | per-tenant Traefik `Middleware` created by the Composition                        |
| `imagePullSecrets`                        | shared `ghcr-pull-secret` synced by ESO from GSM into each tenant namespace       |

Local rendering for sanity-checking the templates:

```bash
helm template demo chart/ \
  --set tenant=demo \
  --set host=demo.fhuebung.lol \
  --set image.backend.tag=v0.1.0 \
  --set image.frontend.tag=v0.1.0
```

## Releases

Releases are cut by pushing a `vX.Y.Z` git tag. On a tag, the
[`Release`](./.github/workflows/release.yml) workflow:

- builds and pushes the backend image to
  `ghcr.io/ineni-pt-group-b/app-backend` (tagged `vX.Y.Z`);
- packages `chart/` and pushes it to `ghcr.io/ineni-pt-group-b/app-chart`
  as an OCI artifact, with the chart version set to the tag without its `v`
  prefix (`0.1.0` for tag `v0.1.0`) to match the `values/app-version.yaml`
  convention in `platform-gitops`.

Both steps authenticate with the built-in `GITHUB_TOKEN`; no long-lived
credentials are used. Pushes to `main` without a tag build the image only
(tagged `sha-<short>`); the chart is published on tags only.
