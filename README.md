# LeadFlow

A single-screen lead management tool: track leads, log every discussion, and never miss a follow-up.

Built for the PravarAI coding assessment.

> **Screenshots / demo video:** _add links here_

## Features

- Lead list with name, status badge, last note, and time since the last discussion
- Filter by status (New / Contacted / Qualified / Proposal Sent / Won / Lost) and search by name
- Today's follow-ups pinned at the top; overdue follow-ups highlighted in red
- Click a lead to open a timeline dialog: full discussion history (newest first), add a note with an optional follow-up date and time, and change status
- Saving a note updates the list immediately, with no page reload
- Add a new lead (name required; company and phone optional; status defaults to New)
- Seed script with 6 leads and their discussions, plus Docker Compose

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) with React 19, full-stack |
| API | Next.js route handlers (REST, JSON) |
| Database | MongoDB with Mongoose |
| Validation | Zod |
| Styling / UI | Tailwind CSS, Radix UI Dialog (accessible modals) |

**Why this stack:** the brief allows any stack (Next.js + FastAPI preferred). I chose a single Next.js app with Mongoose because I'm fastest with it and it keeps the app to one deployable service. The code still has separate layers (route handlers, services, models) so it can be split into a standalone API later.

## Getting started

### Option A: Docker (easiest)

Copy `.env.example` to `.env` and set `MONGO_ROOT_PASSWORD` to a long, URL-safe password before starting. Do not use the example password for a public deployment.

```bash
docker compose up --build -d
docker compose ps                 # wait for app and mongo to become healthy
docker compose run --rm seed      # optional: load demo data (destructive reset)
```
Open http://localhost:3000.

Set `APP_PORT` in `.env` to change the host port. MongoDB is authenticated, persists in a named volume, and is not exposed on a host port. To stop the services without deleting database contents, run `docker compose down`. Back up the MongoDB volume before removing or migrating it. If you already have a volume initialized without authentication, configure a MongoDB user on that existing database before switching to this Compose setup; do not delete the volume to bypass the migration.

### Option B: Local

Requirements: Node 20.12+ (22 recommended) and a MongoDB instance (local, or a free Atlas cluster).

```bash
cp .env.example .env              # set MONGO_URI
npm ci
npm run seed                      # optional: load demo data
npm run dev
```
Open http://localhost:3000.

### Environment variables

| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB connection string used by the application | `mongodb://localhost:27017/leadflow` |
| `MONGO_ROOT_USERNAME` | Docker Compose MongoDB root username | `leadflow` |
| `MONGO_ROOT_PASSWORD` | Docker Compose MongoDB root password; use a long, URL-safe value | Set in `.env` |
| `APP_PORT` | Optional host port exposed by Docker Compose | `3000` |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm run seed` | Wipe and reseed leads and discussions |
| `scripts/api-check.sh [url]` | Smoke test of API status codes (app must be running) |

### Deploying with Docker

The Docker image uses Next.js standalone output and runs as the unprivileged `node` user. For a deployment, build and publish the image from this repository, provide `MONGO_URI` as a secret pointing at an authenticated MongoDB deployment, and set `PORT`/`HOSTNAME` as required by the hosting platform. The Compose setup is intended for a single host; use managed MongoDB and a persistent backup plan for production data.

## API

All errors use one shape: `{ "error": { "message": "...", "details": [...] } }`.

| Method | Route | Success | Errors |
|---|---|---|---|
| GET | `/api/health` | 200 when the database connection is available | 500 if the service cannot connect |
| GET | `/api/leads?status=&q=` | 200 | 400 invalid status |
| POST | `/api/leads` | 201 | 400 missing name or bad JSON |
| PATCH | `/api/leads/:id/status` | 200 | 400 invalid status or id, 404 not found |
| GET | `/api/leads/:id/discussions` | 200 | 400 invalid id, 404 not found |
| POST | `/api/leads/:id/discussions` | 201 (returns `{ discussion, lead }`) | 400 empty note, bad date or id; 404 not found |

## Project structure

```
src/
  app/                    page + API route handlers (thin: parse, validate, call service)
  components/             Dashboard (owns state), LeadList, LeadCard, FilterBar,
                          LeadTimelineDialog, DiscussionForm, AddLeadDialog, Modal, StatusBadge
  server/                 db connection, models, services (business rules), validation, error helpers
  lib/                    api client, date helpers, constants, types
scripts/                  seed.ts, api-check.sh
```

## Design decisions

- **Denormalized last note.** The lead stores `lastNote`, `lastDiscussionAt`, and `followUpAt`, updated whenever a discussion is added. The list needs one query and no joins.
- **Responses drive the UI.** `POST .../discussions` returns the new discussion and the updated lead, so the client updates the timeline and the list with no refetch.
- **One definition of "today" and "overdue".** Dates are stored in UTC. `src/lib/dates.ts` compares them against the browser's local day, and both the pinned section and the red highlight use it. Follow-ups due today are pinned even if the time has passed; "overdue" means scheduled before today.
- **Race-safe fetching.** Filter and search changes abort the previous request, and search is debounced.
- **Accessibility.** Radix Dialog provides the focus trap, Esc to close, and labelling; every form control has a label.

## Known limitations

- No authentication (optional in the brief).
- Creating a note and updating the lead are two writes, not a transaction (standalone MongoDB has none). A failure between them could leave the lead's summary fields stale.
- No pagination; fine for the intended scale.

## AI usage

I used **Claude** to help me understand the problem, think through the system architecture and API design, and outline the frontend experience before implementation. I wrote the main application code manually. I also used AI as a sounding board while improving the implementation and diagnosing errors; I reviewed the suggestions and decided which changes to make.
