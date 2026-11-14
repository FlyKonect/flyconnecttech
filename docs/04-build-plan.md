# 04 · Build plan and prompts

Build in phases. For each phase:
1. Start a fresh Claude Code conversation.
2. Turn on plan mode: type `/plan` in the VS Code panel, or press `Shift+Tab` in the terminal until plan mode shows.
3. Paste the phase prompt. Read the plan, correct it, then approve it.
4. When Claude stops, run the app and check the screens against `design/screens/`. Then commit.

If a screen looks wrong, drag its screenshot into the chat and say what's different.

---

## Phase 0 · Project setup
**Done when:**
- `pnpm dev` runs.
- `docker compose up -d` starts Postgres, Mailpit and MinIO.
- `pnpm typecheck`, `pnpm lint`, `pnpm test` and `pnpm test:e2e` pass.
- CLAUDE.md Commands are filled in.

```text
Phase 0 from docs/04-build-plan.md: set up the project. Read CLAUDE.md and the docs folder first.
1. Create a Next.js app in this folder (App Router, TypeScript strict, src directory, Tailwind, ESLint) with pnpm, and add Prettier.
2. Add shadcn/ui and set the theme from docs/03-design-system.md: colours, 10px radius, and Inter + Inter Tight via next/font.
3. Add docker-compose.yml with PostgreSQL, Mailpit (SMTP and web inbox) and MinIO, and .env.example with every variable explained.
4. Connect Prisma to Postgres. Add scripts: db:migrate, db:seed, db:studio.
5. Install Vitest and Playwright with one passing smoke test each. Add scripts: typecheck, lint, test, test:e2e.
6. Make the home route show "Northstack" in the brand fonts so I can see it works.
7. Fill in the Commands section of CLAUDE.md, initialise git and commit.
Show me the plan and the package list first. Stop when the Phase 0 checks pass.
```

## Phase 1 · Design system and layout shells
**Done when:** the three shells match the screenshots on desktop and phone, and every component is shown on `/dev/components`.

```text
Phase 1 from docs/04-build-plan.md: design system and layout shells.
- Build the shared components listed in docs/03-design-system.md, including every button variant, pills, cards, tabs with counts, chips, form fields with inline errors, dialog, toast, banner, avatar, KPI tile, data table that becomes cards on phones, stepper, radio cards and notification row.
- Add src/lib/labels.ts with every display label and pill colour from docs/03.
- Build three layouts with placeholder content:
  a) Website: gold top bar with Support and Client login, header with the Services dropdown and phone menu, footer with the Clients column. Compare with design/screens/website/01-home-desktop.jpg and 01-home-phone.jpg.
  b) Client portal shell: white sidebar, header, phone slide-in menu. Compare with design/screens/portal/06-customer-dashboard.jpg and m2-mobile-dashboard.jpg.
  c) Team panel shell: navy sidebar with its sections and badges, header and phone menu. The menu items come from one role config. Compare with design/screens/portal/17 to 20.
- Add a development-only page /dev/components that shows every component and variant.
Stop when the shells match the screenshots.
```

## Phase 2 · Website pages
**Done when:** all 11 pages match their desktop and phone screenshots, and the forms validate.

```text
Phase 2 from docs/04-build-plan.md: the 11 website pages.
- Build every page from design/source/website-*.dc.html, with the same copy, section order and layout, as server components. Compare each with design/screens/website/ (desktop and phone). Keep [placeholders] as they are.
- Hero art: design/assets/route-map.svg.
- Build the UI and validation for the Book a demo dialog (3 steps and confirmation), the Get a quote forms (short on Home, full on Contact) and Send a message. For now they submit to a stub that logs the data; Phase 8 connects them.
- FAQ accordions, the Services dropdown, and the phone menu with Support and Client login.
- Metadata for every page, plus sitemap.xml and robots.txt.
Routes are in docs/05-screens-and-routes.md. Stop when every page matches.
```

## Phase 3 · Database and seed
**Done when:**
- The migration runs.
- `pnpm db:seed` loads all the sample data.
- Prisma Studio shows the same people, projects, requests and leads as the design.

```text
Phase 3 from docs/04-build-plan.md: database and seed.
- Write prisma/schema.prisma from docs/02-data-model.md. Install Better Auth, generate its schema, and add our extra user fields to its user model.
- Add a transaction-safe helper for the readable codes (TKT-YYYY-NNNNN, DEM-/QUO-/MSG-YYYY-NNN, P-NNNN).
- Write prisma/seed.ts. It loads design/sample-data.json and converts the relative dates as docs/02 describes. It creates the team, customers and projects, requests with their messages and history, leads with their activity, notifications, and settings. Give the seeded users a development password and print it once.
- Add unit tests for the code helper and the date conversion.
Show me the schema before you run the migration.
```

## Phase 4 · Accounts, invitations and permissions
**Done when:**
- A seeded invitation can be opened in Mailpit and activated.
- Every role can sign in. Team users need the two-factor code.
- Each role lands in the right area.
- The policy tests pass.

```text
Phase 4 from docs/04-build-plan.md: accounts and permissions.
- Better Auth with email and password and database sessions. TOTP two-factor is required for team roles. There is no sign-up route anywhere.
- Screens:
  - 01–05 and 16: sign in, the invitation email template, accept invitation with set password, forgot password, reset password, team sign in with the two-factor code.
  - A two-factor setup screen for new team users. It isn't in the design, so build it with the design system.
  - The /portal/invitation help page described in docs/01.
- Invitation service: create, send the email (React Email, Mailpit in dev), accept, and resend (which revokes the old link). Links expire after 48 hours and tokens are stored hashed. Apply the password rules from docs/01.
- src/server/policies.ts with the permission table from docs/01 section 1, and unit tests for every role and action. Protect /portal and /team, and send people to the right area if they open the wrong one.
- Rate limits on sign in, forgot password and accept invitation.
Stop when I can activate a seeded invitation from Mailpit and sign in as each role.
```

## Phase 5 · Client portal
**Done when:**
- Screens 06–15 and M2–M4 match.
- The status rules work.
- The emails arrive in Mailpit.
- The access tests pass.

```text
Phase 5 from docs/04-build-plan.md: the client portal (screens 06–15, M2–M4).
- Overview; the New request wizard (4 steps, file uploads to MinIO with signed URLs and type and size limits); the submitted page; My requests with tabs; the request conversation (reply, attach, close, confirm the fix, "I still need help", reopen); notifications; profile and password.
- Apply the status rules and the SLA due date from docs/01, and record status history on every change.
- Emails: copy of a new request, team replies, status changes, and resolved (asking the customer to confirm). Plus in-app notifications.
- Add e2e tests that try to open another customer's request or project and expect a 404.
Stop when the portal matches the screenshots and the tests pass.
```

## Phase 6 · Team panel: dashboards and requests
**Done when:**
- Screens 17–25 and M5 match.
- Each role sees and can do exactly what docs/01 says.
- Internal notes never reach customers.

```text
Phase 6 from docs/04-build-plan.md: team panel dashboards and support requests (screens 17–25, M5).
- The four role dashboards with real numbers: KPIs, lists, panels and latest alerts. The Website leads card can show zeros until Phase 8.
- The All requests list with tabs, search and filters. Developers only see their own requests and have no New tab or assignee filter.
- Request review:
  - The conversation with Reply to customer and Internal note.
  - Status chips (with the developer limits) and priority chips.
  - The assign and transfer dialog: active developers with their open counts.
  - Request more info, the resolve dialog, and close.
  - The customer and project panel, attachments, the activity timeline and SLA badges.
- Notifications and emails for assignment, customer replies and urgent alerts, following the settings.
- Tests:
  - A developer can't open or change someone else's request.
  - Internal notes never appear in the portal, in emails or in API responses for customers.
Stop when every role behaves as docs/01 describes.
```

## Phase 7 · Customers and users
**Done when:**
- An admin can add a customer with two projects.
- The customer gets the invitation, activates the account, and sees exactly those projects in the portal.

```text
Phase 7 from docs/04-build-plan.md: customers and users (screens 26–30).
- Customers list: summary, search, and view-only for managers.
- Add customer with one or more projects. It sends the invitation.
- Customer details: projects and Add project, requests, contact, "came from", account access, resend invitation, send password reset link.
- Users list with role tiles.
- Add user with role cards and the permission table. Admins can't add a super admin; show why.
- Resend invitation and disable user.
- Add audit log entries for these actions.
Stop when the flow in the "done when" list works end to end.
```

## Phase 8 · Website leads
**Done when:**
- A demo booked on the website shows up in the team panel.
- It can be confirmed, and the visitor gets an `.ics` invite in Mailpit.
- It can be completed and converted into a customer who can activate and sign in.
- The same works for a quote: estimate, won, convert.

```text
Phase 8 from docs/04-build-plan.md: website leads (screens 34–42, M6) and the public forms.
- Connect the website forms with Zod validation, a honeypot and per-IP rate limits. Create the DemoRequest, QuoteRequest or ContactMessage with its source page. Send the visitor a confirmation email and the team an in-app notification and email.
- Demo slots on the website: the next 10 weekdays, six slots in UK time. A scheduled demo makes its slot unavailable.
- Team panel: Demo requests, Quote requests and Messages lists (tabs with counts, search) and their detail pages (owner, contact, activity, and an Email / Internal note composer).
- Demo actions: confirm time and reschedule (a calendar invite email with an .ics file, in UK time), mark completed, cancel with a reason and optional email, reopen.
- Quote actions: start review, send or update an estimate (keep the history), mark won, mark lost with a reason and note, reopen.
- Messages: reply and close, and detect existing customers.
- Convert to customer: open Add customer prefilled, using the project type mapping in docs/01 section 6, and link the customer and the lead both ways.
- Give the dashboard's Website leads card and the sidebar badges real counts.
Stop when the flows in the "done when" list work.
```

## Phase 9 · Notifications and emails
**Done when:**
- Every row of docs/01 section 7 works.
- Preferences and settings are respected.
- `/dev/emails` previews every template.

```text
Phase 9 from docs/04-build-plan.md: notifications and emails.
- Check every row of the table in docs/01 section 7. Use branded React Email templates (navy header, gold accents) with plain-text versions.
- Respect customer email preferences and the team notification settings.
- Add the daily digest and the auto-close of resolved requests after 7 days (when the setting is on), as scheduled jobs.
- Add a development page /dev/emails that previews every template.
```

## Phase 10 · Reports and settings
**Done when:** screens 31 and 33 match, show real data, and saving the settings changes how the SLA is calculated.

```text
Phase 10 from docs/04-build-plan.md: reports and settings (screens 31 and 33).
- Reports from real data:
  - KPIs: average first response, average resolution time, resolved this month, reopened requests, each with the change against last month.
  - Charts and tables: requests this week, requests by project, developer performance.
- A settings page for super admins: response targets per priority (used for SLA due dates) and the four team notification switches. Add an audit log entry on save.
```

## Phase 11 · Quality and launch
**Done when:** the e2e journey passes, there are no serious accessibility issues, and the deployment guide works on a fresh environment.

```text
Phase 11 from docs/04-build-plan.md: quality and launch.
- A Playwright e2e test of the main journey:
  1. Book a demo, then confirm it.
  2. Convert the lead into a customer, who activates the account.
  3. The customer sends a request, an admin assigns it, a developer resolves it, and the customer confirms.
  Add role access checks too.
- Accessibility pass with axe on every screen, plus keyboard checks of dialogs and menus.
- Lighthouse on the website pages; fix image and font loading.
- Security review: policies, rate limits, uploads, tokens, security headers (CSP), secrets.
- Write docs/deploy.md covering the host, managed Postgres, email domain setup, S3 bucket, environment variables, migrations, and a script that creates the first super admin.
```
