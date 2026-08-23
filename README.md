# HackMate — Stage 1 Foundation

Stage 1 restores the production-shaped foundation for HackMate:

- Next.js App Router
- Clerk authentication boundary
- Clerk user.created/user.updated/user.deleted webhook
- Idempotent webhook event records
- One Neon PostgreSQL database for v1
- Drizzle schema for profiles, colleges, GitHub data, and webhook events
- Six-step onboarding wizard
- Profile completion score
- Public profile route
- GitHub synchronization route without storing OAuth tokens
- TanStack Query provider
- Middleware authentication protection
- Server-side onboarding redirect in the protected layout

## Important architecture decision

Stage 1 intentionally uses one Neon database through `CORE_DATABASE_URL`. The previous three-physical-database design can be introduced later only after explicit cross-domain synchronization contracts are defined.

Stage 2 now adds the core product flow: canonical hackathons and source mappings, validated internal ingestion, listing/detail APIs, bookmarks, interests, partner search, requests, teams, notifications, and an outbox table. n8n, CrewAI, chat, Pusher delivery, Resend delivery, and UploadThing remain Stage 3 concerns.

## Run locally

Requirements:

- Node 20+
- pnpm 10+
- Clerk development instance
- Neon PostgreSQL database for real profile persistence

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The landing page can render without credentials. Authenticated flows require Clerk keys. Database-backed profile flows require `CORE_DATABASE_URL`.

## Database

Generate, apply, and seed migrations explicitly:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

`db:seed` inserts development colleges and sample hackathons. Do not use `db:push` for production deployments.

## Clerk webhook

Configure a Clerk webhook endpoint at:

```text
/api/webhooks/clerk
```

Subscribe to:

- `user.created`
- `user.updated`
- `user.deleted`

Set the endpoint signing secret as `CLERK_WEBHOOK_SIGNING_SECRET`. The handler uses the Clerk webhook verifier and stores the Svix event ID so retries can be processed safely.

## Stage 1 routes

- `/`
- `/sign-in`
- `/sign-up`
- `/dashboard`
- `/onboarding`
- `/profile/[username]`
- `GET/PATCH /api/users/me`
- `GET /api/users/[username]`
- `POST /api/github/sync`
- `POST /api/webhooks/clerk`
- `GET /api/health`
