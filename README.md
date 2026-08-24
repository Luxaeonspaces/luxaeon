# Luxaeon Spaces — Business OS (Next.js)

Full web version of the Luxaeon corporate system: auth, RBAC, leads, projects (`created_by`), finance, outflow approvals, HR/payroll, client portal, templates, audit.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma + SQLite
- NextAuth (credentials)
- Tailwind CSS (glassmorphism UI)

## Setup (Windows / Mac / Linux)

```bash
cd Luxaeon_NextJS
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open **http://localhost:3000**

### Default login

- Username: `founder`
- Password: `luxaeonspaces2026`

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

1. Set strong `NEXTAUTH_SECRET` in `.env`
2. Set `NEXTAUTH_URL` to your domain
3. Optional: switch Prisma to PostgreSQL
4. Deploy to Vercel / VPS
5. Link client portal from website: `https://your-domain/client-portal`

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
