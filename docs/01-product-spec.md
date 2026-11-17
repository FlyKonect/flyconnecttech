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
| View customers and projects | Yes | Yes | View only | No |
| Add customers and projects, resend invitations, send reset links | Yes | Yes | No | No |
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
  - No Contact link here: **Get a quote** opens the same page (the phone menu and the footer still list Contact). The full menu shows from 1280px wide; narrower screens get the menu button, whose menu also lists Contact, Support and Client login.
- **Phone and tablet:**
  - A menu button opens the menu, with the service pages indented under Services, plus Support and Client login.
  - A row of two buttons under the header: Get a quote and Book a demo.
- **Footer (navy):**
  - Logo and the line "We design, develop & integrate digital solutions that grow your business."
  - Social buttons: LinkedIn (linkedin.com/company/flyconnecttech) and Instagram (instagram.com/flyconnecttech), opening in a new tab, and Email (hello@flyconnecttech.co.uk).
  - Columns:
    - Solutions: Ready-made products, Custom software, API integrations.
    - Services: Travel technology, Website development, UI/UX design, All services.
    - Company: About, Case studies, Contact.
    - Clients: Support, Client login, Open my invitation.
  - Bottom line: "© 2026 Northstack. All rights reserved." and the links Privacy · Terms · Cookies.
- **Privacy, Terms and Cookies** (`/privacy`, `/terms`, `/cookies`): not in the design, so they follow the Support page's style (navy top band with breadcrumb, then text). Written from what the site really does: the three forms, client portal accounts, and only the sign-in cookies (no analytics or advertising, so no cookie banner). "FlyConnect Tech" and hello@flyconnecttech.co.uk as the contact. The client should have the texts checked.
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
  - Contact options: Email (hello@flyconnecttech.co.uk), Book a demo, Response time ("Within 5 business days, Monday to Friday"). No WhatsApp, and no "Already a client?" or "What happens next" boxes: the client removed them (Client login is in the header).
  - A card with two tabs, **Get a quote** (full form) and **Send a message**.
  - No FAQs on this page (removed at the client's request; the other pages keep theirs).
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
  - Budget: Under $5k, $5k – $15k, $15k – $50k, $50k+, Not sure yet.
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
- **Team sign in** (`/team/sign-in`), screen 16:
  - Fields: work email, password, **Two-factor code**.
  - "New team member? Use the link in your invitation email to set your password first."
  - "← Back to website".
- **Forgot password** (screen 04) → email with a reset link → **Reset password** (`/reset-password/[token]`, screen 05) → sign in.
  - Admins can also send a reset link from the customer page.
- **Resend invitation:** this invalidates the old link.
- **Sign out:** customers go back to sign in; team members go to team sign in.
- **Wrong area:** a customer who opens `/team` is sent to the portal, and staff who open `/portal` are sent to the team panel.

---

## 4. Client portal (`/portal`)

### Layout
- **White sidebar:**
  - Logo with "Client portal".
  - **Create support request** button.
  - Menu: Overview, My Requests (count), Notifications (unread badge), Profile Settings.
  - At the bottom: user card (name, company), **Visit website**, **Logout**.
- **Header:** page title, a search box (searches the customer's requests) and the notifications button.
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

### Profile and password (screen 15)
- **Editable:** Full name, Phone, Country, Time zone.
- **Read-only:** Company and Email, with the note that the Northstack team set them.
- **Email me when:**
  - The team replies (on).
  - A status changes or more information is needed (on).
  - Weekly summary of my requests (off).
- **Change password:** current password, new password, confirm. Same password rules as above.

---

## 5. Team panel (`/team`)

### Layout
- **Navy sidebar:**
  - Logo, then "Team panel · **View website**".
  - **Dashboard**.
  - **SUPPORT REQUESTS** (labelled **MY REQUESTS** for developers): All requests (count), New requests (gold badge; not shown to developers), Under review, In progress, Waiting for customer, Resolved, Closed (counts).
  - **WEBSITE** (Super admin, Admin, Manager): Demo requests, Quote requests, Messages, each with a gold badge for new items; then Website content (Super admin, Admin).
  - **MANAGE:** Customers (Super admin, Admin, Manager), Users (Super admin, Admin), Reports & Analytics (Super admin, Admin, Manager).
  - Notifications (badge), Settings (Super admin), Logout.
  - User card (gold avatar, name, role).
- **Header:** page title, search (requests and customers), notifications, and the user's name with role · job title.

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
- A due time is set from the response target of the request's priority.
- **Paused** while Waiting for Customer.
- **At risk** when less than 1 hour is left.
- **Met** when the request is resolved before the due time.
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
    - Fields: Estimate (USD)* (prefilled from the budget range), Delivery time, Valid until, What is included.
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
Supplied: reply time (5 business days; the demo calendar invite within 1 business day), contact email (hello@flyconnecttech.co.uk), LinkedIn and Instagram, no WhatsApp. Project timelines are left out ("Your quote includes a timeline"). Testimonials are added on the Website content screen.

Still to come, and hidden from visitors until then:
- Team members and photos (About's "The people behind your product").
- FlyConnect screenshots (the Case Studies top box and "Inside the platform"; Home's featured project shows the route map instead).
- Further case studies (Case Studies' "More projects coming soon").
- The staff email domain (the design uses `yourdomain.com`).
