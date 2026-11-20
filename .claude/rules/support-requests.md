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
- **SLA:** `requests/sla.ts`. The due time comes from the `responseTargets` setting ("4h", "1bd"; business days are Monday to Friday in UK time). Paused while Waiting for Customer: the due time moves later by the time spent waiting. A reopened request gets a fresh due time.
- **Who hears about what:** `RequestEventsService`. In-app notifications are written inside the change's transaction; emails go after it, follow the customer's "Email me when" choices (`accounts/email-prefs.ts`), and a failed email never undoes the change. The team's emails: assigned (always), customer replied (setting `notifyAssigneeOnReply`), urgent request to super admins and admins (setting `urgentAlert`).
- **Dashboard numbers** (`requests/team-dashboard.service.ts`): open = not Resolved or Closed; at risk = Submitted, Under Review or In Progress with less than an hour left or past due; average first response = from arriving to the first team reply, for first replies in the month (UK months, `dashboard-math.ts`). Developers' numbers count only their own requests.
- **Files:** up to 5 per request or reply, 10 MB each, checked by name, browser type and first bytes (`uploads/upload-rules.ts`). Kept as `UPLOAD_DIR/requests/<request id>/<random id>`; the name and type are in the `attachments` table. Routes that take files use `FilesInterceptor` then `CleanUploadsInterceptor`, which deletes whatever is left in `tmp/`. Downloads are always "attachment" with `nosniff`.
- **Request transactions** use read committed (`REQUEST_TX`), like the account ones.
