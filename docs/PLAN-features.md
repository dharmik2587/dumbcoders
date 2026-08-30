# HackMate — Detailed Feature Plan

> Planning doc (v2). Discuss and revise before any code is written.
> Scope: **Matching**, **Team Workspace**, **Leaderboard** — each end-to-end.

---

## 0. Current state (what we're building on)

- **Auth**: Supabase (README still says Clerk — we'll fix docs separately, out of scope here).
- **Profile data**: `profiles` (skills, rolePreference, hackathonInterests, availability, collegeId, isOpenToTeam).
- **GitHub data**: `github_data` already stores `languages` (jsonb), `publicRepos`, `followers`, `following`, `publicRepositoryCount` — **currently unused by matching**.
- **Teams**: `teams` already has `rolesNeeded[]`, `status`, `projectName`, `projectUrl`, `demoUrl`, `resultNote` (all unused in UI). `team_members.role` exists. `team_messages` powers team chat (3s polling).
- **Requests**: `team_requests` with accept/reject/withdraw; UI currently uses `window.prompt()` (ugly).
- **Notifications**: `notifications` table + `createNotification()` helper already exist.
- **Matching**: `compatibility.ts` uses only self-declared skills/interests/role/availability (0–100).
- **No tables yet for**: leaderboard scores, coding-contest data, direct (1:1) messages.

---

## 1. Matching (upgrade)

**Goal**: rank partners by *verified* signal, not just self-declared skills, and make matching
team-gap aware.

### 1.1 Compatibility v2 (`src/lib/compatibility.ts`)

Keep the existing score shape (`{ score, reasons }`) but add two signals:

| Signal | Source | Proposed weight | Notes |
|---|---|---|---|
| Skills (shared + complementary) | `profiles.skills` | 40 | keep existing logic |
| Interests + role + availability | `profiles` | 25 | keep existing logic |
| **GitHub stack overlap** | `github_data.languages` vs candidate languages | 20 | replaces "shared skills" ambiguity; reward shared *language* counts |
| **Team gap** (NEW) | team's `rolesNeeded` / missing roles vs candidate `rolePreference` | 15 | only when viewer has an active team |

- `compatibilityScore()` gains an optional `github?: GithubData` and `teamContext?: { rolesNeeded: string[] }` param (backward-compatible).
- `reasons[]` gains human-readable lines: "shares 3 GitHub languages", "fills your missing ML role", etc.

### 1.2 Data plumbing

- Extend `searchPartners()` (`src/lib/db/queries/partners.ts`) to **leftJoin `github_data`** and pass
  `github` + team context into `compatibilityScore()`.
- Add a `teamId` query param to `/api/users/search` so "find for this team" works.
- Add optional filters to partner search: `skill`, `collegeId`, `role` already exist — add `availability`, `graduationYear`.

### 1.3 UI

- `PartnerFinder.tsx`: show the *reason* line prominently (why this match), a small GitHub
  language-overlap chip, and (when in team context) a "fills gap: ML" badge.
- Add filter controls (role / college / availability) instead of search-only.

**Files touched**: `compatibility.ts`, `queries/partners.ts`, `api/users/search/route.ts`,
`PartnerFinder.tsx`.

---

## 2. Team Workspace (upgrade)

Three additions to `teams/[id]` and `teams/my`.

### 2.1 Skill-gap view (NEW)

- Compute roster coverage across the 5 canonical roles (frontend / backend / ML / design / pitch)
  from `team_members.role` + member `profiles.skills`.
- Show a "coverage" row: filled vs. missing roles, and a "Suggested: invite a ML builder" CTA
  linking to `/find-partners?teamId=<id>`.
- New helper: `src/lib/teams/roster.ts` → `computeTeamGaps(members)` returns `{ coverage, missing }`.

### 2.2 1:1 direct messaging (NEW)

Replace the `window.prompt()` request flow with real messages.

- **New table** `direct_messages` (mirrors `team_messages`):
  `id, conversationId, senderId→profiles, content, readAt, createdAt`.
- **New table** `conversations`: `id, userA→profiles, userB→profiles, createdAt` (+ unique pair index).
- **New routes**:
  - `GET/POST /api/messages` — list my conversations / start one.
  - `GET/POST /api/messages/[conversationId]` — thread + send (creates `notifications` row like team chat does).
- **New UI**: a Messages page (`/messages`) + a DM thread; "Message" button on partner cards
  *instead of* `window.prompt()`.
- Keep polling (3s) like `TeamChat` for now; Pusher realtime is a later optimization.

### 2.3 Submission / wins showcase (NEW, data already exists)

- Surface `teams.projectName / projectUrl / demoUrl / resultNote` on the team page as a
  "Project & results" card (public — visible to non-members).
- Add edit UI for the team leader to fill these fields.
- This becomes the data source for the leaderboard's "team result" score.

**Files touched**: `schema/core.ts`, `queries/teams.ts`, new `queries/messages.ts`,
new `api/messages/*`, `teams/[id]/page.tsx`, new `/messages` page, `PartnerFinder.tsx`,
new `lib/teams/roster.ts`.

---

## 3. Leaderboard (NEW)

**Rank basis (your decision)**: team ratings + hackathons/contests participated + GitHub
contribution → one weighted composite (0–100). Provider: GitHub only (no LeetCode/Codeforces).

### 3.1 Scoring model (proposed — weights tunable)

| Component | Data source | Weight | How it's scored |
|---|---|---|---|
| **GitHub contribution** | `github_data` | 40 | log-scale of `publicRepos` + `followers` + language count, capped |
| **Hackathon participation** | teams linked to hackathons (`teams.hackathonId`) | 30 | count of distinct hackathons joined, capped at ~10 |
| **Team results** | `teams.resultNote` (or new `result` field) | 30 | win/place points (e.g. 1st=30, 2nd=20, 3rd=15, finalist=10) |

Composite = sum of weighted sub-scores, normalized 0–100. Anti-gaming: cap raw counts, decay
inactive users, only count verified (GitHub-linked) + real team memberships.

### 3.2 Schema

- **New table** `leaderboard_scores` (materialized per user, recomputed by a job):
  `id, userId→profiles, githubScore, participationScore, resultScore, composite, computedAt`.
  - Materialized so the board is fast + not recomputed per request.
- **New field** on `teams`: `result: text` (enum-ish: `won/2nd/3rd/finalist`) OR parse from
  `resultNote` — **decision needed** (I recommend a structured `result` field, keep `resultNote` for prose).
- **New table** `hackathon_participations` (optional, cleaner than deriving from teams):
  `id, userId, hackathonId, teamId, role, placedAt` — filled when a team is linked to a hackathon.
  - Recommendation: derive from `teams.hackathonId` first (no new table), add this later only if
    we need per-user history.

### 3.3 Compute

- **New cron** `/api/internal/cron/leaderboard` (mirrors existing `cron/hackathons`) that
  recomputes `leaderboard_scores` for all users. Trigger via the existing external-cron pattern.
- Pure/unit-testable function: `src/lib/leaderboard/score.ts` → `computeScore({ github, teams, results })`.

### 3.4 API + UI

- **New route** `GET /api/leaderboard?scope=global|college|batch&window=week|month|all`.
- **New page** `/leaderboard`:
  - Tabs for **Global / College / Batch**, and **Weekly / Monthly / All-time**.
  - Ranked rows: rank, avatar, name, student code, the 3 sub-scores (small bars), composite.
  - Highlight "you" row pinned near top.
- Profile page gets a compact "HackMate Score" chip linking to the leaderboard.

**Files touched**: `schema/core.ts`, new `lib/leaderboard/score.ts`, new
`api/leaderboard/route.ts`, new `api/internal/cron/leaderboard/route.ts`,
new `/leaderboard` page, `profile/[username]/page.tsx`.

---

## 4. Cross-cutting

- **Themes**: keep both for now (dark landing, light app). Unify after these features land.
- **Docs**: fix README (Clerk → Supabase) as a small cleanup, separate from feature work.
- **Validation**: add zod schemas in `src/lib/validations/` for new routes (message, result, leaderboard filters).

---

## 5. Execution order (proposed)

1. **Matching v2** — smallest, reuses existing data; unlocks "team gap" for workspace.
2. **Leaderboard** — new score lib + cron + page; depends on team results (small schema add).
3. **Team workspace** — skill-gap (feeds matching), 1:1 messaging, submission showcase.

Rationale: matching + leaderboard share the GitHub data work; workspace's skill-gap ties back
into matching's team context.

---

## 6. Decisions — APPLIED (defaults, executed)

1. **Leaderboard weights** — 40/30/30 (GitHub / participation / results). ✅
2. **"Team rating" source** — structured `teams.result` field (`won|second|third|finalist|participated`). ✅
3. **Participation** — derived from `teams.hackathonId` via `team_members` (no new table). ✅
4. **1:1 messaging** — full `/messages` page + "Message" button on partner cards. ✅
5. **Skill-gap roles** — canonical 5 roles (frontend/backend/ML/design/pitch). ✅

> Note: leaderboard is computed **on-read** (no materialized table/cron) — simpler and always
> fresh at this scale. Can materialize later if the board gets slow.

---

## 7. Execution status

Built and verified (`pnpm typecheck`, `pnpm lint`, `pnpm build` all green; migration generated):

- **Matching v2** — `compatibility.ts` (object input + GitHub-stack + team-gap signals),
  `queries/partners.ts` (github join + `teamId` context), `/api/users/search` (`teamId` param),
  `PartnerFinder.tsx` (gap badge, GitHub chips, inline request form + Message button).
- **Leaderboard** — `lib/leaderboard/score.ts`, `queries/leaderboard.ts`, `/api/leaderboard`,
  `/leaderboard` page (Global/College/Batch scopes).
- **Team workspace** — `lib/teams/roster.ts` (skill gaps), `queries/messages.ts` +
  `/api/messages[/id]` + `/messages` page (1:1 DMs), `TeamProjectEditor.tsx` + submission
  showcase on `teams/[id]`, `teams.result` field + validation.
- **Schema/migration** — `conversations`, `direct_messages` tables + `teams.result`;
  `drizzle/0003_sparkling_bloodstorm.sql`.

Remaining: apply migration to a live DB (`pnpm db:migrate`) and manual QA.

