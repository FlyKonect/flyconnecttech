# 01 · Product spec

Northstack designs, develops and integrates digital products, with travel technology as its specialty. This app is its public website, a client portal for support, and a team panel for staff. Screenshots for everything below are in `design/screens/`; see `05-screens-and-routes.md` for the mapping.

Copy rule: use the wording from the design files (`design/source/`). Bracketed text such as `[X business days]` was a placeholder for the client to fill. The client has supplied the reply time, the email address and the social links. Parts still waiting for real content are hidden from visitors (see §9), never shown as placeholders.

---

## 1. People and roles

| Role | Who | Where they work |
|---|---|---|
| Customer | One contact person at a client company. Each customer account has one or more projects. | Client portal `/portal` |
| Super admin | Founder or owner | Team panel `/team` |
| Admin | Support lead or office manager | Team panel |
| Manager | Delivery manager | Team panel |
| Developer | Engineers and QA | Team panel |
| Visitor | Anyone on the website | Website |

Each project belongs to exactly one customer.

### Permissions (enforce on the server)

| Permission | Super admin | Admin | Manager | Developer |
|---|---|---|---|---|
| See support requests | All | All | All | Only those assigned to them |
| Reply and add internal notes | Yes | Yes | Yes | Yes (own requests) |
| Assign or transfer requests to developers | Yes | Yes | Yes | No |
| Change priority, close requests | Yes | Yes | Yes | No |
| Change status | Any | Any | Any | In Progress, Waiting for Customer, Resolved only |
| View customers and projects (with their progress) | Yes | Yes | View only | No |
| Add customers and projects, edit project details, items and updates, resend invitations, send reset links | Yes | Yes | No | No |
| Delete and restore projects | Yes | Yes | No | No |
| See projects (Projects menu, modules, timeline) | All | All | All | Only the projects they are on |
| Add modules, edit them, the project team | Yes | Yes | No | No |
| Move module stages, tick items | Any stage | Any stage | No | Working stages and Client review, never Done (their projects) |
| Take part in project discussions | Yes | Yes | Yes | Their projects |
| Add team users | Any role | Admin, Manager, Developer | No | No |
| Website leads (demos, quotes, messages) | Yes | Yes | Yes | No |
| Convert a lead to a customer | Yes | Yes | No | No |
| Reports and analytics | Yes | Yes | Yes | No |
| Settings | Yes | No | No | No |
| Website content (testimonials, live-project link) | Yes | Yes | No | No |

Customers see only their own projects, requests, notifications and profile. Internal notes are never shown or sent to customers.

---

## 2. Website (public)

### Shared parts on every page
- **No top bar.** The design's gold bar ("Travel agencies: add Amadeus…", Learn more) was removed at the client's request; Support and Client login moved into the header.
- **Header:**
  - Northstack logo, linking to Home.
  - Menu: Solutions, Travel Technology, Services ▾ (All services, Website development, UI/UX design, API integrations), Case Studies, About. The current page is underlined in gold.
  - On the right: **Support** (the Support page), **Client login** (`/portal/sign-in`), **Get a quote** (navy, links to Contact), **Book a demo** (gold, opens the demo dialog).
  - **Signed in:** "Client login" becomes **Client portal** (customers) or **Team panel** (the team), linking to their own area, in the header, the phone menu and the footer, and the Support page's buttons read "Go to the client portal" / "Go to the team panel". "Open my invitation" is hidden. The pages are pre-built, so they ask the backend (`GET /me/status`) after loading.
  - No Contact link here: **Get a quote** opens the same page (the phone menu and the footer still list Contact). The full menu shows from 1280px wide; narrower screens get the menu button, whose menu also lists Contact, Support and Client login.
- **Phone and tablet:**
  - A menu button opens the menu, with the service pages indented under Services, plus Support and Client login.
  - A row of two buttons under the header: Get a quote and Book a demo.
- **Footer (navy):**
  - The logo (32px tall, 28px on phones), at the top, with "FlyConnect Tech is a trading brand of FlyConnect Limited." under it. The line "We design, develop & integrate…" and the social buttons were removed at the client's request.
  - Columns:
    - Solutions: Ready-made products, Custom software, API integrations.
    - Services: Travel technology, Website development, UI/UX design, All services.
    - Company: About, Case studies, Contact.
    - Clients: Support, Client login, Open my invitation.
    - Legal and Ownership: Legal Entity and Ownership (`/legal-entity-and-ownership`).
  - From 1280px the five columns sit beside the logo (the footer is then as wide as the header, up to 1360px); a long link wraps onto two lines.
- **Legal Entity and Ownership** (`/legal-entity-and-ownership`): the client's "Legal Entity and Ownership" document, word for word except "FlyConnectTech" written "FlyConnect Tech": FlyConnect Tech is a trading brand and technology division of FlyConnect Limited (England and Wales, company number 16152024), which provides the services and is the party to every contract. In the legal pages' style; in the sitemap.
  - Bottom line: "© 2026 Northstack. All rights reserved." and the links Privacy · Terms · Cookies.
- **Privacy, Terms and Cookies** (`/privacy`, `/terms`, `/cookies`): not in the design, so they follow the Support page's style (navy top band with breadcrumb, then text). Written from what the site really does: the three forms, client portal accounts, and only the sign-in cookies (no analytics or advertising, so no cookie banner). "FlyConnect Tech" and info@flyconnecttech.co.uk as the contact. The client should have the texts checked.
- **Inner pages:** breadcrumbs, a navy hero with the route-map art (`design/assets/route-map.svg`), a closing navy call-to-action band (Get a quote and Book a demo), and accordion FAQs (one open at a time, the first open at start).

### Pages
Build the content from `design/source/website-*.dc.html`; the screenshots are in `design/screens/website/`.

1. Home
2. Products & Solutions
3. Travel Technology
4. Services
5. Website Development
6. UI/UX Design
7. API Integrations
8. Case Studies (the FlyConnect case study)
9. About Us
10. Contact & Quote
11. Support

Notes:
- **Contact & Quote:**
  - Contact options: Email (info@flyconnecttech.co.uk), Book a demo, Response time ("Within 5 business days, Monday to Friday"). No WhatsApp, and no "Already a client?" or "What happens next" boxes: the client removed them (Client login is in the header).
  - A card with two tabs, **Get a quote** (full form) and **Send a message**.
  - FAQs (4 questions). The client asked to keep them here.
- **Services:** no FAQs and no closing "Have a project in mind?" band (both removed at the client's request); the page ends with the FlyConnect project card.
- **Website Development:** no FAQs and no closing "Let's build your…" band (both removed at the client's request); the page ends with the FlyConnect project card.
- **UI/UX Design:** no FAQs and no closing "Start with a prototype" band (both removed at the client's request); the page ends with the FlyConnect project card.
- **API Integrations:** no FAQs and no closing "Let's connect your…" band (both removed at the client's request); the page ends with the FlyConnect project card.
- **Travel Technology:** no FAQs and no closing "Ready to sell flights…" band (both removed at the client's request); the page ends with the FlyConnect project card.
- **Products & Solutions:** no "Every product and service, in one place." section, no FAQs and no closing "Not sure which option…" band (removed at the client's request); the page ends with the FlyConnect project card.
- **Home:** no "Products & solutions · Everything you need to launch, run and grow online." section and no "Our development process" section (removed at the client's request). "Why choose us" has no "Talk to our team" button. No FAQs; the "Ready to build something great?" section with the short quote form stays.
- **About Us:** no team section and no closing "Let's talk about your project." band (both removed at the client's request); the page ends with the FlyConnect project card.
- **Support:**
  - Hero buttons: "Sign in to the client portal" and "Open my invitation".
  - In the prototype, "Open my invitation" shows the invitation email. In the real app it can't open an invitation without the emailed link, so it goes to `/portal/invitation`. That is a short page in the design system: "Open the invitation email we sent you and click **Verify email and set password**. Can't find it? Check your spam folder, or send us a message and we'll send a new one." It links to Contact and to sign in. Confirm the wording with the client.
  - The seven request types, plus a "Planning a new project?" quote card.
  - How support works in four steps.
  - FAQs, including "Team sign in", which links to `/team/sign-in`.

### Book a demo (dialog, 3 steps and a confirmation)
1. **What to see:**
   - Travel booking platform (Amadeus flight search, booking and ticketing)
   - Agent and admin dashboards
   - Custom software and websites
   - API and integrations
2. **Date and time:**
   - The next 10 weekdays.
   - Slots 09:30, 11:00, 12:30, 14:00, 15:30 and 17:00, **UK time**. A demo is a 30-minute video call.
   - Slots already taken by a scheduled demo are shown crossed out and can't be picked.
3. **Your details:** Full name*, Work email*, Company*, Phone (optional), Notes (optional).
4. **Confirmation:** "Demo requested · Thanks, {first}. We will send a calendar invite to {email} within 1 business day", with a summary of Demo, When, Where ("Video call · 30 minutes") and Company.

On submit, create a **Demo request**: status New, page of origin recorded. Email the visitor a confirmation and notify the team (section 6).

### Get a quote
- **Short form** (Home): Project type, Budget range, Full name*, Work email*, Requirements*.
- **Full form** (Contact): the same fields plus Timeline, Company (optional), Phone (optional).
- **Options:**
  - Project type: Travel booking platform, Amadeus / Sabre integration, New website, Website redesign, Custom software, UI/UX design, API integration, Other.
  - Budget: Under £5k, £5k – £15k, £15k – £50k, £50k+, Not sure yet.
  - Timeline: As soon as possible, Within 1–3 months, Within 3–6 months, Not sure yet.
- **Success state:** "Thanks, {first}. Your request is in. We will reply to {email} within 5 business days with next steps, a rough scope and an estimate." Then a summary, "Send another request" and "Book a demo".
- **On submit:** create a **Quote request** with status New, email the visitor a confirmation, and notify the team.

### Send a message (Contact page)
- Fields: Topic (General question, Partnership, An existing project, Something else), Full name*, Email*, Message*.
- Success state as designed.
- On submit, create a **Contact message** with status New and notify the team. If the email matches a customer, link the message to that customer.

### All public forms
- Validate with Zod on client and server, using the inline error messages from the design.
- Rate-limit by IP and add a honeypot field. Return a generic success to bots caught by the honeypot.
- Store the source page.
- Never expose whether an email already exists.

---

## 3. Accounts (invite-only)

There is no sign-up anywhere. Staff create accounts; people activate them from an email.

Someone already signed in never sees these pages: sign in, forgot password, the invitation help page, and invitation and reset links all send them to their own area (the portal, the team panel, or two-factor setup if it isn't done yet). To open another person's invitation, use a private window.

- **Customer invitation:**
  - Created when an admin adds a customer, or converts a lead.
  - Email from "Northstack Support". Subject: "Your Northstack support account is ready". It lists the customer's projects and has a **Verify email and set password** button.
  - The link expires in 48 hours.
- **Team invitation:** created when an admin adds a user. Same flow, with team wording and the role named.
- **Accept invitation** (`/invite/[token]`), screen 03:
  - Shows "Email verified".
  - Fields: Full name (prefilled), Phone (optional), New password, Confirm password.
  - Password rules: at least 10 characters, upper and lower case letters, and at least one number or symbol.
  - Company is shown read-only ("set by the Northstack team").
  - **Activate account** verifies the email, sets the password, marks the user Active and the invitation used, then goes to sign in.
  - Team users then set up two-factor authentication (authenticator app, TOTP) before their first sign-in completes. The design has no screen for this: make a simple one in the design system.
- **Customer sign in** (`/portal/sign-in`), screen 01:
  - Fields: email, password, "Keep me signed in".
  - Link to **Forgot password?**
  - Text: "No account yet? Accounts are created by the Northstack team and sent to you by email."
  - "Northstack team member? **Team sign in**".
  - Northstack logo and "← Back to website".
- **Team sign in** (`/team/sign-in`), screen 16, in two steps (a client change from the design, which had all three fields on one page):
  - Step 1: work email and password, button **Continue**. "New team member? Use the link in your invitation email to set your password first." and **Forgot password?**
  - Step 2, only for accounts with two-factor on: **Enter your code**, "Signing in as {email}". One 6-digit box that signs in by itself once six digits are typed (or **Verify and sign in**). **Use a backup code instead** switches to a box for one of the backup codes saved at setup (each works once); **Start again** goes back to step 1 with the email kept.
  - A wrong code empties the box and says so; too many wrong codes lock the account for a few minutes; a code screen left too long sends you back to step 1.
  - The very first sign-in (no two-factor yet) goes from step 1 straight to the two-factor setup.
  - "← Back to website".
- **Forgot password** (screen 04) → email with a reset link → **Reset password** (`/reset-password/[token]`, screen 05) → sign in.
  - Admins can also send a reset link from the customer page.
- **Resend invitation:** this invalidates the old link.
- **Sign out:** customers go back to sign in; team members go to team sign in.
- **Delete** (super admins and admins; never yourself; admins never a super admin): **Delete user** in the Users list "⋯" menu and **Delete customer** on the customer page, each after a confirmation that lists what happens. The account is deleted for good (no sign-in, personal details erased, gone from the lists, the email free again); its history stays under its name marked "(deleted)". A deleted team member's open requests go back to Under Review, unassigned; a deleted customer's open requests are closed with "Closed because the customer account was deleted". Adding the same email again on the same side asks **"This email had an account before"**: **Restore their history** (the same account comes back with everything, and a new invitation) or **Start fresh** (a new account; the old history is not offered again). Disable stays as it was.
- **Customer and team accounts are separate** (a client decision): one email can have a customer account and a team account, each with its own password, invitation and password reset. Customer sign in and its "Forgot password" reach the customer account; Team sign in and its "Forgot password" reach the team account. "Add user" refuses an email only if another team account has it ("There is already a team account with this email."), and "Add customer" only if another customer account has it ("There is already a client account with this email.").
- **Wrong area:** a customer who opens `/team` is sent to the portal, and staff who open `/portal` are sent to the team panel.

---

## 4. Client portal (`/portal`)

### Layout
- **White sidebar:**
  - Logo with "Client portal".
  - No "Create support request" button here (removed at the client's request); it is on the Overview, and My Requests has **New request**.
  - Menu: Overview, My Requests (count), My Projects, Notifications (unread badge).
  - At the bottom: user card (name, company). No "Visit website" link (removed at the client's request).
- **Header:** page title, a search box (searches the customer's requests), the notifications button, and the customer's name and company. A click on the name opens a menu: **Profile settings** and **Logout** (moved out of the left menu at the client's request; on phones only the avatar shows).
- **Phone:** the sidebar becomes a slide-in menu.

### Overview (screen 06)
- **Navy welcome card:**
  - Date and "Good morning, {first}".
  - "{n} request is waiting for your response" (or "No requests need your response").
  - Link: "Planning a new project? Request a quote →" to `/contact`.
  - Buttons: **Create support request** (gold) and **View my requests**.
- **Tiles:** Total requests, Open requests, In progress, Waiting for you (orange), Resolved.
- **Recent requests:** the latest 5, with code · project, title, status and updated time.
- **Recent activity:** the latest 5 notifications.

### New request (4 steps, screens 07–10)
1. **Project:** "Which project is this about?" Cards of the customer's own projects showing code · type, status and name.
2. **Type:**

   | Type | Description |
   |---|---|
   | Technical Issue | Something is not working as expected |
   | Bug Report | An error you can reproduce |
   | Feature Request | Something new you would like added |
   | Integration Problem | API, GDS or payment issues |
   | Design Modification | Changes to layout, content or styles |
   | General Inquiry | Questions about your project |
   | Maintenance Request | Updates, renewals and routine work |

3. **Details:** Request title*, Detailed description*, Priority (Low, Medium, High, Urgent), Page or website URL (optional), Attachments (screenshots or files; limit type and size).
4. **Review:** project, type and priority, each with an Edit link, plus the title, description, URL and files. **Submit request**.
5. **Submitted (screen 11):**
   - "Request submitted", the new code (e.g. `TKT-2026-00125`), title, status Submitted and priority.
   - Cards: NEXT (our team reviews it), THEN (a developer is assigned and replies), ALWAYS (you are notified at every update).
   - Buttons: View request, Back to dashboard.
   - The customer gets an email copy.

### My requests (screen 12)
- Tabs with counts: All, Open (Submitted, Under Review, In Progress), Awaiting you (Waiting for Customer), Resolved (Resolved and Closed).
- Table: request code, subject (with created date), project, priority, status, updated, assigned to. On phones this becomes cards.
- **+ New request** button.

### Request conversation (screen 13)
- **Header:** code · project · type, title, status and priority pills.
- **Actions:**
  - **Close request** while it's open.
  - **Confirm it's fixed** or **I still need help** when it's Resolved.
  - **Reopen request** when it's Closed.
- **Banner** when Waiting for Customer: "The support team is waiting for your reply…".
- **Messages:**
  - The customer's own messages on the right in navy, with attachments.
  - Team replies on the left with an avatar and "Northstack Support".
  - System events as small centred lines.
  - Internal notes never appear.
- **Reply box:** Attach file, **Send reply**.
- **Side panels:** Request details (Assigned to, Project, Created, Last updated, Attachments) and Status history.

### Notifications (screen 14)
- What the team did: replies, status changes, requests for more information, resolved and closed. Not the customer's own new request (they see the "Request submitted" page and get an email copy).
- List with a label, text and time. Unread items are highlighted.
- **Mark all as read**.
- Clicking a notification opens its request.

### My Projects (added after the design)
- **List** (`/portal/projects`): a card per project: code · type, name, status, the description, the progress bar ("60% · 6 of 10 done"), the target date and the project lead.
- **Project page** (`/portal/projects/[code]`), view only:
  - Header: name, status, the progress bar, and **Create support request for this project** (New request with the project already chosen).
  - **What's included:** each item with its status (To do, In progress, Done, and the day it was done).
  - **Updates** from the team, newest first, with their files to download.
  - **Details:** description, start, target, went live, support until, project lead, live and test addresses, built with. Never the team notes.
  - Support requests: open and total, with a link to My Requests.
- The Overview shows a "My projects" card with each project's progress. Deleted projects are not shown. Another customer's project answers "not found".

### Profile and password (screen 15)
- **Editable:** Full name, Phone, Country, Time zone.
- **Read-only:** Company and Email, with the note that the Northstack team set them.
- **Email me when:**
  - The team replies (on).
  - A status changes or more information is needed (on).
  - Weekly summary of my requests (off).
  - A project update is posted (on). Also used for "Ready for your review".
  - A discussion reply is posted (on).
- **Change password:** current password, new password, confirm. Same password rules as above.

---

## 5. Team panel (`/team`)

### Layout
- **Navy sidebar:**
  - Logo, then "Team panel". No "View website" link (removed at the client's request).
  - **Dashboard**.
  - **SUPPORT REQUESTS** (labelled **MY REQUESTS** for developers): All requests (count) only. The per-status shortcuts (New requests, Under review, In progress, Waiting for customer, Resolved, Closed) were removed at the client's request: All requests has them as filter tabs, and stays highlighted on every tab.
  - **WEBSITE** (Super admin, Admin, Manager): Demo requests, Quote requests, Messages, each with a gold badge for new items; then Website content (Super admin, Admin).
  - **MANAGE:** Customers (Super admin, Admin, Manager), Projects (Super admin, Admin, Manager), Users (Super admin, Admin), Reports & Analytics (Super admin, Admin, Manager).
  - Notifications (badge), Settings (Super admin).
  - User card (gold avatar, name, role).
- **Header:** page title, search (requests and customers), notifications, and the user's name with role · job title. A click on the name opens a menu: **Profile settings** and **Logout** (Logout moved out of the left menu at the client's request).
- **Profile settings** (`/team/profile`, every team role): Full name, Phone, Country and Time zone can be changed; Email, Role and Job title are shown read-only (an admin sets them); and Change password, as in the client portal.

### Dashboards (screens 17–20)
- **Common parts:**
  - Navy hero: date, role pill, "Good morning, {first}", a subline and action buttons (the first is gold).
  - KPI tiles.
  - **Website leads** card (not for developers).
  - A list with a side panel.
  - **Latest alerts**.
- **Super admin:**
  - Actions: Add user, Add customer.
  - KPIs: Customers (invitations pending), Team members (pending), Open requests (n new; dark tile), Unassigned, At risk of SLA, Avg. first response.
  - List: "New requests to review", each with a Review button.
  - Panel: Team by role, with Manage users.
- **Admin:**
  - Actions: Add customer, Add user.
  - KPIs: Customers, New requests (dark tile), Open requests, In progress, Waiting for customers, Resolved.
  - List: New requests to review.
  - Panel: Team workload (open requests per developer).
- **Manager:**
  - Actions: Assign requests, Reports.
  - KPIs: Open requests (dark tile), Unassigned, At risk of SLA, Waiting for customers, Resolved this month, Avg. first response.
  - List: "Unassigned requests", where Assign opens the assign dialog.
  - Panel: Team workload.
- **Developer:**
  - Action: Open my requests.
  - KPIs: Assigned to me (dark tile), In progress, Under review, Waiting for customers, Resolved by me.
  - List: "My queue", most urgent first.
  - Panel: Due soon.

**Website leads card tiles:**
- New demo requests ("{n} from Book a demo").
- New quote requests ("{n} estimate is awaiting a reply").
- New messages ("From the contact form").
- Demos booked ("Next: Wed 11 Nov, 14:00").

Each tile opens its list, filtered.

### Support requests list (screen 21)
- Developers see the banner "Showing requests assigned to you, {name}."
- Tabs with counts: All, New, Review, In progress, Waiting, Resolved, Closed. Developers have no New tab.
- Filters: search (ID, subject, customer), project, priority, assigned to (not for developers), Clear filters.
- Table columns: request, subject · customer (company), project, priority, status, assigned to, updated.

### Request review (screens 22–25)
- **Header:**
  - "← Back to requests", code · project · type, title, and pills for status, priority and "Assigned: {name}".
  - Buttons: Assign developer / Reassign, Transfer (if allowed), Request more info, Resolve, Close request (if allowed).
- **Conversation and internal notes:**
  - Customer messages, replies to the customer, and amber **internal notes** labelled "Not visible to the customer".
  - Composer with two modes: **Reply to customer** ("The customer is notified by email") and **Internal note** (amber, "Visible to staff only").
- **Side panels:**
  - **STATUS chips**. Developers can only pick In Progress, Waiting for Customer or Resolved, with that explained under the chips.
  - **PRIORITY chips**. Developers see "Set by your manager".
  - **ASSIGNED TO** with Change.
  - **CUSTOMER:** name, company, country, email, phone, project, project type, request type, created, and "View customer and projects →".
  - **ATTACHMENTS**.
  - **ACTIVITY TIMELINE**.
- **Assign dialog (screen 23):**
  - Active developers, each with job title and number of open requests.
  - Picking one assigns the request. If it was Submitted it moves to Under Review.
  - Logged as "Assigned to X by Y", or "Transferred from A to B by Y" for a transfer.
- **Request more info:** posts a reply asking for details and sets the status to Waiting for Customer.
- **Resolve dialog (screen 25):**
  - "Resolution summary for the customer" (prefilled) and "Email the customer and ask them to confirm" (checked).
  - Sets the status to Resolved. The customer can confirm (the request closes) or choose "I still need help" (it reopens to In Progress).

### Customers (screens 26–28)
- **List:**
  - Summary line: "6 customers · 8 projects · 1 invitation pending". Managers also see a "View only" tag.
  - Search, and **+ Add customer**.
  - Columns: customer (name, email), company, projects (count and names), open requests, status (Invited or Active), View →.
- **Add customer:**
  - Customer: Full name*, Work email*, Company*, Phone (optional).
  - Projects: one or more rows, each with a name* and a type (Website, Web application, Travel booking platform, Agent portal, API integration, Custom software, UI/UX design, Maintenance plan). **+ Add another project**, and Remove.
  - **Create customer and send invitation**, with a side panel "What happens next" (3 steps; the link expires after 48 hours).
- **Customer details:**
  - Header: avatar, name, status, company · email. **Resend invitation** (Invited) or **Send password reset link** (Active).
  - Projects: code · type, name, status, open requests, and an "Add project" row (name, type).
  - Support requests for this customer.
  - Contact: Email, Phone, Country, Customer since, Added by, and **Came from** (a link to the lead they were converted from).
  - Account access note: invited, or active with last sign-in.

### Projects (added after the design)
- **Menu:** Projects, under MANAGE after Customers (super admins, admins and managers; managers see "View only").
- **List** (`/team/projects`): every customer's projects.
  - Stat cards: all projects, planning or design, in development, live or completed.
  - Tabs: All, Planning, In design, In development, Live, Completed, Deleted (each with its count). Search by code, project name, company or contact.
  - Columns: project (code · type, name), customer, status, progress, target date, lead, open requests, View →.
  - **+ Add project** (super admins and admins).
- **Add project** (`/team/projects/new`, also "Or add a project with its details" on a customer's page): customer, name, type, project lead, start and target dates, description and **What's included** (one item a line, up to 50).
- **Add customer** asks the same description and "What's included" on each project row (both optional).
- **Project page** (`/team/projects/[code]`):
  - Header: code · type · company, name, the status dropdown, **Edit details**, **Delete project**, and the progress bar.
  - **What's included:** each item with its status dropdown (To do, In progress, Done) and a "⋯" menu: Edit, Move up, Move down, Remove. **Add items** takes several lines at once. Progress is the share of items Done. Changing an item sends nothing to the customer.
  - **Updates:** the team writes what has been done, with up to 5 files. The customer gets an in-app notice and the email "Update on {project}" (unless they untick it). Each update's "⋯": Edit (no new email) and Remove (with its files).
  - **Details:** description, start, target, went live, support until, project lead (a team member), live and test addresses (http/https only), built with.
  - **Team notes** (amber box, "Only the team sees this"): never shown in the portal, emails or the customer's data export.
  - Support requests: open and total, with "View its requests".
- **Delete project:** refused while the project has open requests ("Move or close its 2 open requests first"). With no requests and no updates the project is removed for good; otherwise it is hidden: it leaves the lists, the portal and New request, its name gets "(deleted)", and its requests, items and updates stay as history. The Deleted tab lists it; its page shows **Restore project**.
- The customer page links each project to its page and shows its progress.
- **Tabs** on a project's page: Overview (modules at a glance, details, team notes, Project team, requests, latest update), Modules, Timeline, Discussions, Team discussions, Updates. The client portal has the same without team notes, the project team and Team discussions.

### Modules, stages and the timeline (added after the design)
- A project is split into **modules** (for example Flight booking, Agent portal, Payments), each with a name, description, start and target dates, its own **items** (To do, In progress, Done) and a **stage**. Items typed in Add customer or Add project go into a first module, "General"; existing items were moved there.
- **Stages:** Not started → Design → Development → Testing → Client review → Done. When the customer asks for changes the module goes to **Changes requested**, back to Development, then **Retest** and Client review again; each round is counted ("Round 2").
- **Who moves them:** super admins and admins to any stage; developers on the project team through Design, Development, Testing, Retest and Client review (never Done or Not started); managers look. Every move can have a note and is dated on the module's **timeline**.
- **Client review:** the customer gets a notice and the email "Ready for your review: {module}". On the Modules tab they **Approve module** (it becomes Done and its open items are ticked) or **Request changes** with a note (Changes requested, a new round). The project lead and the team developers (or super admins and admins when nobody is on the team) get a notice and an email.
- **Module card:** name, stage, round, Late (target passed, not Done), dates, the **stage stepper** (done steps ticked with their day, the current one highlighted, rework shown on its step), progress, items, and "Show history". Admins: "Move to…", and "⋯" Edit, Move up, Move down, Remove (its items and timeline go with it; discussions about it are kept). Developers on the team: "Move to…" and the item status.
- **Timeline tab:** each module as a bar from start to target (late in red, done in green) with a line for today, then every stage move, newest first, with the round, who and the note.
- **Progress:** per module from its items; the project shows "60% · 6 of 10 done" and "2 of 5 modules done". Lists show the module count and "in client review"; My Projects shows "Waiting for your review".

### Project team (added after the design)
- Super admins and admins add active team members to a project's team (Overview tab) and take them off; both are in the Activity log. Super admins, admins and managers always see every project; **developers see only the projects they are on** (their menu: "My projects"), with no link to the customer.

### Project discussions (added after the design)
- Each project has two boards: **Discussions** (with the customer) and **Team discussions** (internal: only the project team, never the customer, not in emails to them or their data export).
- **A topic:** a title, an optional module, the first message and up to 5 files (the request upload rules). Topics are numbered per project (#1, #2…). The list has Open and Closed tabs; each row shows the module, who started it, replies, last activity, and Answered, Proposal waiting and (team) "Waiting for: …".
- **Replies** with files. On customer topics the team can **post a proposal**: the customer **Approves** it or **Requests changes** (a note is needed), once; the decision shows on the proposal and as a line in the thread.
- **The answer:** whoever started the topic, or a super admin or admin, marks the reply that answered it; it is pinned on top.
- **Close and reopen:** whoever started the topic, the project lead, super admins and admins, with an optional closing note shown at the top. A closed topic takes no replies.
- **Team topics:** ask people by name (super admins, admins, managers and the team developers); they get a notice and an email, and the topic shows "Waiting for: {name}" until they reply.
- **Edit and remove:** authors edit their own messages (marked "edited"; an answered proposal can't be edited); super admins and admins remove a message (not the first) or delete a whole topic (in the Activity log).
- **Who hears:** a new customer topic: the lead and the team developers (or super admins and admins), and the customer when the team starts it; a reply: everyone taking part except the author; a proposal: the customer ("Proposal waiting for your approval"); a decision: everyone taking part. Customers follow their "A discussion reply is posted" choice.

### Users (screens 29–30)
- **List:**
  - Role tiles: the count per role (active plus invited) and a description.
  - Table: name (email), role pill, job title, open assigned (developers only), status, last active.
  - **+ Add user**.
- **Add user:**
  - Full name*, Work email*, Job title (optional).
  - Role* as radio cards with descriptions. Admins can't pick Super admin; the card says "Only a super admin can add another super admin".
  - Side panel: "What each role can do", the permission table above.
  - **Send invitation**.

### Reports & Analytics (screen 31)
- KPI cards with change versus last month: Avg. first response, Avg. resolution time, Resolved this month, Reopened requests.
- Requests this week (bars, Mon–Sun), requests by project (bars), and developer performance (assigned, resolved, avg. response).
- Compute everything from the data.

### Team notifications (screen 32)
- Unread count, Mark all as read, and a list. Clicking opens the request or lead.
- Developers only get notifications about their own requests, and no lead notifications.

### Settings (Super admin, screen 33)
- **Response targets per priority:** Urgent 1 hour, High 4 hours, Medium 1 business day, Low 2 business days.
- **Team notifications:**
  - Alert all admins about new Urgent requests (on).
  - Notify the assigned developer when a customer replies (on).
  - Daily digest of requests waiting for review (on).
  - Auto-close resolved requests after 7 days (off).
- **Save settings**.

### Website content (Super admin, Admin)
Not in the design; built from the Settings and Users screens' parts. Address `/team/website-content`.
- **Live project link:** where the website's "View live project" buttons go (10 places) and the address shown on Case Studies. Default `https://dev.flyconnect.co.uk`. Only full web addresses (`https://…`).
- **Testimonials:** Add testimonial (Quote up to 400 characters, Client name, Role and Company optional, "Show on" Home and/or Case Studies), Edit and Remove (asks first) from each row's "⋯" menu. The note: "Only add quotes with the client's permission."
- **The website:** Home's "What our clients say" shows the 3 newest marked for Home; Case Studies shows the newest marked for Case Studies. Each section is hidden while it has none. A change shows on the website straight away.
- Every change is in the audit log.

### Support request statuses

| Status | Meaning |
|---|---|
| Submitted | New, not reviewed yet |
| Under Review | Being reviewed or assigned |
| In Progress | Being worked on |
| Waiting for Customer | Needs the customer's reply |
| Resolved | Fixed; waiting for the customer to confirm |
| Closed | Done |

Transitions:
- A customer reply while Waiting for Customer moves the request to In Progress automatically, logged as a system event.
- When a customer confirms a Resolved request, it moves to Closed.
- "I still need help" or Reopen moves the request to In Progress.
- If the setting is on, Resolved requests auto-close after 7 days.

Record every change in the status history with who and when.

### SLA
- Two due times per request, from the request's priority (changed in the audit, Phase 2):
  - **Reply:** from the response target. It stops at the first team reply.
  - **Fix:** from the fix target (Settings; Urgent 1, High 3, Medium 5, Low 10 business days to start).
- Business days are Monday to Friday in UK time, without the bank holidays listed in Settings.
- **Paused** while Waiting for Customer (both).
- **At risk** when less than 1 hour is left on the clock that counts: reply before the first reply, fix after.
- **Met** when the request is resolved before the fix due time.
- Show the badge in lists and dashboards: "Due in 38m", "Due tomorrow", "Paused" or "Met".

---

## 6. Website leads (team panel)

Every lead has:
- A code.
- Status.
- **Owner:** one of the Super admin, Admin or Manager users, or Unassigned.
- Contact details and the page it was sent from.
- An **activity log**: system events, emails to the contact, and amber internal notes.
- A composer with **Email {first}** and **Internal note** modes. Sent emails are logged in the activity.

Lists have status tabs with counts, search, and a note on where the leads come from. The first action on an unowned lead makes the actor its owner.

### Demo requests (screens 34–36)
- **Statuses:** New → Scheduled → Completed, or Cancelled. A cancelled demo can be reopened to New.
- **Fields:**
  - From the visitor: topic, preferred day and time (UK), name, email, company, phone, notes, sent-from page.
  - Added by the team: confirmed time, host, video call link (optional).
- **Actions:**
  - **Confirm time** (dialog, screen 36):
    - Shows "They picked {day}, {time} UK time".
    - Fields: Date (next weekdays), Time (UK, same slots), Host, Video call link (optional, "Paste a Zoom, Teams or Google Meet link").
    - **Send calendar invite** emails the visitor with an `.ics` attachment and sets the status to Scheduled.
  - **Reschedule:** same dialog, "Send new invite".
  - **Mark as completed**.
  - **Cancel demo:**
    - Dialog with a reason: Asked to reschedule later, No longer interested, Duplicate request, No reply.
    - "Email {first} that the demo is cancelled" (checked).
  - **Convert to customer** (when Completed).
- Once a demo is Scheduled, its slot shows as taken on the website.

### Quote requests (screens 37–39)
- **Statuses:** New → Reviewing → Estimate sent → Won or Lost. A lost quote can be reopened to Reviewing.
- **Fields:** project type, budget, timeline (Contact page form only), name, email, company and phone (Contact page form only), requirements, sent-from page.
- **Actions:**
  - **Start review**.
  - **Send estimate** (dialog, screen 39):
    - Shows "Their budget / Timeline".
    - Fields: Estimate (GBP)* (prefilled from the budget range), Delivery time, Valid until, What is included.
    - Emails the visitor and sets the status to Estimate sent.
    - **Update estimate** sends a new version; keep the history.
  - **Mark as won**.
  - **Mark as lost:** dialog with a reason (Budget, Timing, Chose another provider, No reply, Not a fit) and an optional note for the team.
  - **Convert to customer** (when Won).

### Messages (screens 40–41)
- **Statuses:** New → Replied (after the first email reply) → Closed. A closed message can be reopened.
- If the sender is a customer, show a banner: "{name} is a customer ({company}). Project requests should come through the client portal…". Add an **Open customer** button, and prefill the reply to point them to the portal.

### Convert a lead to a customer (screen 42)
1. Open Add customer, prefilled from the lead: name, email, company, phone, and one project.
   - The project name is suggested, for example "Coastline Amadeus booking".
   - The project type is mapped from the lead:
     - Travel booking platform → Travel booking platform
     - Agent and admin dashboards → Agent portal
     - Custom software and websites → Custom software
     - API and integrations, Amadeus / Sabre integration, API integration → API integration
     - New website, Website redesign → Website
     - UI/UX design → UI/UX design
     - Other → Web application
2. The page shows the banner "Details copied from {lead}. Check them, then send the client portal invitation." The back link returns to the lead.
3. On save:
   - The customer is created with an invitation.
   - The lead logs "Converted to customer by {name}" and shows "Now a customer".
   - The customer shows "Came from {lead}".

---

## 7. Notifications and emails

In-app notifications go to the people listed; emails respect each person's preferences and the settings. Every email uses a React Email template in the brand: navy header, gold accents, plain wording from the design.

| Event | In-app | Email |
|---|---|---|
| Customer or team invitation | — | Invitee: activation link, 48 hours |
| Password reset requested or sent by admin | — | User |
| New support request | Super admins, Admins, Managers ("Urgent" kind if Urgent) | Customer gets a copy. Admins get an alert if the request is Urgent and the setting is on |
| Request assigned or transferred | Developer | Developer |
| Team reply to customer | Customer | Customer |
| Customer reply | Assignee (or admins if unassigned) | Assignee, if the setting is on |
| Status changed / needs info / resolved / closed | Customer | Customer. "Resolved" asks them to confirm |
| Daily digest of requests waiting for review | — | Admins, Managers (setting) |
| Project update posted (added after the design) | Customer | Customer ("Update on {project}", with the progress), if "A project update is posted" is ticked |
| Module ready for client review (added after the design) | Customer | Customer ("Ready for your review: {module}"), if "A project update is posted" is ticked |
| Customer approved a module or asked for changes (added after the design) | Lead and team developers (or super admins and admins) | The same people |
| Discussion topic, reply, proposal, decision or "asked" (added after the design) | Everyone taking part (see "Project discussions") | The same people; customers if "A discussion reply is posted" is ticked |
| Demo requested | Super admins, Admins, Managers | Visitor confirmation. Team alert |
| Demo confirmed or rescheduled | Owner and host | Visitor, with `.ics` |
| Demo cancelled | — | Visitor, if chosen |
| Quote requested | Super admins, Admins, Managers | Visitor confirmation. Team alert |
| Estimate sent or updated | — | Visitor |
| Contact message received | Super admins, Admins, Managers | Team alert |
| Lead email from the composer | — | The lead's contact |

---

## 8. Non-functional requirements
- **Security:**
  - Server-side policies for every query and mutation.
  - Hashed tokens.
  - Rate limits on sign-in, reset and public forms.
  - Honeypot on public forms.
  - Upload checks.
  - Audit log for account, role and permission changes.
  - Two-factor authentication for all team accounts.
- **Privacy:** store only what the forms ask for; no tracking scripts until the client decides.
- **Accessibility:** WCAG 2.1 AA. Labels, focus, keyboard support for dialogs and menus, and announcements for toasts.
- **Performance:** server-render the website pages; optimised images; fonts via `next/font`.
- **SEO** for the website: titles, descriptions, Open Graph, sitemap, robots.
- **Responsive:** desktop, tablet and phone, as in the phone screenshots.
- **Time zones:** store UTC. Show demo slots in UK time, and other times in the user's time zone (from their profile, defaulting to Europe/London).

## 9. Placeholders the client still has to supply
Supplied: reply time (5 business days; the demo calendar invite within 1 business day), contact email (info@flyconnecttech.co.uk), no WhatsApp and no social links. Project timelines are left out ("Your quote includes a timeline"). Testimonials are added on the Website content screen.

Still to come, and hidden from visitors until then:
- Team members and photos (About's "The people behind your product").
- FlyConnect screenshots (the Case Studies top box and "Inside the platform"; Home's featured project shows the route map instead).
- Further case studies (Case Studies' "More projects coming soon").
- The staff email domain (the design uses `yourdomain.com`).
