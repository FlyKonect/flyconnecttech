---
paths:
  - "backend/src/leads/**"
  - "frontend/src/lib/team/leads.ts"
  - "frontend/src/components/team/lead*"
  - "frontend/src/app/team/*/leads/**"
  - "frontend/src/components/site/demo/**"
  - "frontend/src/components/site/forms/**"
  - "frontend/src/lib/forms/**"
---

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
