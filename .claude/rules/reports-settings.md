---
paths:
  - "backend/src/reports/**"
  - "backend/src/settings/**"
  - "frontend/src/app/team/*/reports/**"
  - "frontend/src/app/team/*/settings/**"
  - "frontend/src/lib/team/targets.ts"
---

## Reports and settings (backend)
- **Reports** (`/team/reports`, `reports.view`: super admins, admins, managers) are worked out from the data, in UK months and weeks:
  - **Avg. first response:** arriving to the first team reply, for first replies this month (the dashboard's rule), against last month ("18% faster than October").
  - **Avg. resolution time:** arriving to Resolved, for requests resolved this month ("2.6 days", hours under a day), against last month ("0.4 days faster").
  - **Resolved this month** ("+6 vs last month"); **Reopened requests:** requests moved from Resolved or Closed back to In Progress this month (status history), shown as a share of resolved ("5% of resolved"), as in the design.
  - **Requests this week:** sent each day, Monday to Sunday (UK). **Requests by project:** the six projects with the most requests, all time. **Developer performance:** each active developer's requests sent this month, resolved this month and average first response this month.
  - The backend sends the words; a change for the better shows green, for the worse red.
- **Settings** (`/team/settings`, `settings.manage`: super admins only): the four response targets and the four switches, saved together. Targets are checked with the SLA's own `parseTarget()`, up to 30 business days. Each setting that changed gets a `settings.changed` audit entry with the old and new value. **New targets apply to new requests and to priority changes; requests already open keep their due time.**
