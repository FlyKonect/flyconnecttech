# Frontend (Next.js 16): rules and layout

Loaded when working in `frontend/`. The root `CLAUDE.md` has the product, the shared rules and how we work. Next.js 16 is newer than most examples: read `frontend/AGENTS.md` and the guide in `node_modules/next/dist/docs/` before using an API you haven't used here. Feature rules (requests, leads, customers and users, emails, website content, browser tests) are in `.claude/rules/` and load with their files.

## Stack

- Next.js 16 (App Router, React Server Components), TypeScript with `strict`.
- Tailwind CSS 4 and shadcn/ui (Radix). Theme tokens from `docs/03-design-system.md`, set in `src/app/globals.css`.
- Inter and Inter Tight through `next/font`.
- Zod for every input. react-hook-form on the client.
- Vitest for unit tests, Playwright for end-to-end tests, with axe (`@axe-core/playwright`) for the accessibility checks. ESLint, Prettier.
- It has no database access. It gets everything from the backend (`NEXT_PUBLIC_API_URL`).

## Commands (in `frontend/`, http://localhost:3001)

- `npm run dev`: start the website
- `npm run build`, `npm run start`
- `npm run typecheck`
- `npm run lint`
- `npm run format` (`format:check` to only check)
- `npm test`: unit tests
- `npm run test:e2e`: browser tests. They start their own backend (port 4100, database `flyconnect_tech_e2e`) and website (port 3101, built into `.next-e2e`) and read emails from Mailpit, so `docker compose up -d` must be running. Your own dev servers and database are not touched.

## Folder layout

- `frontend/src/app/(site)/`: website pages
- `frontend/src/app/portal/(app)/`: client portal pages that have the sidebar. Sign-in and invitation screens go in `portal/` outside `(app)`, so they get no sidebar.
- `frontend/src/app/team/(app)/`: team panel pages that have the sidebar. Team sign-in goes outside `(app)`.
- `frontend/src/app/dev/components/`: every shared component on one page. Development only (404 on the live site).
- `frontend/src/app/invite/[token]`, `frontend/src/app/reset-password/[token]`: account activation and password reset
- `frontend/src/components/ui/`: shared components (button, field, pill, card, tabs, choice, dialog, toast, banner, avatar, kpi-tile, data-table (pages of 25 by default, rows per page, page buttons), stepper, notification-row, file-chip, status-history, row-menu)
- `frontend/src/components/portal/`: the client portal's pieces (shell, my requests, the one-page new request form, conversation, reply box, profile forms)
- `frontend/src/components/team/`: the team panel's pieces (shell, dashboard parts, requests list, conversation with notes, composer, status panel and buttons, assign, resolve and request-info dialogs, customers list, Add customer, customer page buttons, users table with its "⋯" menu, Add user, "What a … can do" for the chosen role, the website leads lists, a lead's page, its buttons, owner and composer, and the Confirm demo, Cancel demo, Estimate and Lost dialogs)
- `frontend/src/lib/team/forms.ts`: the Add customer, Add project and Add user rules, with the design's error wording
- `frontend/src/lib/team/leads.ts`: a lead page's words and rules from the design: banners, fact tiles, suggested emails, "How this works" and the buttons for each status
- `frontend/src/lib/team/targets.ts`: response targets in words ("4 hours", "1 business day") and their saved short form ("4h", "1bd")
- `frontend/src/lib/team/website-content.ts`: the Website content screen's rules and words (kept in step with the backend's `website-rules.ts`); the screen is `components/team/website-content.tsx`, its page `app/team/(app)/website-content/` with the `refreshWebsite()` server action
- `frontend/src/lib/site-content.ts`: what the public website shows from Website content (types, checks, fallback); `site-content-cache.ts` has `getSiteContent()`, the cached copy the pages read
- `frontend/src/lib/contact.ts`: the public email (info@flyconnecttech.co.uk)
- `frontend/src/components/site/live-project-link.tsx`: every "View live project" link (the saved address); `testimonial-card.tsx`: one Home testimonial
- `frontend/src/components/site/pages/legal.tsx`: the Privacy, Terms and Cookies pages (`/privacy`, `/terms`, `/cookies`) and Legal Entity and Ownership (`/legal-entity-and-ownership`, linked from the footer)
- `frontend/src/components/shell/`: shared by both areas: the frame, the notifications list, the page loading placeholder
- `frontend/src/components/shell/app-shell.tsx`: the sidebar-and-header frame shared by the portal and the team panel
- `frontend/src/components/shell/user-menu.tsx`: the name at the right of the header; a click opens Profile settings and Logout (both areas)
- `frontend/src/components/portal/profile-forms.tsx`: Profile settings and Change password for both areas (`area="portal"` with the email choices, `area="team"` with role and job title read-only); the time zone list is `lib/time-zones.ts`
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
- `frontend/src/components/auth/`: sign-in, invitation, password reset and two-factor forms. Team sign in has two steps (`team-sign-in-form.tsx`: password, then the code or a backup code). Next.js keeps pages you leave alive and shows them again as they were, so the sign-in forms and the account menu are keyed on `useVisitKey()` (`use-visit-key.ts`): they come back empty and closed, not with the last person's password or a stuck "Signing out…"
- `frontend/src/proxy.ts`: sends visitors with no session cookie to the right sign-in page
- `frontend/e2e/`: Playwright tests

## Frontend conventions

- **Use the shared components.** Check `/dev/components` (run the frontend, open http://localhost:3001/dev/components) before building a new piece. Add new shared components to that page.
- **Emails:** `/dev/emails` (development only) shows every email as sent and as plain text, from the backend's `/dev/emails`. The backend must be running.
- **Pills:** `<LabelPill group="requestStatus" value="IN_PROGRESS" />`. Labels and colours come from `labels.ts`.
- **Screen sizes** (Tailwind variants, set in `globals.css`): `site:` 860px and `nav:` 1280px for the website, `app:` 900px for the portal and team panel. Use `max-app:` and so on for "below". The design's full-menu width is 1180px; it is 1280px here because the FlyConnect Tech logo is wider and the header also holds Support and Client login (the gold top bar was removed at the client's request; Contact is left out of the wide header because Get a quote opens the same page). From `nav:` the header row may use up to 1360px, with 24px side padding; the full header needs about 1265px with a scrollbar.
- **Website pages** (`components/site/pages/*.tsx`) were converted once from `design/source/website-*.dc.html` and keep the design's inline styles, so they match it exactly. Edit them by hand like any other component. Their root has the class `design-page`, which makes styled elements measure boxes the design's way (padding outside the width, see `globals.css`). Keep both.
- **Book a demo:** any button opens the one dialog through `<DemoButton>` (`components/site/demo/`). The header button is `book-demo-button.tsx`.
- **Website forms** (demo, quote, message) use react-hook-form with the Zod rules in `lib/forms/schemas.ts` and the website field style in `components/site/forms/site-field.tsx`. They call `submitLead()` in `lib/forms/submit.ts`, which posts to the backend's `/leads/…` routes with the page it was sent from and the hidden honeypot field (`<Honeypot>`).
- **Demo times:** `lib/forms/demo-slots.ts` (next 10 weekdays, six slots, UK time, stored as UTC). Book a demo asks `/leads/demo-slots` which times a scheduled demo holds and crosses them out.
- **Signed-in pages:** the `(app)` layouts call `requireCustomer()` or `requireTeamMember()` from `lib/auth/server.ts`, which ask the backend who is signed in (`/me`) and send everyone else to the right page. `proxy.ts` only checks that a cookie exists; the backend makes the real decision.
- **Pages whose address has a changing part** (like `[code]`) sit under a layout that reads the address, so the shells are wrapped in `Suspense` in their layout files. Keep that.
- **Signed-in pages read their data inside their own `<Suspense fallback={<PageLoading />}>`** (see any page in `portal/(app)/`): a server component calls `serverApi()`, and the page's default export wraps it. Without it Next.js reports that moving between pages is not instant (a boundary higher up does not cover a move between two sibling pages).
- **Buttons and forms on signed-in pages** call the backend from the browser with `apiFetch()`, show a toast, then `router.refresh()` so the page and the sidebar numbers update.
- **Times** shown to signed-in people use `lib/format-time.ts` with their profile's time zone (`me.timezone`).
- **Browser tests:** see `.claude/rules/browser-tests.md` (loads with `frontend/e2e/`).
- **If styles look stale** after changing `globals.css`, restart `npm run dev`.

## Signed-in visitors (frontend)

- **The sign-in pages** (sign in, forgot password, invitation help, invitation and reset links) start with `<RedirectIfSignedIn />` (`components/auth/redirect-if-signed-in.tsx`): someone signed in goes to `homeFor(me)`.
- **The website** is pre-built, so it finds out after loading: `useSignedInArea()` (`lib/auth/signed-in-area.ts`) asks the public `GET /me/status` (always 200, only `{ area }`), once for the header, footer and page. `<AccountLink>` turns "Client login" into "Client portal" / "Team panel"; `<HideWhenSignedIn>` hides "Open my invitation" (`components/site/account-link.tsx`).

## Logo

- The logo is "Crew Wings": gold wings around a navy node, "FlyConnect" in navy and "Tech" in gold.
- Always use `<Logo />` from `frontend/src/components/brand/logo.tsx`. Variants: `horizontal` (default), `stacked`, `symbol`. Add `onNavy` on navy backgrounds.
- Files: `frontend/public/brand/` (copies in `design/assets/flyconnect-tech/`). Browser tab icons: `frontend/src/app/icon.svg`, `favicon.ico`, `apple-icon.png`.
- The kit's `northstack-mark*.svg` files and the Northstack logo in the screenshots are replaced by this logo everywhere.
