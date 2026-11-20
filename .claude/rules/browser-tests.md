---
paths:
- "frontend/e2e/**"
- "frontend/playwright.config.ts"
---

## Browser tests (Playwright)
Browser tests can target a running site: `E2E_BASE_URL=https://… npm run test:e2e`. Without it Playwright starts (or reuses) its own backend and website on ports 4100 and 3101.
- **Browsers:** Chromium always. With `E2E_ALL_BROWSERS=1` two more projects run: `webkit` (Safari: `layouts`, `portal`, `website`) and `iphone` (iPhone 15: `website`). `.github/workflows/nightly-browsers.yml` runs those every night (03:00 UTC); they never stop a deploy. Locally: `npx playwright install webkit`, then `E2E_ALL_BROWSERS=1 npx playwright test --project=webkit --project=iphone`. Safari does not focus a clicked button: test focus return by opening dialogs from the keyboard. Fill a form only once the page is ready (for example after a file chip shows), or Safari can reset what was typed.
- Make test people with `createPerson(role)` and `signInBrowser()` from `e2e/support/accounts.ts`; read emails with `waitForEmail()` from `e2e/support/mailpit.ts`.
- Request helpers in `e2e/support/portal.ts`: `addProject()` (the `project:add` command), `sendRequest()`, `postAs(person, path, body)` for a team action through the backend (assign, request-info, resolve…), and `idOf(person)`.
- `waitForEmail()` also lists an email's attachments (the demo invite's `invite.ics`).
- A test that books a demo and confirms it takes that time in the test database until it is completed: pick a time no other test uses (the website test uses the first day at 14:00; the leads test the last day).
- The test database keeps every run's data, and every test person has the same name ("Test developer"): pick by role or code, not by position in a list.
- `journey.spec.ts` is the main journey (demo → customer → request → assigned → resolved → confirmed); `access.spec.ts` checks which pages each role reaches; `website-content.spec.ts` goes from the team screen to the website; `a11y.spec.ts` runs axe on every screen (serious and critical findings fail) and the keyboard checks of dialogs and menus. `createPerson(role, name)` takes a name when a test must pick that person out of a list.
- Next.js keeps pages you left in the page, hidden. Pick fields with the visible-only `field()` helper and form errors by `[data-slot=form-error]`, as in `e2e/accounts.spec.ts`, or a test finds two matches.
