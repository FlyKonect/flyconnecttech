---
paths:
  - "backend/src/email/**"
  - "backend/src/jobs/**"
  - "backend/src/**/*events.service.tsx"
  - "backend/src/notifications/**"
  - "backend/src/accounts/invitations.service.tsx"
  - "backend/src/accounts/password-reset.service.tsx"
---

## Notifications and emails (backend)
Every row of docs/01 §7, where it is sent from, what it follows, and where it is tested. In-app notifications are written inside the change's transaction; emails go after it and a failed email never undoes the change. SA, A, M = active super admins, admins, managers.

| §7 row | In-app | Email | Sent from | Follows | Tested in |
|---|---|---|---|---|---|
| Account locked after 10 wrong passwords (added in the audit) | — | The owner, with a link to Forgot password | `auth/locked-notice.tsx` | — | `accounts` |
| Email address changed by an admin (added in the audit) | — | New address: confirm link (48 h); old address: notice once confirmed | `accounts/email-change.service.tsx` | — | `customers` |
| Customer or team invitation | — | Invitee (48-hour link) | `accounts/invitations.service.tsx` | — | `accounts`, `customers` db tests |
| Password reset requested or sent by admin | — | The person | `accounts/password-reset.service.tsx` | — | `accounts`, `customers` |
| New support request | SA, A, M ("urgent" kind when Urgent) | Customer's copy; Urgent alert to SA, A | `requests/request-events.service.tsx` | setting `urgentAlert` | `portal`, `team` |
| Request assigned or transferred | Developer | Developer | `request-events` | — | `team` |
| Team reply to customer | Customer | Customer | `request-events` | customer "The team replies" | `team`, `portal` |
| Customer reply | Assignee, or SA, A when unassigned | Assignee | `request-events` | setting `notifyAssigneeOnReply` | `team`, `jobs` |
| Status changed / needs info / resolved / closed | Customer | Customer ("Resolved" asks to confirm) | `request-events` | customer "A status changes" | `team`, `portal`, `jobs` (auto-close) |
| Daily digest of requests waiting for review | — | SA, A, M (none when nothing waits) | `jobs/jobs.service.tsx` | setting `dailyDigest` | `jobs` |
| Weekly summary (added in Phase 9) | — | Customer (none when nothing to report) | `jobs/jobs.service.tsx` | customer "Weekly summary" | `jobs` |
| Project update posted (added after the design) | Customer ("project" kind) | Customer: "Update on {project}", with the progress and the number of files | `projects/project-events.service.tsx` | customer "A project update is posted" (on by default) | `projects` |
| Module ready for client review | Customer ("module" kind) | Customer: "Ready for your review: {module}" | `project-events` (`moduleReady`) | customer "A project update is posted" | `modules` |
| Customer approved a module or asked for changes | Lead and team developers, or SA, A | The same: "{module} approved" / "Changes requested on {module}" | `project-events` (`moduleDecided`) | — | `modules` |
| Discussion: new topic, reply, proposal, decision, asked | Everyone taking part ("discussion" kind) | The same (`email/templates/discussion.tsx`) | `projects/topic-events.service.tsx` | customer "A discussion reply is posted"; INTERNAL never to customers | `discussions` |
| Demo requested | SA, A, M | Visitor's copy; team alert to SA, A, M | `leads/lead-events.service.tsx` | — | `leads` |
| Demo confirmed or rescheduled | Owner and host (not the person who did it) | Visitor, with `.ics` | `lead-events` | — | `leads` |
| Demo cancelled | — | Visitor, if ticked (a CANCEL `.ics` if it was booked) | `lead-events` | the "Email {first}" tick | `leads` |
| Quote requested | SA, A, M | Visitor's copy; team alert | `lead-events` | — | `leads` |
| Estimate sent or updated | — | Visitor | `lead-events` | — | `leads` |
| Contact message received | SA, A, M | Team alert | `lead-events` | — | `leads` |
| Lead email from the composer | — | The lead's contact | `lead-events` | — | `leads` |

- **Every template** renders as HTML and plain text in the brand layout (`email/previews.spec.ts`).
- **Failed emails** (`email/email.service.ts`): `send()` tries at once; a failure is kept in `email_outbox` and still throws, so the caller can say "not sent". The `send-emails` job (every 5 minutes) tries again: 5 tries in all (waits 5 min, 15 min, 1 h, 3 h), then it waits on the team's **Failed emails** screen (`/team/failed-emails`, `GET /team/emails`, resend or dismiss; `emails.manage`: super admins and admins). Emails with a sign-in link (invitation, password reset) pass `retry: false` and are never kept: the link must not be stored readable. Sent and dismissed rows are deleted after 30 days. Every email has Reply-To info@flyconnecttech.co.uk; the customer request emails (`request-received`, `status-changed`, `team-reply`) show "Please reply in the client portal" (`portalNote` on `EmailLayout`). Tested in `test/db/emails.db-spec.ts`.
- **Data retention** (`jobs/retention.ts`, `JobsService.retention()`; the owner chose "keep longer"): every night the `auto-close` cron run also deletes read notifications older than 12 months, website leads never converted (no `customerId`) and closed/lost/cancelled more than 36 months ago (with their lead activities), Activity log entries older than 6 years, and sign-in limit rows older than a day. Requests, customers and projects are never deleted. `npm run job -- retention` runs it alone. The Privacy page (`legal.tsx`, "How long we keep it") says the same: keep them in step.
- **Customer data export** (UK GDPR): `GET /team/customers/:id/export.zip` (`customers.manage`; `customers/customer-export.service.ts`, built with `yazl`): README, profile, projects (never the team notes), project items (with their module), modules, the module timeline, customer discussions and their messages (never team discussions), project updates, requests and messages (only what the customer sees: never internal notes) as CSV, and their files under `files/<request code>/` and `files/projects/<project code>/` (discussion files in `discussion-<number>/`). Audit `export.downloaded` (`customer-data`). Button: the customer page's **Export** menu, "Download all data (ZIP)".
- **Scheduled jobs** (`jobs/jobs.service.tsx`, run by `cli/run-job.ts`): each is safe to run again. Auto-close moves Resolved requests whose `resolvedAt` is 7 days old to Closed through `moveStatus()` with no person (`actorId: null`), the line "Closed automatically 7 days after it was resolved", and the usual customer notification and email. Each request has its own transaction.
