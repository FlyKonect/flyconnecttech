# 05 · Screens and routes

Screenshots are in `design/screens/`. Codes like `TKT-2026-00118` appear in URLs as they are; the database uses UUIDs internally.

## Website (`design/screens/website/`)

| # | Page | Route | Screenshots |
|---|---|---|---|
| 01 | Home | `/` | `01-home-desktop.jpg`, `01-home-phone.jpg` |
| 02 | Products & Solutions | `/solutions` | `02-products-solutions-*` |
| 03 | Travel Technology | `/travel-technology` | `03-travel-technology-*` |
| 04 | Services | `/services` | `04-services-*` |
| 05 | Website Development | `/services/website-development` | `05-website-development-*` |
| 06 | UI/UX Design | `/services/ui-ux-design` | `06-ui-ux-design-*` |
| 07 | API Integrations | `/services/api-integrations` | `07-api-integrations-*` |
| 08 | Case Studies | `/case-studies` (FlyConnect) | `08-case-studies-*` |
| 09 | About Us | `/about` | `09-about-us-*` |
| 10 | Contact & Quote | `/contact` (`#form` opens the quote tab) | `10-contact-quote-*` |
| 11 | Support | `/support` | `11-support-*` |
| — | Privacy policy, Terms of use, Cookie policy | `/privacy`, `/terms`, `/cookies` | none (in the Support page's style) |
| — | Legal Entity and Ownership | `/legal-entity-and-ownership` | none (in the legal pages' style) |

Dialogs and form states (there is no separate route for these):

| # | What | Screenshot |
|---|---|---|
| 12–15 | Book a demo: what to see, date and time, your details, confirmation. It opens from any Book a demo button. | `12-book-a-demo-step-1-what-to-see.jpg` to `15-book-a-demo-confirmation.jpg` |
| 16 | Get a quote with validation errors (Contact page) | `16-get-a-quote-validation.jpg` |
| 17 | Get a quote sent (success state) | `17-get-a-quote-sent.jpg` |
| 18 | Send a message tab (Contact page) | `18-send-a-message.jpg` |

## Accounts (`design/screens/portal/`)

| # | Screen | Route | Screenshot |
|---|---|---|---|
| 01 | Sign in (customers) | `/portal/sign-in` | `01-sign-in.jpg`, `m1-mobile-sign-in.jpg` |
| 02 | Invitation email | Email template `emails/invitation.tsx` | `02-invitation-email.jpg` (the email content in the middle of the screen) |
| 03 | Verify email and set password | `/invite/[token]` | `03-verify-email-and-set-password.jpg` |
| 04 | Forgot password | `/portal/forgot-password` (and `/team/forgot-password`) | `04-forgot-password.jpg` |
| 05 | Reset password | `/reset-password/[token]` | `05-reset-password.jpg` |
| 16 | Team sign in (step 1; step 2 "Enter your code" is not designed: it uses the same card) | `/team/sign-in` | `16-team-sign-in.jpg` |
| — | Two-factor setup (not designed) | `/team/two-factor` | Use the design system |
| — | Invitation help (not designed) | `/portal/invitation` | Use the design system |

## Client portal

| # | Screen | Route | Screenshot |
|---|---|---|---|
| 06 | Overview | `/portal` | `06-customer-dashboard.jpg`, `m2-mobile-dashboard.jpg` |
| 07–10 | New request: project, type, details, review | `/portal/requests/new` (step in state or `?step=`) | `07-…` to `10-…`, `m3-mobile-new-request.jpg` |
| 11 | Request submitted | `/portal/requests/[code]/submitted` | `11-request-submitted.jpg` |
| 12 | My requests | `/portal/requests` | `12-my-requests.jpg` |
| 13 | Request conversation | `/portal/requests/[code]` | `13-request-conversation.jpg`, `m4-mobile-request.jpg` |
| — | My Projects: each project's status and progress | `/portal/projects` | none (built from the portal's cards and pills) |
| — | One project, view only: what's included, updates, details | `/portal/projects/[code]` | none (built like the customer details screen) |
| 14 | Notifications | `/portal/notifications` | `14-notifications.jpg` |
| 15 | Profile and password | `/portal/profile` | `15-profile-and-password.jpg` |

## Team panel

| # | Screen | Route | Screenshot |
|---|---|---|---|
| 17–20 | Dashboards: Super admin, Admin, Manager, Developer | `/team` (content depends on role) | `17-…` to `20-…`, `m5-mobile-developer-dashboard.jpg` |
| 21 | All requests | `/team/requests` (`?status=` for the sidebar filters) | `21-all-requests.jpg` |
| 22 | Request review | `/team/requests/[code]` | `22-request-review.jpg` |
| 23 | Assign developer (dialog) | same page | `23-assign-developer.jpg` |
| 24 | Developer reply and internal note | same page, as a developer | `24-developer-reply-and-internal-note.jpg` |
| 25 | Resolve (dialog) | same page | `25-developer-resolve-request.jpg` |
| 26 | Customers | `/team/customers` | `26-customers.jpg` |
| 27 | Add customer | `/team/customers/new` | `27-add-customer.jpg` |
| 28 | Customer details | `/team/customers/[id]` | `28-customer-details.jpg` |
| — | Projects: every customer's projects, with tabs and progress | `/team/projects` | none (built from the Customers screen's parts) |
| — | Add project | `/team/projects/new` (`?customer=<id>` from a customer's page) | none (built from Add customer's parts) |
| — | Project page: details, what's included, updates, team notes, delete and restore | `/team/projects/[code]` | none (built from the customer details screen's parts) |
| 29 | Users | `/team/users` | `29-users.jpg` |
| 30 | Add user | `/team/users/new` | `30-add-user.jpg` |
| 31 | Reports and analytics | `/team/reports` | `31-reports-and-analytics.jpg` |
| 32 | Team notifications | `/team/notifications` | `32-team-notifications.jpg` |
| 33 | Settings (Super admin) | `/team/settings` | `33-settings-super-admin.jpg` |
| 34 | Demo requests | `/team/leads/demos` | `34-demo-requests.jpg`, `m6-mobile-demo-requests.jpg` |
| 35 | Demo request details | `/team/leads/demos/[code]` | `35-demo-request-details.jpg` |
| 36 | Confirm demo time (dialog) | same page | `36-confirm-demo-time.jpg` |
| 37 | Quote requests | `/team/leads/quotes` | `37-quote-requests.jpg` |
| 38 | Quote request details | `/team/leads/quotes/[code]` | `38-quote-request-details.jpg` |
| 39 | Send estimate (dialog) | same page | `39-send-estimate.jpg` |
| 40 | Messages | `/team/leads/messages` | `40-messages.jpg` |
| 41 | Message details | `/team/leads/messages/[code]` | `41-message-details.jpg` |
| 42 | Convert lead to customer | `/team/customers/new?from=QUO-2026-040` | `42-convert-lead-to-customer.jpg` |
| — | Website content (Super admin, Admin): testimonials and the live-project link | `/team/website-content` | none (built from the Settings and Users screens' parts) |
| — | Profile settings (every team role) | `/team/profile` | none (the client portal's screen 15 without the email choices) |

## Not part of the product
- **The design's "VIEW AS" switcher** (Customer / Super admin / Admin / Manager / Developer) is a prototype control and is hidden in these screenshots. Don't build it. For development, a seeded user per role is enough. If you want a dev-only role switcher, keep it behind `NODE_ENV=development`.
- **The "Today, 10:12" style timestamps** come from the design's fixed date (Monday 9 November 2026). Show real relative times.
