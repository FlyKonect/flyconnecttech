---
paths:
  - "backend/src/requests/**"
  - "backend/src/uploads/**"
  - "frontend/src/components/portal/**"
  - "frontend/src/components/team/*request*"
  - "frontend/src/app/portal/**"
  - "frontend/src/app/team/*/requests/**"
  - "frontend/src/lib/sla.ts"
  - "frontend/src/lib/uploads.ts"
---

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
  - **Edit details** (`requests.edit`: super admins, admins, managers; `POST /team/requests/:code/details` with any of `title`, `type`, `projectId`): the project must be the same customer's (`NOT_THEIR_PROJECT`); the line reads "{name} changed the title, the type to …, the project to …"; audit `request.updated` with the old values. The detail sends `can.edit` and `projectChoices`.
- **Reopen window:** customers reopen a Closed request only within `requestRules.reopenWithinDays` (14) of `closedAt`; later, `customerActionsFor()` leaves Reopen out, `act()` answers 409 `REOPEN_TOO_LATE`, and the portal shows "Start a new request". Resolved requests can always be reopened ("I still need help").
- **SLA:** `requests/sla.ts`, two clocks. **Reply** (`dueAt`, from `responseTargets`) stops at the first team reply (`firstResponseAt`). **Fix** (`resolveDueAt`, from `resolutionTargets`: 1bd, 3bd, 5bd, 10bd by default) is Met when resolved before it. Targets are "4h" or "1bd"; business days are Monday to Friday in UK time, not counting the bank holidays in `slaCalendar`. Both pause while Waiting for Customer and move later by the wait; a reopened request gets fresh due times for both; a priority change works both out again from the creation time. `activeDueAt()` is the clock that counts now (reply until the first reply, then fix). Requests made before the fix clock have `resolveDueAt` empty: only their reply clock shows. All SLA maths takes `SlaRules` from `SettingsService.slaRules()`.
- **Who hears about what:** `RequestEventsService`. In-app notifications are written inside the change's transaction; emails go after it, follow the customer's "Email me when" choices (`accounts/email-prefs.ts`), and a failed email never undoes the change. The team's emails: assigned (always), customer replied (setting `notifyAssigneeOnReply`), urgent request to super admins and admins (setting `urgentAlert`).
- **Dashboard numbers** (`requests/team-dashboard.service.ts`): open = not Resolved or Closed; at risk = Submitted, Under Review or In Progress with less than an hour left or past due on the clock that counts (reply before the first reply, fix after); average first response = from arriving to the first team reply, for first replies in the month (UK months, `dashboard-math.ts`). Developers' numbers count only their own requests.
- **Files:** up to 5 per request, customer reply, staff reply or internal note (the team route `POST /team/requests/:code/messages` takes multipart `kind`, `body`, `files`; text may be empty when files come; files on a note stay with the note, so the portal never lists them), 10 MB each, checked by name, browser type and first bytes (`uploads/upload-rules.ts`). Kept as `UPLOAD_DIR/requests/<request id>/<random id>`; the name and type are in the `attachments` table. Routes that take files use `FilesInterceptor` then `CleanUploadsInterceptor`, which deletes whatever is left in `tmp/`. Downloads are always "attachment" with `nosniff`.
- **Request transactions** use read committed (`REQUEST_TX`), like the account ones.
