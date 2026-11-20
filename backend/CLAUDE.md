# Backend (NestJS): rules and layout

Loaded when working in `backend/`. The root `CLAUDE.md` has the product, the shared rules and how we work. Nest is newer than most examples: read `backend/AGENTS.md` before using a Nest feature you haven't used here. Feature rules (requests, leads, customers and users, emails, reports and settings, website content) are in `.claude/rules/` and load with their files.

## Stack
- NestJS 12, TypeScript with `strict`, ESM (relative imports end in `.js`).
- MariaDB 10.11 with Prisma 7 (`@prisma/adapter-mariadb`). Keep `prisma`, `@prisma/client` and the adapter on the same exact version.
- Zod for every input and for the settings in `.env` (`src/config/env.ts`).
- Swagger API docs at `/api-docs` (not in production).
- Email: React Email templates sent with nodemailer over SMTP (`backend/src/email/`). Mailpit in development, the hosting's mailbox live. Every email in docs/01 §7 exists (see "Notifications and emails" below), with a plain-text version; the demo invite carries an `.ics` file (`src/leads/ics.ts`). The sender is `EMAIL_FROM` ("FlyConnect Tech Support <info@flyconnecttech.co.uk>", the client's mailbox). Every email can be previewed at `/dev/emails` in development.
- File uploads: a private folder on the server disk (`UPLOAD_DIR`), served only through the backend after a permission check. multer (part of `@nestjs/platform-express`) writes them to `UPLOAD_DIR/tmp` first. See "Support requests" below.
- Jest for unit and whole-app tests, in ES-module mode (`jest.config.mjs`, `jest.config.e2e.mjs`). A test that needs `jest.fn()` imports `jest` from `@jest/globals`. Oxlint, Prettier.
- Sign-in: Better Auth (email and password, sessions in the database, TOTP two-factor required for team accounts, sign-up switched off). Invitations and password resets are our own code in `backend/src/accounts/`. See "Sign-in and permissions" below.

## Commands (in `backend/`, http://localhost:4000, API docs `/api-docs`, health `/health`)
- `npm run dev`: start the backend
- `npm run build`, `npm run start:prod`
- `npm run typecheck`
- `npm run lint`
- `npm run format`
- `npm test`: unit tests
- `npm run test:e2e`: whole-app tests (no database needed), including `test/security.e2e-spec.ts`: the security headers, and that every route needs a sign-in except the listed public ones (a new `@Public()` route must be added to that list)
- `npm run test:db`: database tests on a separate `flyconnect_tech_test` database (needs `docker compose up -d`): migrations, codes, time zone, the account journeys, the client portal (requests, files, statuses, notifications, profile), the team panel (who sees what, assigning, notes, statuses, emails, dashboards), customers and users (adding them with their projects, resend, reset links, disable, last active), website leads (the public forms, demos, quotes, messages, owners, convert), the scheduled jobs (daily digest, auto-close, weekly summary), reports and settings (every number from known requests; saving targets changes the next due time), and website content (testimonials and the live-project link: who may change them, what the website gets, audits), and separate customer and team accounts (`sides`: one email on both sides, each sign-in page and forgot password reaching its own account), and delete and restore (`deletion`: who may delete, what deleting changes, restore and start fresh for team users and customers), and failed emails (`emails`: kept for another try, the send-emails job, given up after 5 tries, resend and dismiss, sign-in links never kept)
- `npm run user:invite -- --role super-admin --name "Your Name" --email you@example.com`: invite a person (roles `super-admin`, `admin`, `manager`, `developer`, `customer`; a customer also needs `--company`). Emails the invitation and prints the link. Needed for the very first super admin; after that, people are added from the team panel (Users, Customers). Live: `node dist/cli/invite-user.js ...` (docs/deploy.md, Step 14)
- `npm run project:add -- --email customer@example.com --name "Project name" --type website --status live`: give a customer a project from the command line (the normal way is Add customer / Add project in the team panel; the browser tests use this). The types and statuses are listed in docs/deploy.md, Step 9. Live: `node dist/cli/add-project.js ...` (docs/deploy.md, Step 14)
- `npm run job -- daily-digest` (or `auto-close`, `weekly-summary`, `send-emails`): run a scheduled job now, against your own database and Mailpit. Live, cPanel Cron runs `node dist/cli/run-job.js <job>` (docs/deploy.md, Step 15). Each run prints one line with the time and what it did (`send-emails` prints nothing when no failed email waits).
- `npm run db:migrate`: apply schema changes in development
- `npm run db:deploy`: apply migrations on the server
- `npm run db:seed`: adds the default settings. No sample data. Safe to run again.
- `npm run db:sample`: sample team, customers, projects, requests, leads and notifications for checking screens locally (stops unless the database is on this computer). `-- --for someone@example.com` adds sample projects ("… (sample)") and requests to a real customer account. `-- --remove` takes both out. One sample customer can sign in to the portal; the script prints the email and password. Emails end in `@sample.flyconnecttech.test`.
- `npm run db:studio`: browse the data
- `npm run db:generate`: rebuild the Prisma client (also runs after `npm install`)
- `npm run auth:schema`: Better Auth's own version of its tables, into `prisma/auth-schema.generated.prisma` (not committed). Run it after upgrading Better Auth and copy any changes into `schema.prisma` by hand.

## Folder layout
- `backend/src/auth/`: Better Auth setup, the global `SessionGuard` and its decorators
- `backend/src/policies/policies.ts`: who may do what, for every role
- `backend/src/accounts/`: invitations, password reset, `/me`, profile (`/portal/profile`, and `/team/profile` for every team role) and password change, and the team's Users routes (`team-users.*`: list, add, disable, resend, reset link, the roles for Add user)
- `backend/src/customers/`: the team's customer routes (list, add with projects, the customer page, add project, project status)
- `backend/src/leads/`: website leads: the public forms (`public-leads.*`), the team routes (`team-leads.*`), the status actions (`lead-actions.service.ts`), who hears about what (`lead-events.service.tsx`), the shared rules and words (`lead-rules.ts`), convert (`lead-convert.ts`) and the calendar invite (`ics.ts`)
- `backend/src/requests/`: support requests: the portal and team routes, status rules, SLA, shared writes (`request-writes.ts`), the dashboards, labels for emails, and `RequestEventsService` (who gets which notification and email)
- `backend/src/uploads/`: file rules and storage on disk
- `backend/src/notifications/`: in-app notifications (`/notifications`, for anyone signed in, only their own)
- `backend/src/settings/`: `settings.service.ts` reads a setting (falling back to `defaults.ts`) and saves them; `settings.controller.ts` is the Settings screen's `/team/settings`; `settings.module.ts` makes it global
- `backend/src/reports/`: Reports & Analytics (`/team/reports`); the sums and their words are in `report-math.ts`
- `backend/src/website/`: Website content: the team routes (`/team/website`, `team-website.controller.ts`), the public `GET /website` (`website.controller.ts`), the rules (`website-rules.ts`) and `website.service.ts`
- `backend/src/time/uk-time.ts`: UK wall-clock time (business days, demo slots)
- `backend/src/email/`: `email.service.ts` (sending, and failed emails kept in `email_outbox` for another try), the templates, and `team-emails.controller.ts` (the Failed emails screen's `/team/emails`)
- `backend/src/jobs/`: the scheduled jobs (`jobs.service.tsx`: daily digest, auto-close, weekly summary, send-emails) and their wording (`job-words.ts`)
- `backend/src/email/previews.tsx`: every email with sample content, grouped by the docs/01 §7 rows; served by `dev-emails.controller.ts` at `/dev/emails` outside production. Add a new email here too (a unit test checks every row has one).
- `backend/src/cli/`: command-line tools (`invite-user.ts`, `add-project.ts`, `run-job.ts`)
- `backend/src/<feature>/`: one NestJS module per feature (requests, leads, customers, users, notifications, email, settings), each with its controller, service and policy checks
- `backend/src/common/paging.ts`: `?page=` and `?size=` (10, 25, 50, 100) for the team lists (requests, customers, leads); each answers `total`, `page`, `pageSize` and one page of `rows`. Users and the client's My Requests are still sent whole.
- `backend/src/prisma/`: the shared database service
- `backend/src/config/env.ts`: the settings and their checks
- `backend/src/config/load-env.ts`: reads `.env` first. Import it as the first line of every entry point (`main.ts`, each `cli/` command): live, `NODE_ENV=production` comes from `.env`, and React must see it before it loads, or every email fails with "dispatcher.getOwner is not a function"
- `backend/prisma/`: `schema.prisma`, `migrations/`, `seed.ts`
- `backend/test/`: whole-app tests

## Database
- **Schema:** `backend/prisma/schema.prisma`, built from docs/02. 23 tables (22 from docs/02, plus `email_outbox`) with plain plural names (`support_requests`). Change it with `npm run db:migrate`, which writes a new migration under `backend/prisma/migrations/`. Never edit a migration that is already committed.
- **No sample data on the live site.** The owner decided against loading `design/sample-data.json`. Data comes from real use; the seed only adds the default settings. For local screen checks only: `npm run db:sample`.
- **Settings:** defaults live in `backend/src/settings/defaults.ts`. The live hosting does not run the seed, so code that reads a setting must fall back to these defaults when its row is missing. Super admins change them on the Settings screen.
- **Readable codes:** always `nextCode(tx, kind)` from `backend/src/codes/readable-codes.ts`, inside the same transaction that creates the record. Numbers start at 1 (TKT-2026-00001, P-0001).
- **One demo per slot:** `demo_requests.scheduledSlot` equals `scheduledStart` while a demo is SCHEDULED and is empty otherwise. It is unique. Set and clear it together with the status.
- **Customer contact:** stored once, on the user (`users.customerId`, unique), not on the customer.
- **UTC:** every connection runs `SET time_zone = '+00:00'` (`backend/src/prisma/connection.ts`). Scripts and tests use `createPrismaClient()` from there; the app uses `PrismaService`.
- **Better Auth** knows only role, status, customerId, jobTitle and timezone (`backend/src/auth/auth-options.ts`). Our services manage the other user fields.
- **Account changes** (invitations, password resets) run their transactions with `ACCOUNT_TX` (read committed). With MariaDB's default locking, people asking for links at the same moment blocked each other.

## Sign-in and permissions (backend)
- **Customer and team accounts are separate.** One email can have one customer account and one team account, each with its own password, invitation and password reset (`users.side`; `email` is unique within a side). Better Auth's "email" is the column `loginEmail`, a private key from `loginKeyFor(email, side)` (`accounts/login-key.ts`; the migration `account_sides` makes the same key in SQL). Each sign-in page sends the header `x-fct-side` (`signInSide()` in the website's `auth-client.ts`), and the `hooks.before` step in `auth.ts` turns the typed email into that side's key; if only the other side has the email it signs that account in (the website then says "This is a team account", as before); with no header and accounts on both sides it answers 400. Forgot password takes `side` the same way. Anything that finds a person by email must say the side (`email_side`), and the real email is `users.email`, never Better Auth's.
- **Every route needs a signed-in person** (global `SessionGuard`) unless it has `@Public()`. Add `@Area('portal')` or `@Area('team')` and `@Can('requests.view')` (and so on) to narrow it. Team members without two-factor reach only routes with `@AllowWithoutTwoFactor()`.
- **Who may do what** lives only in `policies.ts`. Lists filter with `requestScope()` and `customerScope()`, so developers and customers never get other people's records.
- **Better Auth** answers at `/api/auth`, mounted before the body parsers (`app.setup.ts`). Its sign-up, social sign-in, its own reset and email checks are switched off (`DISABLED_PATHS` in `auth.ts`). A session is refused unless the user is ACTIVE.
- **Invitation and reset links:** `accounts/tokens.ts`. Only the hash is stored; 48 hours; once. A failed email still returns the link to the invite command.
- **Rate limits:** Better Auth's own for sign-in and two-factor; `RateLimitGuard` (`rate-limit/`) for our public routes. `RATE_LIMITS=false` only in tests.
- **Audit:** `AuditService.record()` for account, role and permission changes, inside the same transaction when there is one. Recorded so far: user invited, invitation resent, password reset link sent by the team, user disabled and enabled, role changed, email changed, two-step sign-in reset, user deleted and restored, customer created (with its project codes), renamed, deleted and restored, project added, edited and its status changed.
- **Team sessions end after 12 hours unused** (`TEAM_IDLE_MS` in `session.guard.ts`; customers keep 30 days). Each session's `updatedAt` is its last use, saved at most every 5 minutes; an idle one is deleted and answers 401 `SIGNED_OUT` with `reason: "IDLE"`.
- **Signed-in devices** (`/me/sessions`, anyone signed in; `SessionsController` in `profile.controller.ts`): the list (`current` marks this one) and `POST /me/sessions/sign-out-others`. Shown under Change password on both Profile settings pages (`components/shell/signed-in-devices.tsx`).
- **Last active:** `SessionGuard` saves `users.lastActiveAt` at most every 5 minutes per person (`LAST_ACTIVE_EVERY_MS`). The Users list and the customer page show it.
- **Cookies** are named `fct.*` (`__Secure-fct.*` live). Live, `COOKIE_DOMAIN` makes one sign-in work on both the website and the `api.` address.
- **Change password** is our own `POST /me/password` (`accounts/profile.service.ts`): it applies the password rules and signs out other devices. Better Auth's `/change-password` is switched off.
