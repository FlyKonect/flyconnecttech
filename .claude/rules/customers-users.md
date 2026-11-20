---
paths:
  - "backend/src/accounts/**"
  - "backend/src/customers/**"
  - "frontend/src/components/team/*user*"
  - "frontend/src/components/team/*customer*"
  - "frontend/src/components/team/previous-account-dialog.tsx"
  - "frontend/src/app/team/*/customers/**"
  - "frontend/src/app/team/*/users/**"
  - "frontend/src/lib/team/forms.ts"
---

## Customers and users (backend)
- **Customers:** managers may look (`customers.view`); only super admins and admins add customers and projects, change a project's status, resend invitations and send reset links (`customers.manage`). Developers get nothing ("not found" in the website).
- **Add customer** goes through `InvitationsService.inviteUser()` with the projects: the customer, its contact (Invited) and the projects (codes from `nextCode`) are saved in one transaction, then the invitation email lists the projects. A failed email keeps the customer; the page says to use Resend invitation. An email already used by another customer account answers `EMAIL_TAKEN` (a team account with the same email does not count).
- **A customer's status** is its contact person's (Invited, Active, Disabled).
- **Users:** super admins and admins only. Who may add, resend to or disable whom follows `canInviteRole()`: admins never act on a super admin. `GET /team/users/roles` gives the Add user screen the roles this person may give and the permission table from `policies.ts`.
- **Disable user:** status Disabled, every session deleted, open invitations and reset links stop working, audit entry. Not yourself. Their open work is released in the same transaction (`AccountDeletionService.releaseWork()`, shared with Delete): open requests go to `transferTo` (body, optional: an active developer, not them; otherwise 409 `NOT_A_DEVELOPER`), with the line "Transferred from A to B by Y (A's account was disabled)" and one notification to B, or, with nobody chosen, back to Under Review unassigned ("Unassigned because A's account was disabled"); open leads they owned and demos they hosted go back to nobody. The audit entry lists the request codes. The Disable dialog shows the count and "Who takes over". There is no re-enable.
- **Delete user / Delete customer** (`users.delete`, `customers.delete`: super admins and admins; same limits as Disable; `accounts/account-deletion.service.ts`): the account goes for good: status `DELETED`, sessions, password, two-factor, invitation and reset links removed, personal details and notifications erased, `email`/`loginEmail` replaced by a private address so the real email is free, the old one kept in `deletedEmail`. The row stays so history keeps its author, its name marked "(deleted)" (`deleted-marks.ts`). A deleted team member's open requests go back to Under Review unassigned (with a line), and open leads/demos they owned or hosted go back to nobody. A deleted customer leaves the lists (`customers.deletedAt`, name marked "(deleted)") and its open requests are closed with a line (no email). Lists and lookups never show deleted accounts. **Adding the same email again on the same side** answers `PREVIOUS_ACCOUNT` (409, with name, date and counts) until the request says `previous: "restore"` (the same row comes back, with its history, customer, projects and requests, and a new invitation) or `"fresh"` (a new account; the old one is not offered again). The screens ask with `PreviousAccountDialog` (`components/team/previous-account-dialog.tsx`).
