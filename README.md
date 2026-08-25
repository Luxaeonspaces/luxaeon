# Luxaeon Spaces — Business OS (Next.js)

Full web version of the Luxaeon corporate system: auth, RBAC, leads, projects (`created_by`), finance, outflow approvals, HR/payroll, client portal, templates, audit.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma + Supabase PostgreSQL
- NextAuth (credentials)
- Tailwind CSS (glassmorphism UI)

## Setup (Windows / Mac / Linux)

```bash
cd Luxaeon_NextJS
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Set `DATABASE_URL` and `DIRECT_URL` in `.env` before running the Prisma commands.
Use the Supabase pooler URL for `DATABASE_URL` and the direct database URL for
`DIRECT_URL`. The Supabase project URL and publishable API key are not database
connection credentials and are not required by this Prisma-backed application.

For uploads in production, create a Supabase Storage bucket named
`luxaeon-files` and set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and
`SUPABASE_STORAGE_BUCKET`. Keep the service-role key server-only; never expose
it as a `NEXT_PUBLIC_` variable. Uploads use local disk only during development.

On Windows, run `migrate-supabase.cmd` to generate the client, apply the schema,
and seed the founder account in one step.

Open **http://localhost:3000**

### Default login

- Username: `founder`
- Password: `Luxaeonspaces2026`

Change password in **Settings** after first login.

## Modules (all phases)

| Phase | Routes |
|-------|--------|
| Auth + dashboard | `/login`, `/dashboard` |
| Leads + projects | `/leads`, `/projects`, `/projects/[code]` |
| Finance + outflow | `/finance`, `/outflow` |
| Client portal + archive + docs | `/client-portal`, `/archive`, `/documents` |
| HR + profile | `/hr`, `/profile` |
| Users + RBAC + audit | `/users`, `/permissions`, `/audit` |
| Settings | `/settings` |

## RBAC (same rules as Streamlit OS)

- **Founder** — full access + final outflow approval
- **Head of IT** (Department Head + IT) — user management, audit; **no finance**
- **Finance HOD** — finance module
- **HR** — staff profiles & payroll
- **Design staff** — can create projects
- Project **created_by** stored on create

## Production

1. Set `DATABASE_URL` to Supabase's pooled connection string
2. Set `DIRECT_URL` to Supabase's direct connection string
3. Set a strong `NEXTAUTH_SECRET`
4. Set `NEXTAUTH_URL` to your deployed domain
5. Run `npx prisma db push` and `npm run db:seed` once against Supabase
6. Deploy to Vercel / VPS
7. Link client portal from website: `https://your-domain/client-portal`

## Company

Luxaeon Spaces · Oluwabukunmi OMISORE  
+234 902 114 4350 · luxaeonspaces@gmail.com  
Instagram/TikTok: luxaeon_spaces


## File uploads, PDFs & public portal

### Public client portal (no staff login)
Open: **http://localhost:3000/portal**

Clients enter Project Code + Access Code to:
- View stage & progress
- Download shared documents
- Upload their own files

### Staff login portal
**http://localhost:3000/client-portal** (requires login)

### APIs
| Endpoint | Purpose |
|----------|---------|
| `POST /api/upload` | Upload project or client files |
| `GET /api/files/uploads/[filename]` | Download archive file |
| `GET /api/files/client/[filename]` | Download client portal file |
| `POST /api/pdf` | Generate invoice / proposal / summary PDF |

PDF body example:
```json
{ "type": "summary", "projectCode": "LX-2026-001" }
```
Types: `invoice` | `proposal` | `summary`

Files are stored under `storage/uploads` and `storage/client_docs` (backed up with your data).
