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
- Email: React Email templates sent with nodemailer over SMTP (`backend/src/email/`). Mailpit in development, the hosting's mailbox live. Every email in docs/01 §7 exists (see "Notifications and emails" below), with a plain-text version; the demo invite carries an `.ics` file (`src/leads/ics.ts`). The sender is `EMAIL_FROM` ("FlyConnect Tech Support <hello@yourdomain.com>" until the client gives the real mailbox). Every email can be previewed at `/dev/emails` in development.
- File uploads: a private folder on the server disk (`UPLOAD_DIR`), served only through the backend after a permission check. multer (part of `@nestjs/platform-express`) writes them to `UPLOAD_DIR/tmp` first. See "Support requests" below.
- Jest for unit and whole-app tests, in ES-module mode (`jest.config.mjs`, `jest.config.e2e.mjs`). A test that needs `jest.fn()` imports `jest` from `@jest/globals`. Oxlint, Prettier.
- Sign-in: Better Auth (email and password, sessions in the database, TOTP two-factor required for team accounts, sign-up switched off). Invitations and password resets are our own code in `backend/src/accounts/`. See "Sign-in and permissions" below.

**Both:** npm (not pnpm). Docker Compose runs MariaDB and Mailpit in development.

## Hosting
cPanel **shared business hosting** (not a VPS), with "Setup Node.js App" and MariaDB 10.11.
- Two Node.js apps: the website on `yourdomain.com`, the backend on `api.yourdomain.com`.
- Never build on the server. GitHub builds both apps and uploads the result.
- Database changes on the server: `prisma migrate deploy` (the deploy runs it). Never `db:migrate` there.
- No Docker, no S3, no Redis, no long-running workers. Scheduled jobs run from cPanel Cron: `node dist/cli/run-job.js <job>` (docs/deploy.md, Step 10).
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
- `npm run test:e2e`: browser tests. They start their own backend (port 4100, database `flyconnect_tech_e2e`) and website (port 3101, built into `.next-e2e`) and read emails from Mailpit, so `docker compose up -d` must be running. Your own dev servers and database are not touched.

In `backend/` (http://localhost:4000, API docs at `/api-docs`, health check at `/health`):
- `npm run dev`: start the backend
- `npm run build`, `npm run start:prod`
- `npm run typecheck`
- `npm run lint`
- `npm run format`
- `npm test`: unit tests
- `npm run test:e2e`: whole-app tests (no database needed)
- `npm run test:db`: database tests on a separate `flyconnect_tech_test` database (needs `docker compose up -d`): migrations, codes, time zone, the account journeys, the client portal (requests, files, statuses, notifications, profile), the team panel (who sees what, assigning, notes, statuses, emails, dashboards), customers and users (adding them with their projects, resend, reset links, disable, last active), website leads (the public forms, demos, quotes, messages, owners, convert) and the scheduled jobs (daily digest, auto-close, weekly summary)
- `npm run user:invite -- --role super-admin --name "Your Name" --email you@example.com`: invite a person (roles `super-admin`, `admin`, `manager`, `developer`, `customer`; a customer also needs `--company`). Emails the invitation and prints the link. Needed for the very first super admin; after that, people are added from the team panel (Users, Customers). Live: `node dist/cli/invite-user.js ...` (docs/deploy.md, Step 9)
- `npm run project:add -- --email customer@example.com --name "Project name" --type website --status live`: give a customer a project from the command line (the normal way is Add customer / Add project in the team panel; the browser tests use this). The types and statuses are listed in docs/deploy.md, Step 9. Live: `node dist/cli/add-project.js ...` (docs/deploy.md, Step 9)
- `npm run job -- daily-digest` (or `auto-close`, `weekly-summary`): run a scheduled job now, against your own database and Mailpit. Live, cPanel Cron runs `node dist/cli/run-job.js <job>` (docs/deploy.md, Step 10). Each run prints one line with the time and what it did.
- `npm run db:migrate`: apply schema changes in development
- `npm run db:deploy`: apply migrations on the server
- `npm run db:seed`: adds the default settings. No sample data. Safe to run again.
- `npm run db:studio`: browse the data
- `npm run db:generate`: rebuild the Prisma client (also runs after `npm install`)
- `npm run auth:schema`: Better Auth's own version of its tables, into `prisma/auth-schema.generated.prisma` (not committed). Run it after upgrading Better Auth and copy any changes into `schema.prisma` by hand.

Ports 3001 and 4000 are used so this project can run next to FlyConnect (3000 and 8000).

## Folder layout
- `frontend/src/app/(site)/`: website pages
- `frontend/src/app/portal/(app)/`: client portal pages that have the sidebar. Sign-in and invitation screens go in `portal/` outside `(app)`, so they get no sidebar.
- `frontend/src/app/team/(app)/`: team panel pages that have the sidebar. Team sign-in goes outside `(app)`.
- `frontend/src/app/dev/components/`: every shared component on one page. Development only (404 on the live site).
- `frontend/src/app/invite/[token]`, `frontend/src/app/reset-password/[token]`: account activation and password reset
- `frontend/src/components/ui/`: shared components (button, field, pill, card, tabs, choice, dialog, toast, banner, avatar, kpi-tile, data-table, stepper, notification-row, file-chip, status-history, row-menu)
- `frontend/src/components/portal/`: the client portal's pieces (shell, my requests, new request steps, conversation, reply box, profile forms)
- `frontend/src/components/team/`: the team panel's pieces (shell, dashboard parts, requests list, conversation with notes, composer, status panel and buttons, assign, resolve and request-info dialogs, customers list, Add customer, customer page buttons, users table with its "⋯" menu, Add user, "What each role can do", the website leads lists, a lead's page, its buttons, owner and composer, and the Confirm demo, Cancel demo, Estimate and Lost dialogs)
- `frontend/src/lib/team/forms.ts`: the Add customer, Add project and Add user rules, with the design's error wording
- `frontend/src/lib/team/leads.ts`: a lead page's words and rules from the design: banners, fact tiles, suggested emails, "How this works" and the buttons for each status
- `frontend/src/components/shell/`: shared by both areas: the frame, the notifications list, the page loading placeholder
- `frontend/src/components/shell/app-shell.tsx`: the sidebar-and-header frame shared by the portal and the team panel
- `frontend/src/components/brand/`: the logo
- `frontend/src/components/site/`, `portal/`, `team/`
- `frontend/public/brand/`: logo files
- `frontend/src/lib/labels.ts`: every display label and pill colour. Never write one anywhere else.
- `frontend/src/lib/routes.ts`: every address in the app. Link to these.
- `frontend/src/lib/team-nav.ts`: the team sidebar menu per role
- `frontend/src/lib/auth/`: the sign-in client, `getMe()` and the page gates (`requireCustomer()`, `requireTeamMember()`)
- `frontend/src/lib/api.ts`: `apiFetch()` (JSON or FormData) and error messages for calls from the browser to the backend
- `frontend/src/lib/api-server.ts`: `serverApi()` for server components: reads from the backend with the visitor's cookie; "not found" and "not allowed" show the not-found page
- `frontend/src/lib/portal/types.ts`, `frontend/src/lib/team/types.ts`: what the backend's portal and team routes return
- `frontend/src/lib/sla.ts`: the SLA badge words ("Due in 38m", "Due tomorrow", "Paused", "Met", "Overdue"), shown with `<SlaPill>`
- `frontend/src/lib/format-time.ts`: dates and times as the design writes them ("Today, 08:50", "8 Nov 2026"), in the person's time zone
- `frontend/src/lib/uploads.ts`: which files can be attached (kept in step with the backend's `upload-rules.ts`)
- `frontend/src/components/auth/`: sign-in, invitation, password reset and two-factor forms
- `frontend/src/proxy.ts`: sends visitors with no session cookie to the right sign-in page
- `frontend/e2e/`: Playwright tests
- `backend/src/auth/`: Better Auth setup, the global `SessionGuard` and its decorators
- `backend/src/policies/policies.ts`: who may do what, for every role
- `backend/src/accounts/`: invitations, password reset, `/me`, profile and password change, and the team's Users routes (`team-users.*`: list, add, disable, resend, reset link, the roles for Add user)
- `backend/src/customers/`: the team's customer routes (list, add with projects, the customer page, add project, project status)
- `backend/src/leads/`: website leads: the public forms (`public-leads.*`), the team routes (`team-leads.*`), the status actions (`lead-actions.service.ts`), who hears about what (`lead-events.service.tsx`), the shared rules and words (`lead-rules.ts`), convert (`lead-convert.ts`) and the calendar invite (`ics.ts`)
- `backend/src/requests/`: support requests: the portal and team routes, status rules, SLA, shared writes (`request-writes.ts`), the dashboards, labels for emails, and `RequestEventsService` (who gets which notification and email)
- `backend/src/uploads/`: file rules and storage on disk
- `backend/src/notifications/`: in-app notifications (`/notifications`, for anyone signed in, only their own)
- `backend/src/settings/settings.service.ts`: reads a setting, falling back to `defaults.ts`
- `backend/src/time/uk-time.ts`: UK wall-clock time (business days, demo slots)
- `backend/src/jobs/`: the scheduled jobs (`jobs.service.tsx`: daily digest, auto-close, weekly summary) and their wording (`job-words.ts`)
- `backend/src/email/previews.tsx`: every email with sample content, grouped by the docs/01 §7 rows; served by `dev-emails.controller.ts` at `/dev/emails` outside production. Add a new email here too (a unit test checks every row has one).
- `backend/src/cli/`: command-line tools (`invite-user.ts`, `add-project.ts`, `run-job.ts`)
- `backend/src/<feature>/`: one NestJS module per feature (requests, leads, customers, users, notifications, email, settings), each with its controller, service and policy checks
- `backend/src/prisma/`: the shared database service
- `backend/src/config/env.ts`: the settings and their checks
- `backend/prisma/`: `schema.prisma`, `migrations/`, `seed.ts`
- `backend/test/`: whole-app tests

## Frontend conventions
- **Use the shared components.** Check `/dev/components` (run the frontend, open http://localhost:3001/dev/components) before building a new piece. Add new shared components to that page.
- **Emails:** `/dev/emails` (development only) shows every email as sent and as plain text, from the backend's `/dev/emails`. The backend must be running.
- **Pills:** `<LabelPill group="requestStatus" value="IN_PROGRESS" />`. Labels and colours come from `labels.ts`.
- **Screen sizes** (Tailwind variants, set in `globals.css`): `site:` 860px and `nav:` 1240px for the website, `app:` 900px for the portal and team panel. Use `max-app:` and so on for "below". The design's full-menu width is 1180px; it is 1240px here because the FlyConnect Tech logo is wider.
- **Website pages** (`components/site/pages/*.tsx`) were converted once from `design/source/website-*.dc.html` and keep the design's inline styles, so they match it exactly. Edit them by hand like any other component. Their root has the class `design-page`, which makes styled elements measure boxes the design's way (padding outside the width, see `globals.css`). Keep both.
- **Book a demo:** any button opens the one dialog through `<DemoButton>` (`components/site/demo/`). The header button is `book-demo-button.tsx`.
- **Website forms** (demo, quote, message) use react-hook-form with the Zod rules in `lib/forms/schemas.ts` and the website field style in `components/site/forms/site-field.tsx`. They call `submitLead()` in `lib/forms/submit.ts`, which posts to the backend's `/leads/…` routes with the page it was sent from and the hidden honeypot field (`<Honeypot>`).
- **Demo times:** `lib/forms/demo-slots.ts` (next 10 weekdays, six slots, UK time, stored as UTC). Book a demo asks `/leads/demo-slots` which times a scheduled demo holds and crosses them out.
- **Signed-in pages:** the `(app)` layouts call `requireCustomer()` or `requireTeamMember()` from `lib/auth/server.ts`, which ask the backend who is signed in (`/me`) and send everyone else to the right page. `proxy.ts` only checks that a cookie exists; the backend makes the real decision.
- **Pages whose address has a changing part** (like `[code]`) sit under a layout that reads the address, so the shells are wrapped in `Suspense` in their layout files. Keep that.
- **Signed-in pages read their data inside their own `<Suspense fallback={<PageLoading />}>`** (see any page in `portal/(app)/`): a server component calls `serverApi()`, and the page's default export wraps it. Without it Next.js reports that moving between pages is not instant (a boundary higher up does not cover a move between two sibling pages).
- **Buttons and forms on signed-in pages** call the backend from the browser with `apiFetch()`, show a toast, then `router.refresh()` so the page and the sidebar numbers update.
- **Times** shown to signed-in people use `lib/format-time.ts` with their profile's time zone (`me.timezone`).
- **Browser tests** can target a running site: `E2E_BASE_URL=https://… npm run test:e2e`. Without it Playwright starts (or reuses) its own backend and website on ports 4100 and 3101.
  - Make test people with `createPerson(role)` and `signInBrowser()` from `e2e/support/accounts.ts`; read emails with `waitForEmail()` from `e2e/support/mailpit.ts`.
  - Request helpers in `e2e/support/portal.ts`: `addProject()` (the `project:add` command), `sendRequest()`, `postAs(person, path, body)` for a team action through the backend (assign, request-info, resolve…), and `idOf(person)`.
  - `waitForEmail()` also lists an email's attachments (the demo invite's `invite.ics`).
  - A test that books a demo and confirms it takes that time in the test database until it is completed: pick a time no other test uses (the website test uses the first day at 14:00; the leads test the last day).
  - The test database keeps every run's data, and every test person has the same name ("Test developer"): pick by role or code, not by position in a list.
  - Next.js keeps pages you left in the page, hidden. Pick fields with the visible-only `field()` helper and form errors by `[data-slot=form-error]`, as in `e2e/accounts.spec.ts`, or a test finds two matches.
- **If styles look stale** after changing `globals.css`, restart `npm run dev`.

## Database
- **Schema:** `backend/prisma/schema.prisma`, built from docs/02. 21 tables with plain plural names (`support_requests`). Change it with `npm run db:migrate`, which writes a new migration under `backend/prisma/migrations/`. Never edit a migration that is already committed.
- **No sample data.** The owner decided against loading `design/sample-data.json`. Data comes from real use; the seed only adds the default settings.
- **Settings:** defaults live in `backend/src/settings/defaults.ts`. The live hosting does not run the seed, so code that reads a setting must fall back to these defaults when its row is missing.
- **Readable codes:** always `nextCode(tx, kind)` from `backend/src/codes/readable-codes.ts`, inside the same transaction that creates the record. Numbers start at 1 (TKT-2026-00001, P-0001).
- **One demo per slot:** `demo_requests.scheduledSlot` equals `scheduledStart` while a demo is SCHEDULED and is empty otherwise. It is unique. Set and clear it together with the status.
- **Customer contact:** stored once, on the user (`users.customerId`, unique), not on the customer.
- **UTC:** every connection runs `SET time_zone = '+00:00'` (`backend/src/prisma/connection.ts`). Scripts and tests use `createPrismaClient()` from there; the app uses `PrismaService`.
- **Better Auth** knows only role, status, customerId, jobTitle and timezone (`backend/src/auth/auth-options.ts`). Our services manage the other user fields.
- **Account changes** (invitations, password resets) run their transactions with `ACCOUNT_TX` (read committed). With MariaDB's default locking, people asking for links at the same moment blocked each other.

## Sign-in and permissions (backend)
- **Every route needs a signed-in person** (global `SessionGuard`) unless it has `@Public()`. Add `@Area('portal')` or `@Area('team')` and `@Can('requests.view')` (and so on) to narrow it. Team members without two-factor reach only routes with `@AllowWithoutTwoFactor()`.
- **Who may do what** lives only in `policies.ts`. Lists filter with `requestScope()` and `customerScope()`, so developers and customers never get other people's records.
- **Better Auth** answers at `/api/auth`, mounted before the body parsers (`app.setup.ts`). Its sign-up, social sign-in, its own reset and email checks are switched off (`DISABLED_PATHS` in `auth.ts`). A session is refused unless the user is ACTIVE.
- **Invitation and reset links:** `accounts/tokens.ts`. Only the hash is stored; 48 hours; once. A failed email still returns the link to the invite command.
- **Rate limits:** Better Auth's own for sign-in and two-factor; `RateLimitGuard` (`rate-limit/`) for our public routes. `RATE_LIMITS=false` only in tests.
- **Audit:** `AuditService.record()` for account, role and permission changes, inside the same transaction when there is one. Recorded so far: user invited, invitation resent, password reset link sent by the team, user disabled, customer created (with its project codes), project added, project status changed.
- **Last active:** `SessionGuard` saves `users.lastActiveAt` at most every 5 minutes per person (`LAST_ACTIVE_EVERY_MS`). The Users list and the customer page show it.
- **Cookies** are named `fct.*` (`__Secure-fct.*` live). Live, `COOKIE_DOMAIN` makes one sign-in work on both the website and the `api.` address.
- **Change password** is our own `POST /me/password` (`accounts/profile.service.ts`): it applies the password rules and signs out other devices. Better Auth's `/change-password` is switched off.

## Notifications and emails (backend)
Every row of docs/01 §7, where it is sent from, what it follows, and where it is tested. In-app notifications are written inside the change's transaction; emails go after it and a failed email never undoes the change. SA, A, M = active super admins, admins, managers.

| §7 row | In-app | Email | Sent from | Follows | Tested in |
|---|---|---|---|---|---|
| Customer or team invitation | — | Invitee (48-hour link) | `accounts/invitations.service.tsx` | — | `accounts`, `customers` db tests |
| Password reset requested or sent by admin | — | The person | `accounts/password-reset.service.tsx` | — | `accounts`, `customers` |
| New support request | SA, A, M ("urgent" kind when Urgent) | Customer's copy; Urgent alert to SA, A | `requests/request-events.service.tsx` | setting `urgentAlert` | `portal`, `team` |
| Request assigned or transferred | Developer | Developer | `request-events` | — | `team` |
| Team reply to customer | Customer | Customer | `request-events` | customer "The team replies" | `team`, `portal` |
| Customer reply | Assignee, or SA, A when unassigned | Assignee | `request-events` | setting `notifyAssigneeOnReply` | `team`, `jobs` |
| Status changed / needs info / resolved / closed | Customer | Customer ("Resolved" asks to confirm) | `request-events` | customer "A status changes" | `team`, `portal`, `jobs` (auto-close) |
| Daily digest of requests waiting for review | — | SA, A, M (none when nothing waits) | `jobs/jobs.service.tsx` | setting `dailyDigest` | `jobs` |
| Weekly summary (added in Phase 9) | — | Customer (none when nothing to report) | `jobs/jobs.service.tsx` | customer "Weekly summary" | `jobs` |
| Demo requested | SA, A, M | Visitor's copy; team alert to SA, A, M | `leads/lead-events.service.tsx` | — | `leads` |
| Demo confirmed or rescheduled | Owner and host (not the person who did it) | Visitor, with `.ics` | `lead-events` | — | `leads` |
| Demo cancelled | — | Visitor, if ticked (a CANCEL `.ics` if it was booked) | `lead-events` | the "Email {first}" tick | `leads` |
| Quote requested | SA, A, M | Visitor's copy; team alert | `lead-events` | — | `leads` |
| Estimate sent or updated | — | Visitor | `lead-events` | — | `leads` |
| Contact message received | SA, A, M | Team alert | `lead-events` | — | `leads` |
| Lead email from the composer | — | The lead's contact | `lead-events` | — | `leads` |

- **Every template** renders as HTML and plain text in the brand layout (`email/previews.spec.ts`).
- **Scheduled jobs** (`jobs/jobs.service.tsx`, run by `cli/run-job.ts`): each is safe to run again. Auto-close moves Resolved requests whose `resolvedAt` is 7 days old to Closed through `moveStatus()` with no person (`actorId: null`), the line "Closed automatically 7 days after it was resolved", and the usual customer notification and email. Each request has its own transaction.

## Website leads (backend)
- **Public forms** (`/leads/demo`, `/leads/quote`, `/leads/message`, `@Public`, rate-limited per address): the same Zod rules as the website; a filled honeypot field answers "sent" and saves nothing; the page is stored by name ("Travel Technology", `pageName()`); a message from a customer's email is linked to that customer. The answer never says whether an email exists.
- **A new lead** gets its code (`nextCode`), an activity line, and an in-app notification for every active super admin, admin and manager. **Emails go after the answer** (the visitor never waits): the visitor's copy (demo, quote) and the team alert to every active super admin, admin and manager.
- **Team routes** (`/team/leads/…`) need `leads.manage` (super admins, admins, managers); converting needs `leads.convert`. Owners and hosts are active super admins, admins and managers. **The first action on an unowned lead makes the actor its owner** (`claimOwner()`). Status changes use `moveStatus()` with the old status, so two clicks can't both win.
- **Demo:** confirm/reschedule sets Scheduled and `scheduledSlot` (unique: two demos never share a time) and emails the `.ics` invite (fixed UID per demo, growing SEQUENCE, so a reschedule or cancel updates the same calendar entry). Complete and cancel clear `scheduledSlot`. Cancel can email the visitor (with a CANCEL invite if it was scheduled).
- **Quote:** every estimate is a new `estimates` row (the history is kept); the newest is current. Lost saves the reason; its optional note is an internal note.
- **Message:** the first email reply sets Replied; reopen goes back to Replied if there was a reply, otherwise New.
- **Composer:** "Email {first}" is sent first and saved only if it went; an internal note is only saved. Other actions save first, and say if their email failed.
- **Convert** (Completed demo or Won quote, once): Add customer with `from` = the lead's code. In the same save (`InvitationsService.inviteUser`'s `onCustomer` step) the customer gets `sourceLeadType`/`sourceLeadId`, the lead its `customerId`, an activity line "Converted to customer by …", and an audit entry `lead.converted`.
- **Counts:** `/team/summary` has the three new-lead badges; the dashboard's leads card has new demos, quotes and messages, estimates awaiting a reply, demos booked and the next one.

## Customers and users (backend)
- **Customers:** managers may look (`customers.view`); only super admins and admins add customers and projects, change a project's status, resend invitations and send reset links (`customers.manage`). Developers get nothing ("not found" in the website).
- **Add customer** goes through `InvitationsService.inviteUser()` with the projects: the customer, its contact (Invited) and the projects (codes from `nextCode`) are saved in one transaction, then the invitation email lists the projects. A failed email keeps the customer; the page says to use Resend invitation. An email already in use answers `EMAIL_TAKEN`.
- **A customer's status** is its contact person's (Invited, Active, Disabled).
- **Users:** super admins and admins only. Who may add, resend to or disable whom follows `canInviteRole()`: admins never act on a super admin. `GET /team/users/roles` gives the Add user screen the roles this person may give and the permission table from `policies.ts`.
- **Disable user:** status Disabled, every session deleted, open invitations and reset links stop working, audit entry. Not yourself. A developer's open requests stay assigned until someone transfers them. There is no re-enable.

## Support requests (backend)
- **Customers reach only their own records:** every portal query includes `customerScope()`. Someone else's request, project or file answers 404, never 403, so codes can't be guessed.
- **Developers reach only the requests assigned to them:** every team query includes `requestScope()` (404 otherwise). Each team route also has `@Can(...)`, and status changes check `allowedStatuses()` (developers: In Progress, Waiting for Customer, Resolved).
- **Internal notes never reach customers:** customer queries ask only for `CUSTOMER_REPLY`, `STAFF_REPLY` and `SYSTEM` messages, and only files on those messages (or on the request itself). Tests check it.
- **Status changes** go through `moveStatus()` (`requests/request-writes.ts`, shared by the portal and the team), which uses `statusChangeFields()` (`requests/status-rules.ts`) to set `resolvedAt`, `closedAt` and the SLA fields, and writes a status history row and (when given) a line in the conversation. Changes use `updateMany` with the old status, so two clicks at once can't both win.
- **Team actions** (`requests/team-requests.service.ts`):
  - **Assign:** only an active developer. Submitted moves to Under Review. The line reads "Assigned to X by Y", or "Transferred from A to B by Y" for a transfer.
  - **Reply to customer:** sets `firstResponseAt` the first time. **Internal note:** changes nothing the customer can see, not even `updatedAt`.
  - **Status chip:** "Status changed to … by …". **Priority:** "Priority changed to …"; the due time is worked out again from the creation time.
  - **Request more info and Resolve:** post their message as a reply and change the status. The question or summary goes inside the status email, so the customer gets one email, not two.
  - **Close:** "{name} closed this request".
- **SLA:** `requests/sla.ts`. The due time comes from the `responseTargets` setting ("4h", "1bd"; business days are Monday to Friday in UK time). Paused while Waiting for Customer: the due time moves later by the time spent waiting. A reopened request gets a fresh due time.
- **Who hears about what:** `RequestEventsService`. In-app notifications are written inside the change's transaction; emails go after it, follow the customer's "Email me when" choices (`accounts/email-prefs.ts`), and a failed email never undoes the change. The team's emails: assigned (always), customer replied (setting `notifyAssigneeOnReply`), urgent request to super admins and admins (setting `urgentAlert`).
- **Dashboard numbers** (`requests/team-dashboard.service.ts`): open = not Resolved or Closed; at risk = Submitted, Under Review or In Progress with less than an hour left or past due; average first response = from arriving to the first team reply, for first replies in the month (UK months, `dashboard-math.ts`). Developers' numbers count only their own requests.
- **Files:** up to 5 per request or reply, 10 MB each, checked by name, browser type and first bytes (`uploads/upload-rules.ts`). Kept as `UPLOAD_DIR/requests/<request id>/<random id>`; the name and type are in the `attachments` table. Routes that take files use `FilesInterceptor` then `CleanUploadsInterceptor`, which deletes whatever is left in `tmp/`. Downloads are always "attachment" with `nosniff`.
- **Request transactions** use read committed (`REQUEST_TX`), like the account ones.

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
