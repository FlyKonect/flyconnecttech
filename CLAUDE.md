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

## Stack
**Frontend (`frontend/`)**
- Next.js 16 (App Router, React Server Components), TypeScript with `strict`.
- Tailwind CSS 4 and shadcn/ui (Radix). Theme tokens from `docs/03-design-system.md`, set in `src/app/globals.css`.
- Inter and Inter Tight through `next/font`.
- Zod for every input. react-hook-form on the client.
- Vitest for unit tests, Playwright for end-to-end tests. ESLint, Prettier.
- It has no database access. It gets everything from the backend (`NEXT_PUBLIC_API_URL`).

**Backend (`backend/`)**
- NestJS 12, TypeScript with `strict`, ESM (relative imports end in `.js`).
- MariaDB 10.11 with Prisma 7 (`@prisma/adapter-mariadb`). Keep `prisma`, `@prisma/client` and the adapter on the same exact version.
- Zod for every input and for the settings in `.env` (`src/config/env.ts`).
- Swagger API docs at `/api-docs` (not in production).
- Email: Mailpit in development. Templates and the production sender are set in Phase 9.
- File uploads: a private folder on the server disk (`UPLOAD_DIR`), served only through the backend after a permission check.
- Jest for unit and whole-app tests, in ES-module mode (`jest.config.mjs`, `jest.config.e2e.mjs`). A test that needs `jest.fn()` imports `jest` from `@jest/globals`. Oxlint, Prettier.
- Sign-in: decided in Phase 4. It must be email and password, sessions in the database, TOTP two-factor for team accounts, invite-only.

**Both:** npm (not pnpm). Docker Compose runs MariaDB and Mailpit in development.

## Hosting
cPanel **shared business hosting** (not a VPS), with "Setup Node.js App" and MariaDB 10.11.
- Two Node.js apps: the website on `yourdomain.com`, the backend on `api.yourdomain.com`.
- Never build on the server. GitHub builds both apps and uploads the result.
- Database changes on the server: `prisma migrate deploy` (the deploy runs it). Never `db:migrate` there.
- No Docker, no S3, no Redis, no long-running workers. Scheduled jobs run from cPanel Cron.
- The server's default text format is latin1. Create the live database as `utf8mb4`.
- Needs Node.js 22.12 or newer on the server. GitHub builds with the same version (`NODE_VERSION` variable, default 22).

## Deploy
Setup guide for the owner, in plain steps: `docs/deploy.md`. Keep it current when the pipeline changes.
- `.github/workflows/ci.yml`: checks for both apps. Runs on pull requests, on pushes to other branches, and before every deploy.
- `.github/workflows/deploy.yml`: on a push to `main`, runs the checks, builds, uploads over SSH (rsync), runs `.github/scripts/remote-backend.sh` on the server (packages, migrations, restart), then checks `/health` and the home page. Skipped unless the variable `DEPLOY_ENABLED` is `true`.
- The website is deployed as the Next.js standalone build (`output: "standalone"`), started by `server.js`.
- The backend is started by `backend/app.cjs`: cPanel loads the start file with `require`, which cannot load the ESM app directly.
- A deploy replaces only `dist/` and `prisma/` (backend) and `.next/`, `node_modules/` and `public/` (website). `.env` and `uploads/` on the server are never touched. Keep it that way.
- `prisma` is a normal dependency (not a dev one) so migrations can run on the server.
- Secrets stay in `backend/.env` on the server. GitHub holds only the SSH login. A new backend setting means: add it to `src/config/env.ts`, `.env.example` and Step 6 of `docs/deploy.md`.
- Values the website needs (`NEXT_PUBLIC_*`) are built in at build time from GitHub variables.

## Commands
Start the development services once, from the top folder:
- `docker compose up -d`: MariaDB on port 3306, Mailpit inbox at http://localhost:8025

In `frontend/` (http://localhost:3001):
- `npm run dev`: start the website
- `npm run build`, `npm run start`
- `npm run typecheck`
- `npm run lint`
- `npm run format` (`format:check` to only check)
- `npm test`: unit tests
- `npm run test:e2e`: browser tests (starts the website itself)

In `backend/` (http://localhost:4000, API docs at `/api-docs`, health check at `/health`):
- `npm run dev`: start the backend
- `npm run build`, `npm run start:prod`
- `npm run typecheck`
- `npm run lint`
- `npm run format`
- `npm test`: unit tests
- `npm run test:e2e`: whole-app tests (no database needed)
- `npm run db:migrate`: apply schema changes in development
- `npm run db:deploy`: apply migrations on the server
- `npm run db:seed`
- `npm run db:studio`: browse the data
- `npm run db:generate`: rebuild the Prisma client (also runs after `npm install`)

Ports 3001 and 4000 are used so this project can run next to FlyConnect (3000 and 8000).

## Folder layout
- `frontend/src/app/(site)/`: website pages
- `frontend/src/app/portal/(app)/`: client portal pages that have the sidebar. Sign-in and invitation screens go in `portal/` outside `(app)`, so they get no sidebar.
- `frontend/src/app/team/(app)/`: team panel pages that have the sidebar. Team sign-in goes outside `(app)`.
- `frontend/src/app/dev/components/`: every shared component on one page. Development only (404 on the live site).
- `frontend/src/app/invite/[token]`, `frontend/src/app/reset-password/[token]`: account activation and password reset
- `frontend/src/components/ui/`: shared components (button, field, pill, card, tabs, choice, dialog, toast, banner, avatar, kpi-tile, data-table, stepper, notification-row)
- `frontend/src/components/shell/app-shell.tsx`: the sidebar-and-header frame shared by the portal and the team panel
- `frontend/src/components/brand/`: the logo
- `frontend/src/components/site/`, `portal/`, `team/`
- `frontend/public/brand/`: logo files
- `frontend/src/lib/labels.ts`: every display label and pill colour. Never write one anywhere else.
- `frontend/src/lib/routes.ts`: every address in the app. Link to these.
- `frontend/src/lib/team-nav.ts`: the team sidebar menu per role
- `frontend/src/lib/preview-data.ts`: TEMPORARY sample people and counts for the layouts. Delete when Phases 4 to 6 supply real ones.
- `frontend/e2e/`: Playwright tests
- `backend/src/<feature>/`: one NestJS module per feature (requests, leads, customers, users, notifications, email, settings), each with its controller, service and policy checks
- `backend/src/prisma/`: the shared database service
- `backend/src/config/env.ts`: the settings and their checks
- `backend/prisma/`: `schema.prisma`, `migrations/`, `seed.ts`
- `backend/test/`: whole-app tests

## Frontend conventions
- **Use the shared components.** Check `/dev/components` (run the frontend, open http://localhost:3001/dev/components) before building a new piece. Add new shared components to that page.
- **Pills:** `<LabelPill group="requestStatus" value="IN_PROGRESS" />`. Labels and colours come from `labels.ts`.
- **Screen sizes** (Tailwind variants, set in `globals.css`): `site:` 860px and `nav:` 1240px for the website, `app:` 900px for the portal and team panel. Use `max-app:` and so on for "below". The design's full-menu width is 1180px; it is 1240px here because the FlyConnect Tech logo is wider.
- **Website pages** (`components/site/pages/*.tsx`) were converted once from `design/source/website-*.dc.html` and keep the design's inline styles, so they match it exactly. Edit them by hand like any other component. Their root has the class `design-page`, which makes styled elements measure boxes the design's way (padding outside the width, see `globals.css`). Keep both.
- **Book a demo:** any button opens the one dialog through `<DemoButton>` (`components/site/demo/`). The header button is `book-demo-button.tsx`.
- **Website forms** (demo, quote, message) use react-hook-form with the Zod rules in `lib/forms/schemas.ts` and the website field style in `components/site/forms/site-field.tsx`. They call `submitLead()` in `lib/forms/submit.ts`, which only logs to the browser console until Phase 8 connects the backend. **Nothing is saved or emailed yet.**
- **Demo times:** `lib/forms/demo-slots.ts` (next 10 weekdays, six slots, UK time, stored as UTC). Taken slots are always empty until Phase 8.
- **Team role preview** (development only): add `?role=developer`, `admin`, `manager` or `super-admin` to a `/team` address. Ignored on the live site. Goes away with real sign-in in Phase 4.
- **Pages whose address has a changing part** (like `[code]`) sit under a layout that reads the address, so the shells are wrapped in `Suspense` in their layout files. Keep that.
- **Browser tests** can target a running site: `E2E_BASE_URL=https://… npm run test:e2e`. Without it Playwright uses or starts the dev server on port 3001.
- **If styles look stale** after changing `globals.css`, restart `npm run dev`.

## Logo
- The logo is "Crew Wings": gold wings around a navy node, "FlyConnect" in navy and "Tech" in gold.
- Always use `<Logo />` from `frontend/src/components/brand/logo.tsx`. Variants: `horizontal` (default), `stacked`, `symbol`. Add `onNavy` on navy backgrounds.
- Files: `frontend/public/brand/` (copies in `design/assets/flyconnect-tech/`). Browser tab icons: `frontend/src/app/icon.svg`, `favicon.ico`, `apple-icon.png`.
- The kit's `northstack-mark*.svg` files and the Northstack logo in the screenshots are replaced by this logo everywhere.

## Rules
- **Match the design.** Before calling a screen done, compare it with its screenshot in `design/screens/`. Use the design's copy, with the name and logo changed to FlyConnect Tech. Do not invent features, copy or integrations.
- **Permissions run in the backend.** Every query and mutation goes through a policy check there. Hiding UI is not security, and the frontend is never trusted.
  - Developers see only requests assigned to them.
  - Customers see only their own requests and projects.
  - Internal notes never reach customers: not in pages, not in emails, not in API responses.
- **Invite-only.** Invitation and reset links are single-use, stored hashed, and expire after 48 hours.
- **Placeholders stay placeholders** until the client provides them: `[X business days]`, the WhatsApp number, `hello@yourdomain.com`, testimonials, team photos, screenshots.
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

## How we work
- Build one phase at a time from `docs/04-build-plan.md`. Plan first, then build.
- At the end of each phase:
  - `npm run typecheck`, `npm run lint` and `npm test` pass in both folders.
  - The Commands section above is current.
  - Give a short list of what to check in the browser.
  - Then stop.
- Ask before adding a dependency that the Stack section doesn't list, and before changing the data model in a way the docs don't describe.
- Use small commits with clear messages.
