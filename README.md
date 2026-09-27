# BloodLink — Campus Blood Donor Management & Tracking System

BloodLink centralizes voluntary blood donation management for a college campus. It replaces the usual scramble across WhatsApp groups and notice boards with a single role-secured platform where students register as donors, raise emergency blood requests, and track their donation history — while administrators monitor donor availability, approve requests, and run campus donation camps.

## Project Overview

On college campuses, emergency blood procurement is often fragmented across social media and group chats, leading to delays when they matter most. BloodLink gives every student a donor profile with automatic eligibility tracking (based on donation gap and health criteria), a way to log urgent requests, and a notification feed for camps and shortages — while giving administrators a live analytics dashboard, a filterable donor directory, and export tools for reporting.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19, TanStack Start (SSR), TanStack Router (file-based routing) |
| Styling / UI | Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide icons |
| Data & server state | TanStack Query, Zod, React Hook Form |
| Charts | Recharts |
| Backend / Auth / DB | Supabase (Postgres + Auth), Row Level Security (RLS) |
| ORM / migrations | Drizzle Kit (schema tooling), raw SQL Supabase migrations |
| Tooling | Vite, TypeScript, ESLint, Prettier, Bun |

## Core Features

### Dual-Role Authentication & Security
- Role-based access control via a `user_roles` table (`admin` / `student`) enforced through Postgres Row Level Security, not just client-side checks.
- Students sign in with their **Register Number**; admins sign in with a username. Both resolve to a Supabase Auth email/password login under the hood.
- Self-registration can only assign the `student` role — no client-side path to self-promote to admin.
- Password reset flow backed by Supabase Auth email links.

### Admin Operations & Analytics
- **Live dashboard**: total donors, currently eligible donors, pending requests, total donations.
- **Visual analytics**: donors by blood group, donations over the last 6 months, request status breakdown, donors by department — all via Recharts.
- **Donor directory**: paginated, filterable by blood group, department, year, and willingness.
- **Manual donor entry** for walk-in / offline registrations.
- **Request management**: approve, reject, or complete emergency blood requests.
- **Broadcast notifications** for camps, urgent shortages, and eligibility reminders.
- **Report export**: CSV, Excel (.xls), and PDF (via browser print) export of donor and request data.
- **Settings**: college name, system name, and contact details, stored in `app_settings`.

### Student Portal
- **Eligibility engine**: automatically calculates donation eligibility from the last donation date (90-day gap) and minimum weight (45 kg).
- **Profile management**: self-service updates to contact info, weight, medical conditions, and donation willingness, with a profile-completion indicator.
- **Emergency blood requests**: submit patient name, hospital, blood group, units, urgency, and required date for admin review.
- **Donation history**: personal log of past donations.
- **Notifications**: in-app feed for camp alerts and urgent matching requests.

## Database Schema

Postgres tables, all protected by Row Level Security:

- **`user_roles`** — maps `user_id` → `admin` / `student`, backed by a `has_role()` security-definer function used across every policy.
- **`profiles`** — student/donor records: register number, department, year, blood group, weight, last donation date, medical conditions, willingness flag.
- **`blood_requests`** — emergency request tickets: patient, hospital, blood group, units, urgency, status (`Pending` → `Approved` / `Rejected` / `Completed`).
- **`donations`** — historical log of completed donations, linked to a profile.
- **`notifications`** — broadcast camp/urgent/reminder announcements.
- **`app_settings`** — key/value system configuration (college name, contact details).

Row Level Security ensures students can only read/update their own profile, requests, and donations, while admins (via `has_role(auth.uid(), 'admin')`) have full visibility and management rights.

## Eligibility Rules

A donor is eligible to give blood again when:
- Their weight is **45 kg or above**, and
- At least **90 days** have passed since their last recorded donation, and
- Their willingness flag is set to `true`.

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (or Node.js 20+ with npm/pnpm as an alternative)
- A [Supabase](https://supabase.com) project (or Lovable Cloud's managed Supabase instance)

### Environment Variables
Create a `.env` file with:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

# Server-only — never expose to the client
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Install & Run

```bash
bun install
bun run dev
```

### Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start the Vite dev server |
| `bun run build` | Production build |
| `bun run build:dev` | Development-mode build |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint |
| `bun run format` | Format the codebase with Prettier |

### Database Setup
Apply the SQL migrations in `supabase/migrations/` to your Supabase project (via the Supabase CLI or dashboard SQL editor) to create the schema, RLS policies, and seed data.

## Project Structure

```
src/
├── components/       # Shared UI (AppShell, StatCard, Field) + shadcn/ui primitives
├── integrations/
│   └── supabase/     # Client (browser), client.server (service role), generated types
├── lib/              # Domain logic: auth context, eligibility rules, exports, nav config
├── routes/           # File-based routes (TanStack Router) — one file per page
├── router.tsx         # Router + QueryClient setup
├── server.ts          # SSR request entry point
└── start.ts           # TanStack Start middleware (CSRF, error handling)

supabase/
└── migrations/       # Schema, RLS policies, and seed data (SQL)

drizzle/
├── schema.ts          # Placeholder — schema is managed via raw Supabase migrations
└── migrations/        # Auth-related migration(s) run via Drizzle Kit
```

## Security Model

- All data access from the client goes through Supabase's RLS-protected REST API — there is no trust placed in client-side role checks alone.
- `AppShell` performs a client-side role redirect for UX purposes only; the actual authorization boundary is enforced by Postgres policies using `has_role()`.
- A `SECURITY DEFINER` function (`auth_email_for_register_number`) resolves a register number to its login email for the student sign-in flow, with a legacy fallback to a synthetic `@bdms.local` address for older accounts.
- The service-role Supabase client (`client.server.ts`) bypasses RLS and is used only in trusted server-side code — it is never bundled to the browser.

## Known Limitations

- PDF export uses the browser's native print dialog rather than server-side PDF generation.
- No automated test suite yet.
- Seed data shipped in the migrations is sample/demo data and should be cleared before real deployment.
