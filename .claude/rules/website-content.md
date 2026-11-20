---
paths:
  - "backend/src/website/**"
  - "frontend/src/lib/site-content*.ts"
  - "frontend/src/lib/team/website-content.ts"
  - "frontend/src/components/team/website-content.tsx"
  - "frontend/src/app/team/(app)/website-content/**"
  - "frontend/src/components/site/**"
---

## Website content (backend and website)
- **Who:** `website.manage`: super admins and admins (the Website content screen, `/team/website-content`).
- **Testimonials:** the `testimonials` table. Home shows the 3 newest with `showOnHome`; Case Studies the newest with `showOnCaseStudy`. Each section is hidden while it has none. Add, change and remove each get an audit entry (`testimonial.*`).
- **Live-project link:** the `website` setting (default `https://dev.flyconnect.co.uk`, `defaultWebsite` in `settings/defaults.ts`), saved with `SettingsService.saveWebsite()` and a `settings.changed` audit entry. Only full `https://`/`http://` addresses.
- **The website reads** `GET /website` (public) through `getSiteContent()`: `'use cache'` with the tag `site-content` and `cacheLife('minutes')`, so pages stay pre-built and refresh at least every minute. After a save the screen calls `refreshWebsite()` (`updateTag`), so the change shows at once. If the backend can't be reached (for example the GitHub build), pages use the default link and no testimonials.
