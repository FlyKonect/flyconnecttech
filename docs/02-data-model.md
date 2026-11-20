# 02 · Data model

PostgreSQL with Prisma.

- Use UUID primary keys everywhere, plus readable codes where the spec shows one.
- Store timestamps in UTC (`timestamptz`).
- Store money in integer cents with a currency.
- Name tables and columns in plain English.

Better Auth generates its own tables (user, session, account, verification, two-factor). Generate them with its CLI, then add the extra user fields below to its `User` model. Don't hand-write the auth tables.

## Enums

| Enum | Values |
|---|---|
| `Role` | SUPER_ADMIN, ADMIN, MANAGER, DEVELOPER, CUSTOMER |
| `UserStatus` | INVITED, ACTIVE, DISABLED |
| `ProjectType` | WEBSITE, WEB_APPLICATION, TRAVEL_BOOKING_PLATFORM, AGENT_PORTAL, API_INTEGRATION, CUSTOM_SOFTWARE, UI_UX_DESIGN, MAINTENANCE_PLAN |
| `ProjectStatus` | PLANNING, IN_DESIGN, IN_DEVELOPMENT, LIVE, COMPLETED |
| `RequestType` | TECHNICAL_ISSUE, BUG_REPORT, FEATURE_REQUEST, INTEGRATION_PROBLEM, DESIGN_MODIFICATION, GENERAL_INQUIRY, MAINTENANCE_REQUEST |
| `Priority` | LOW, MEDIUM, HIGH, URGENT |
| `RequestStatus` | SUBMITTED, UNDER_REVIEW, IN_PROGRESS, WAITING_FOR_CUSTOMER, RESOLVED, CLOSED |
| `MessageKind` | CUSTOMER_REPLY, STAFF_REPLY, INTERNAL_NOTE, SYSTEM |
| `DemoTopic` | TRAVEL_BOOKING_PLATFORM, AGENT_ADMIN_DASHBOARDS, CUSTOM_SOFTWARE_WEBSITES, API_INTEGRATIONS |
| `DemoStatus` | NEW, SCHEDULED, COMPLETED, CANCELLED |
| `QuoteProjectType` | TRAVEL_BOOKING_PLATFORM, AMADEUS_SABRE_INTEGRATION, NEW_WEBSITE, WEBSITE_REDESIGN, CUSTOM_SOFTWARE, UI_UX_DESIGN, API_INTEGRATION, OTHER |
| `Budget` | UNDER_5K, FROM_5K_TO_15K, FROM_15K_TO_50K, OVER_50K, NOT_SURE |
| `Timeline` | ASAP, WITHIN_1_3_MONTHS, WITHIN_3_6_MONTHS, NOT_SURE |
| `QuoteStatus` | NEW, REVIEWING, ESTIMATE_SENT, WON, LOST |
| `MessageTopic` | GENERAL_QUESTION, PARTNERSHIP, EXISTING_PROJECT, SOMETHING_ELSE |
| `ContactStatus` | NEW, REPLIED, CLOSED |
| `LeadType` | DEMO, QUOTE, MESSAGE |
| `LeadActivityKind` | SYSTEM, EMAIL, NOTE |

Keep the display labels (for example "Waiting for Customer", "£5k – £15k") in one place, `src/lib/labels.ts`.

## Entities

### User (extends the Better Auth user)
- **Fields:**
  - `id`, `email`, `name`, `emailVerified`
  - `side: AccountSide` (`CUSTOMER` or `TEAM`, from the role): which sign-in page the account belongs to. **Customer and team accounts are separate:** one email can have one customer account and one team account, each with its own password, invitation and password reset. `email` is unique within a side (`@@unique([email, side])`).
  - `loginEmail` (unique): Better Auth's "email", a private key made from the side and the email (`backend/src/accounts/login-key.ts`: "c." or "t.", the SHA-256 of the lower-case email, "@accounts.invalid"). People never see it; each sign-in page sends its side and the backend turns the typed email into this key.
  - `phone?`, `role: Role`, `status: UserStatus`
  - `jobTitle?` (staff), `country?`, `timezone` (default `Europe/London`)
  - `customerId?`: set only for role CUSTOMER, and unique
  - `twoFactorEnabled` (staff must enable it)
  - `emailPrefs Json`: replies, status changes, weekly summary
  - `lastActiveAt?`, `invitedAt?`, `activatedAt?`, `createdById?`
  - `createdAt`, `updatedAt`
- **Indexes:** `role, status`; unique `email, side`; unique `loginEmail`.

### Invitation
- **Fields:**
  - `id`, `userId`, `tokenHash` (unique), `expiresAt` (48 hours)
  - `usedAt?`, `revokedAt?`
  - `sentById`, `sentAt`
- Resending revokes the open invitations for that user.

### Customer
- **Fields:**
  - `id`, `company`, `country?`
  - `contactUserId`: the CUSTOMER user, one per customer
  - `createdById`
  - `sourceLeadType? : LeadType`, `sourceLeadId?`: set when converted from a lead
  - `createdAt`
- The status shown in the design (Invited or Active) comes from the contact user's status.

### Project
- **Fields:**
  - `id`, `code` (unique, `P-1042`), `name`
  - `type: ProjectType`, `status: ProjectStatus` (default PLANNING)
  - `customerId` (required: a project belongs to exactly one customer)
  - `createdAt`

### SupportRequest
- **Fields:**
  - `id`, `code` (unique, `TKT-2026-00125`)
  - `title`, `description`, `url?`
  - `type: RequestType`, `priority: Priority`, `status: RequestStatus`
  - `projectId`, `customerId`. On write, check that the project belongs to the customer.
  - `assigneeId?`: must be a DEVELOPER
  - `dueAt?`, `slaPausedAt?`, `firstResponseAt?`, `resolvedAt?`, `closedAt?`
  - `createdAt`, `updatedAt`
- **Indexes:** `status`, `assigneeId`, `customerId`, `projectId`, `priority`.

### RequestMessage
- **Fields:** `id`, `requestId`, `authorId?` (null for SYSTEM), `kind: MessageKind`, `body`, `createdAt`.
- Customers can only ever read CUSTOMER_REPLY, STAFF_REPLY and SYSTEM messages.

### RequestStatusChange
- **Fields:** `id`, `requestId`, `from?`, `to`, `byId?`, `createdAt`. This is the status history.

### Attachment
- **Fields:**
  - `id`, `requestId`, `messageId?`
  - `fileName`, `contentType`, `size`, `storageKey`
  - `uploadedById`, `createdAt`

### DemoRequest
- **Fields:**
  - `id`, `code` (`DEM-2026-031`), `status: DemoStatus`
  - `topic: DemoTopic`, `preferredStart` (UTC instant of the slot the visitor picked)
  - `scheduledStart?`, `hostId?`, `videoLink?`
  - `name`, `email`, `company`, `phone?`, `notes?`, `sourcePage`
  - `ownerId?`, `cancelReason?`
  - `customerId?`: set after conversion
  - `createdAt`, `updatedAt`
- **Unique:** `scheduledStart` where status = SCHEDULED. One demo per slot: use a partial unique index in SQL, or check it in a transaction.

### QuoteRequest
- **Fields:**
  - `id`, `code` (`QUO-2026-044`), `status: QuoteStatus`
  - `projectType: QuoteProjectType`, `budget: Budget`, `timeline?: Timeline`
  - `name`, `email`, `company?`, `phone?`, `requirements`, `sourcePage`
  - `ownerId?`, `lostReason?`
  - `customerId?`
  - `createdAt`, `updatedAt`

### Estimate
- **Fields:**
  - `id`, `quoteRequestId`
  - `amountCents`, `currency` (default `GBP`)
  - `deliveryTime`, `validUntil` (date), `summary`
  - `sentById`, `sentAt`
- The newest estimate is the current one. Older ones are history.

### ContactMessage
- **Fields:**
  - `id`, `code` (`MSG-2026-019`), `status: ContactStatus`
  - `topic: MessageTopic`, `name`, `email`, `message`, `sourcePage`
  - `ownerId?`
  - `customerId?`: matched by email
  - `createdAt`, `updatedAt`

### LeadActivity
- **Fields:**
  - `id`, `leadType: LeadType`, `leadId`
  - `kind: LeadActivityKind`, `authorId?`, `body`, `createdAt`
- **Index:** `leadType, leadId, createdAt`.

### Notification
- **Fields:**
  - `id`, `userId`
  - `kind`: reply, info, status, ok, closed, urgent, new, high, review, invite, lead
  - `text`, `href`, `readAt?`, `createdAt`
- **Index:** `userId, readAt`.

### Setting
- **Fields:** `key` (primary key), `value Json`, `updatedById`, `updatedAt`.
- **Keys:**
  - `responseTargets`: `{ URGENT: '1h', HIGH: '4h', MEDIUM: '1bd', LOW: '2bd' }`
  - `teamNotifications`: `{ urgentAlert: true, notifyAssigneeOnReply: true, dailyDigest: true, autoCloseResolvedAfter7Days: false }`
  - `website`: `{ liveProjectUrl: 'https://dev.flyconnect.co.uk' }`: where the website's "View live project" buttons go (Website content screen).

### Testimonial
A client's quote shown on the public website, managed on the Website content screen.
- **Fields:**
  - `id`
  - `quote` (up to 400 characters), `name`, `role?`, `company?`
  - `showOnHome` (default true), `showOnCaseStudy` (default false)
  - `createdById?`, `createdAt`, `updatedAt`
- **Shown:** Home takes the 3 newest with `showOnHome`; Case Studies the newest with `showOnCaseStudy`.

### AuditLog
- **Fields:** `id`, `actorId?`, `action`, `entityType`, `entityId`, `data Json`, `createdAt`.
- **Actions to record:** user invited, role changed, user disabled, customer created, invitation resent, settings changed, lead converted, testimonial added, changed or removed.

### Counter
- **Fields:** `name` (for example `TKT-2026`), `value`. Increment it in the same transaction that creates the record, to produce the readable codes.

## Relations at a glance
- Customer has one contact user (CUSTOMER) and many projects. A project has many support requests.
- Each support request has messages, status changes and attachments. Its assignee is a DEVELOPER user.
- Demo requests, quote requests and contact messages are leads. They can each have an owner (a non-developer staff user), activity entries, and a customer once converted. A quote request has many estimates.
- Users have notifications.
- Testimonials stand alone; each remembers who added it.

## Seed (`prisma/seed.ts`)
- Load `design/sample-data.json` so the app opens with the same people, projects, requests and leads as the design.
- In the design, "today" is Monday 9 November 2026. Convert labels like "Today, 09:12" and "8 Nov 2026" to real timestamps relative to the seed date.
- Create a development password for every seeded user and print it once in the console. Never commit real passwords.
