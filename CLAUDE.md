# FlyConnect Tech: website, client portal and team panel

**Name.** The product is called **FlyConnect Tech**. The kit's `docs/` and `design/` were written under the working name "Northstack": wherever they say Northstack, read FlyConnect Tech. Never show "Northstack" in the app, emails or page titles.

Two apps in two folders, sharing one brand, one database and one login system:

- `frontend/`: Next.js. Every screen.
- `backend/`: NestJS. All data and rules: database, sign-in, permissions, emails, file uploads.

The frontend has three areas:

1. **Website** (public, 11 pages): Home, Products & Solutions, Travel Technology, Services, Website Development, UI/UX Design, API Integrations, Case Studies, About Us, Contact & Quote, Support. Its forms (Book a demo, Get a quote, Send a message) create leads for the team.
2. **Client portal** (`/portal`): customers send and track support requests for their own projects. Nothing else.
3. **Team panel** (`/team`): Super admin, Admin, Manager and Developer. Role dashboards, support requests, customers and projects, users, website leads, reports, settings.

There is **no public sign-up**. Staff create every account; people activate it from an emailed invitation.

## Read before working on a feature
- `docs/01-product-spec.md`: what every screen does, the rules, statuses, permissions and emails.
- `docs/02-data-model.md`: entities, fields, enums, relations.
- `docs/03-design-system.md`: colours, fonts, spacing, components.
- `docs/04-build-plan.md`: phases with acceptance checks and the prompt for each phase.
- `docs/05-screens-and-routes.md`: every screen, its route and its screenshot.
- `design/screens/`: a screenshot of every screen. Match these.
- `design/source/`: the original design files. Use them for exact copy, sample data and styles. They do not run outside the design tool.
- `design/sample-data.json`: the people, projects, requests and leads shown in the design. Use it for the seed.
- `frontend/AGENTS.md` and `backend/AGENTS.md`: Next.js 16 and NestJS 12 are newer than most examples. Read the docs those files point to before writing code.

**The docs describe one Next.js app with PostgreSQL, S3 and pnpm.** Where they differ from this file, this file wins: two apps, MariaDB, files on the server disk, npm. Screens, rules, statuses and data stay as the docs say.

## Where the rest lives (loaded only when needed)
- `backend/CLAUDE.md`: backend stack, commands, folder layout, database, sign-in and permissions. Loads when you open a file in `backend/`.
- `frontend/CLAUDE.md`: frontend stack, commands, folder layout, conventions, logo. Loads when you open a file in `frontend/`.
- `.claude/rules/*.md`: feature rules that load with their files: `support-requests`, `leads`, `customers-users`, `emails` (the docs/01 §7 table), `reports-settings`, `website-content`, `browser-tests`, `deploy` (hosting and the pipeline).
- When a change touches a feature, update the matching file above, not this one.

## Stack (short)
- **Frontend:** Next.js 16 App Router, TypeScript strict, Tailwind 4 + shadcn/ui, Zod, react-hook-form, Vitest, Playwright + axe. No database access; everything comes from the backend (`NEXT_PUBLIC_API_URL`).
- **Backend:** NestJS 12 (ESM), MariaDB 10.11 + Prisma 7, Zod, Better Auth (TOTP two-factor for the team), React Email + nodemailer, files on disk (`UPLOAD_DIR`), Jest.
- **Both:** npm (not pnpm). Docker Compose runs MariaDB and Mailpit in development.
- **Live:** cPanel shared hosting (Krystal): website `flyconnecttech.co.uk`, backend `api.flyconnecttech.co.uk`. A push to `main` deploys and runs migrations, so never push without the owner's OK.

## Commands
- From the top folder, once: `docker compose up -d` (MariaDB 3306, Mailpit http://localhost:8025).
- In each of `frontend/` and `backend/`: `npm run dev`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`. Backend also `npm run test:db`. Details in each folder's `CLAUDE.md`.
- Ports 3001 (website) and 4000 (backend) so this project runs next to FlyConnect (3000 and 8000).

## Rules
- **Match the design.** Before calling a screen done, compare it with its screenshot in `design/screens/`. Use the design's copy, with the name and logo changed to FlyConnect Tech. Do not invent features, copy or integrations.
- **Permissions run in the backend.** Every query and mutation goes through a policy check there. Hiding UI is not security, and the frontend is never trusted.
  - Developers see only requests assigned to them.
  - Customers see only their own requests and projects.
  - Internal notes never reach customers: not in pages, not in emails, not in API responses.
- **Invite-only.** Invitation and reset links are single-use, stored hashed, and expire after 48 hours.
- **No placeholder text on the website.** The client supplied: reply time "5 business days" (the demo calendar invite "within 1 business day"), info@flyconnecttech.co.uk, no social links in the footer, no WhatsApp number, and money in pounds (£, GBP: the budget ranges and estimates). Testimonials come from the Website content screen. Parts still waiting for content (team members and photos, screenshots, further case studies) are hidden, not shown as "[…]"; add them back when the client provides them.
- **Content facts.** Amadeus and Stripe are in production on FlyConnect. Sabre is only a service we offer. No fake testimonials, no lorem ipsum.
- **Time.** Store UTC. Show demo times in UK time (Europe/London), as the website shows them to visitors.
- **Readable codes** next to UUIDs: `TKT-YYYY-NNNNN` (requests), `DEM-YYYY-NNN`, `QUO-YYYY-NNN`, `MSG-YYYY-NNN` (leads), `P-NNNN` (projects).
- **Accessibility.** Labels on every input, visible focus (gold ring), keyboard access to menus and dialogs, AA contrast.
- **Responsive.** Phone layouts follow the `m*` and `*-phone` screenshots.
- **Security.**
  - Rate-limit sign-in and the public forms, and add a honeypot field to the public forms.
  - Validate uploads (type and size).
  - Keep audit log entries for account, role and permission changes.
  - Secrets live only in `backend/.env` and `frontend/.env.local`. Nothing secret goes in a `NEXT_PUBLIC_` value.
  - Security headers: the website's in `frontend/src/lib/security-headers.ts` (used by `next.config.ts`; the standard CSP without nonces, so pages stay pre-built; it only allows calls to the site and `NEXT_PUBLIC_API_URL`), the backend's in `backend/src/security/security-headers.ts`. A new outside script, font, image or address must be added to the policy. Zod runs with `jitless` (`src/env.ts`) so it never tries `new Function()`.
  - Colours must pass AA contrast; axe checks it. `gold-text` is `#846E21`, slightly darker than the design files' `#887122`.

## How we work
- Build one phase at a time from `docs/04-build-plan.md`. Plan first, then build.
- At the end of each phase:
  - `npm run typecheck`, `npm run lint` and `npm test` pass in both folders.
  - The Commands sections (here and in each folder's `CLAUDE.md`) are current.
  - Give a short list of what to check in the browser.
  - Then stop.
- Ask before adding a dependency that the Stack section doesn't list, and before changing the data model in a way the docs don't describe.
- Use small commits with clear messages.

## Working efficiently (keep token use low)
- Search first (Grep/Glob), then read only the lines you need (`offset`/`limit`). Don't re-read a file you just edited or already have in context.
- Don't open `design/source/` files whole; they are large. Grep them for the copy you need.
- Run the narrowest check first: one test file (`npx vitest run <file>`, `npx jest <file>`, `npx playwright test <file>`), then the full suites once at the end.
- Pipe long command output through `tail`/`grep`; never print whole logs, lockfiles, builds or migrations.
- Use subagents only when the owner asks. Keep replies short: what changed, where, how it was checked.
