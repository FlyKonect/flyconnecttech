import type { ReactElement } from 'react';
import {
  DailyDigestEmail,
  dailyDigestSubject,
} from './templates/daily-digest.js';
import {
  EmailChangedEmail,
  emailChangedSubject,
  EmailChangeEmail,
  emailChangeSubject,
} from './templates/email-change.js';
import { InvitationEmail, invitationSubject } from './templates/invitation.js';
import {
  DemoCancelledEmail,
  demoCancelledSubject,
  demoCancelledText,
  DemoInviteEmail,
  demoInviteSubject,
  demoInviteText,
  DemoReceivedEmail,
  demoReceivedSubject,
  EstimateEmail,
  estimateSubject,
  leadEmailSubject,
  LeadMessageEmail,
  NewLeadAlertEmail,
  QuoteReceivedEmail,
  quoteReceivedSubject,
} from './templates/lead-emails.js';
import {
  PasswordResetEmail,
  passwordResetSubject,
} from './templates/password-reset.js';
import {
  RequestReceivedEmail,
  requestReceivedSubject,
} from './templates/request-received.js';
import {
  StatusChangedEmail,
  statusChangedSubject,
} from './templates/status-changed.js';
import {
  assignedSubject,
  CustomerRepliedEmail,
  customerRepliedSubject,
  RequestAssignedEmail,
  UrgentRequestEmail,
  urgentSubject,
} from './templates/team-request.js';
import { TeamReplyEmail, teamReplySubject } from './templates/team-reply.js';
import {
  WeeklySummaryEmail,
  weeklySummarySubject,
} from './templates/weekly-summary.js';

/**
 * Every email the app sends, with sample content from the design, for the
 * development page /dev/emails. Grouped by the rows of docs/01 §7, so the
 * page doubles as the checklist that every row has its email.
 */

export type EmailPreview = {
  key: string;
  /** The docs/01 §7 row it belongs to. */
  row: string;
  /** Who gets it, and when. */
  to: string;
  subject: string;
  /** A calendar invite (.ics) goes with it. */
  calendar?: boolean;
  render: (siteUrl: string) => ReactElement;
};

const request = {
  code: 'TKT-2026-00124',
  title: 'Payment page times out on mobile',
  company: 'Bluewave Holidays',
  projectName: 'Bluewave booking website',
  priorityLabel: 'High',
};

const portal = (siteUrl: string) =>
  `${siteUrl}/portal/requests/${request.code}`;
const team = (siteUrl: string) => `${siteUrl}/team/requests/${request.code}`;
const demoWhen = 'Tuesday 10 November, 11:00 UK time';

export const EMAIL_PREVIEWS: EmailPreview[] = [
  // ------------------------------------------------------------ accounts
  {
    key: 'invitation-customer',
    row: 'Customer or team invitation',
    to: 'The new customer, when an admin adds them or converts a lead',
    subject: invitationSubject({
      kind: 'customer',
      company: '',
      projects: [],
      siteUrl: '',
      firstName: '',
      inviterName: null,
      link: '',
      expiresInHours: 48,
    }),
    render: (siteUrl) => (
      <InvitationEmail
        kind="customer"
        siteUrl={siteUrl}
        firstName="Sarah"
        inviterName="Emma Clarke"
        company="Bluewave Holidays"
        projects={['Bluewave booking website', 'Bluewave agent portal']}
        link={`${siteUrl}/invite/sample`}
        expiresInHours={48}
      />
    ),
  },
  {
    key: 'invitation-team',
    row: 'Customer or team invitation',
    to: 'The new team member, when an admin adds them',
    subject: invitationSubject({
      kind: 'team',
      roleLabel: '',
      siteUrl: '',
      firstName: '',
      inviterName: null,
      link: '',
      expiresInHours: 48,
    }),
    render: (siteUrl) => (
      <InvitationEmail
        kind="team"
        siteUrl={siteUrl}
        firstName="Ayesha"
        inviterName="Hamza Siddiqui"
        roleLabel="Developer"
        link={`${siteUrl}/invite/sample`}
        expiresInHours={48}
      />
    ),
  },
  {
    key: 'password-reset',
    row: 'Password reset requested or sent by admin',
    to: 'The person who asked on "Forgot password"',
    subject: passwordResetSubject,
    render: (siteUrl) => (
      <PasswordResetEmail
        siteUrl={siteUrl}
        firstName="Sarah"
        link={`${siteUrl}/reset-password/sample`}
        expiresInHours={48}
        sentByTeam={false}
      />
    ),
  },
  {
    key: 'password-reset-team',
    row: 'Password reset requested or sent by admin',
    to: 'A customer, when an admin sends the link from the customer page',
    subject: passwordResetSubject,
    render: (siteUrl) => (
      <PasswordResetEmail
        siteUrl={siteUrl}
        firstName="Sarah"
        link={`${siteUrl}/reset-password/sample`}
        expiresInHours={48}
        sentByTeam
      />
    ),
  },

  {
    key: 'email-change',
    row: 'Email address changed by an admin',
    to: 'The new address of an active account, to confirm it',
    subject: emailChangeSubject,
    render: (siteUrl) => (
      <EmailChangeEmail
        siteUrl={siteUrl}
        firstName="Sarah"
        newEmail="sarah@bluewaveholidays.co.uk"
        link={`${siteUrl}/confirm-email/sample`}
        expiresInHours={48}
      />
    ),
  },
  {
    key: 'email-changed',
    row: 'Email address changed by an admin',
    to: 'The old address, once the new one is confirmed',
    subject: emailChangedSubject,
    render: (siteUrl) => (
      <EmailChangedEmail
        siteUrl={siteUrl}
        firstName="Sarah"
        newEmail="sarah@bluewaveholidays.co.uk"
      />
    ),
  },

  // ----------------------------------------------------- support requests
  {
    key: 'request-received',
    row: 'New support request',
    to: 'The customer: their copy',
    subject: requestReceivedSubject(request.code),
    render: (siteUrl) => (
      <RequestReceivedEmail
        siteUrl={siteUrl}
        firstName="Sarah"
        code={request.code}
        title={request.title}
        projectName={request.projectName}
        typeLabel="Bug Report"
        priorityLabel={request.priorityLabel}
        description="On iPhone the payment page spins for about a minute, then shows an error. Desktop works."
        fileCount={1}
        link={portal(siteUrl)}
      />
    ),
  },
  {
    key: 'urgent-alert',
    row: 'New support request',
    to: 'Super admins and admins, for an Urgent request (setting "Alert all admins about new Urgent requests")',
    subject: urgentSubject(request.code, request.company),
    render: (siteUrl) => (
      <UrgentRequestEmail
        siteUrl={siteUrl}
        firstName="Emma"
        code={request.code}
        title="Checkout is down"
        company={request.company}
        projectName={request.projectName}
        priorityLabel="Urgent"
        description="Nobody can pay since 09:10. Customers see a blank page after entering their card."
        link={team(siteUrl)}
      />
    ),
  },
  {
    key: 'request-assigned',
    row: 'Request assigned or transferred',
    to: 'The developer it was assigned or transferred to',
    subject: assignedSubject(request.code),
    render: (siteUrl) => (
      <RequestAssignedEmail
        siteUrl={siteUrl}
        firstName="Daniyal"
        assignedBy="Emma Clarke"
        {...request}
        link={team(siteUrl)}
      />
    ),
  },
  {
    key: 'team-reply',
    row: 'Team reply to customer',
    to: 'The customer (preference "The team replies")',
    subject: teamReplySubject('Daniyal Ahmed', request.code),
    render: (siteUrl) => (
      <TeamReplyEmail
        siteUrl={siteUrl}
        firstName="Sarah"
        authorName="Daniyal Ahmed"
        code={request.code}
        title={request.title}
        body="Thanks, Sarah. We found the cause: the payment provider's script loads too late on mobile. A fix is on the way."
        link={portal(siteUrl)}
      />
    ),
  },
  {
    key: 'customer-replied',
    row: 'Customer reply',
    to: 'The assigned developer (setting "Notify the assigned developer when a customer replies")',
    subject: customerRepliedSubject('Sarah Mitchell', request.code),
    render: (siteUrl) => (
      <CustomerRepliedEmail
        siteUrl={siteUrl}
        firstName="Daniyal"
        customerName="Sarah Mitchell"
        {...request}
        body="Here is a screenshot of the error. It happened at about 09:20 this morning."
        link={team(siteUrl)}
      />
    ),
  },
  ...(['WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'] as const).map(
    (status): EmailPreview => ({
      key: `status-${status.toLowerCase().replace(/_/g, '-')}`,
      row: 'Status changed / needs info / resolved / closed',
      to:
        status === 'RESOLVED'
          ? 'The customer (preference "A status changes"). It asks them to confirm the fix.'
          : status === 'CLOSED'
            ? 'The customer (preference "A status changes"), also when a request closes by itself after 7 days'
            : 'The customer (preference "A status changes")',
      subject: statusChangedSubject(request.code, status),
      render: (siteUrl) => (
        <StatusChangedEmail
          siteUrl={siteUrl}
          firstName="Sarah"
          code={request.code}
          title={request.title}
          status={status}
          note={
            status === 'WAITING_FOR_CUSTOMER'
              ? 'Could you share a screenshot of the error and roughly when it happened? That will help us reproduce it.'
              : status === 'RESOLVED'
                ? 'The fix is live. The payment page now loads in under two seconds on mobile.'
                : undefined
          }
          link={portal(siteUrl)}
        />
      ),
    }),
  ),
  {
    key: 'daily-digest',
    row: 'Daily digest of requests waiting for review',
    to: 'Super admins, admins and managers, every morning (setting "Daily digest of requests waiting for review")',
    subject: dailyDigestSubject(2),
    render: (siteUrl) => (
      <DailyDigestEmail
        siteUrl={siteUrl}
        firstName="Emma"
        total={2}
        rows={[
          {
            code: 'TKT-2026-00125',
            title: 'Add Apple Pay to the checkout',
            company: 'Bluewave Holidays',
            priority: 'Medium',
            waiting: 'Waiting 2 days',
            due: 'Overdue',
          },
          {
            code: 'TKT-2026-00126',
            title: 'Stock sync fails overnight',
            company: 'Atlas Outdoor',
            priority: 'High',
            waiting: 'Waiting 3 hours',
            due: 'Due Tue 10 Nov, 14:00',
          },
        ]}
        link={`${siteUrl}/team/requests?status=submitted`}
      />
    ),
  },
  {
    key: 'weekly-summary',
    row: 'Weekly summary of my requests',
    to: 'Customers who ticked "Weekly summary of my requests", on Mondays (not in the §7 table; asked for in Phase 9)',
    subject: weeklySummarySubject,
    render: (siteUrl) => (
      <WeeklySummaryEmail
        siteUrl={siteUrl}
        firstName="Sarah"
        open={[
          {
            code: 'TKT-2026-00122',
            title: 'Confirmation email missing passenger names',
            project: 'Bluewave booking website',
            status: 'Waiting for Customer',
          },
          {
            code: 'TKT-2026-00118',
            title: 'Multi-city flight search returns no results',
            project: 'Bluewave booking website',
            status: 'In Progress',
          },
        ]}
        finished={[
          {
            code: 'TKT-2026-00114',
            title: 'Baggage allowance missing on return flights',
            project: 'Bluewave booking website',
            status: 'Resolved',
          },
        ]}
        link={`${siteUrl}/portal/requests`}
      />
    ),
  },

  // -------------------------------------------------------- website leads
  {
    key: 'demo-received',
    row: 'Demo requested',
    to: 'The visitor: their confirmation',
    subject: demoReceivedSubject,
    render: (siteUrl) => (
      <DemoReceivedEmail
        siteUrl={siteUrl}
        firstName="Olivia"
        code="DEM-2026-031"
        topic="Travel booking platform"
        when={demoWhen}
        company="Skyhaven Travel"
        email="olivia.grant@skyhaventravel.co.uk"
      />
    ),
  },
  {
    key: 'lead-alert-demo',
    row: 'Demo requested',
    to: 'Super admins, admins and managers: the team alert',
    subject: 'New demo request DEM-2026-031 from Olivia Grant, Skyhaven Travel',
    render: (siteUrl) => (
      <NewLeadAlertEmail
        siteUrl={siteUrl}
        firstName="Emma"
        subject="New demo request DEM-2026-031 from Olivia Grant, Skyhaven Travel"
        code="DEM-2026-031"
        title="Travel booking platform"
        lines={[
          `Preferred time: ${demoWhen}`,
          'Company: Skyhaven Travel',
          'Sent from: Travel Technology page',
        ]}
        text="We have three branches and want flight search and booking on our own website."
        link={`${siteUrl}/team/leads/demos/DEM-2026-031`}
      />
    ),
  },
  ...([false, true] as const).map((moved): EmailPreview => ({
    key: moved ? 'demo-moved' : 'demo-invite',
    row: 'Demo confirmed or rescheduled',
    to: 'The visitor, with the calendar invite (.ics)',
    calendar: true,
    subject: demoInviteSubject(demoWhen, moved),
    render: (siteUrl) => (
      <DemoInviteEmail
        siteUrl={siteUrl}
        firstName="Olivia"
        subject={demoInviteSubject(demoWhen, moved)}
        text={demoInviteText({
          firstName: 'Olivia',
          day: 'Tuesday 10 November',
          time: '11:00',
          host: 'Emma Clarke',
          link: 'https://meet.google.com/abc-defg-hij',
          moved,
        })}
        code="DEM-2026-031"
        topic="Travel booking platform"
        when={demoWhen}
        link="https://meet.google.com/abc-defg-hij"
      />
    ),
  })),
  {
    key: 'demo-cancelled',
    row: 'Demo cancelled',
    to: 'The visitor, if "Email them that the demo is cancelled" is ticked (with a cancelling .ics if it was booked)',
    calendar: true,
    subject: demoCancelledSubject,
    render: (siteUrl) => (
      <DemoCancelledEmail
        siteUrl={siteUrl}
        firstName="Lukas"
        text={demoCancelledText('Lukas', 'Friday 6 November')}
      />
    ),
  },
  {
    key: 'quote-received',
    row: 'Quote requested',
    to: 'The visitor: their confirmation',
    subject: quoteReceivedSubject,
    render: (siteUrl) => (
      <QuoteReceivedEmail
        siteUrl={siteUrl}
        firstName="Hannah"
        code="QUO-2026-042"
        projectType="API integration"
        budget="£15k – £50k"
        timeline="Within 3–6 months"
        email="hannah.weber@alpenblick-hotels.de"
        requirements="Connect our booking engine to our channel manager and our accounting software, so bookings and invoices sync automatically."
      />
    ),
  },
  {
    key: 'lead-alert-quote',
    row: 'Quote requested',
    to: 'Super admins, admins and managers: the team alert',
    subject:
      'New quote request QUO-2026-042 from Hannah Weber, Alpenblick Hotels',
    render: (siteUrl) => (
      <NewLeadAlertEmail
        siteUrl={siteUrl}
        firstName="Emma"
        subject="New quote request QUO-2026-042 from Hannah Weber, Alpenblick Hotels"
        code="QUO-2026-042"
        title="API integration"
        lines={[
          'Budget: £15k – £50k',
          'Timeline: Within 3–6 months',
          'Sent from: Contact & Quote page',
        ]}
        text="Connect our booking engine to our channel manager and our accounting software."
        link={`${siteUrl}/team/leads/quotes/QUO-2026-042`}
      />
    ),
  },
  ...([false, true] as const).map((updated): EmailPreview => ({
    key: updated ? 'estimate-updated' : 'estimate',
    row: 'Estimate sent or updated',
    to: 'The visitor',
    subject: estimateSubject(updated),
    render: (siteUrl) => (
      <EstimateEmail
        siteUrl={siteUrl}
        firstName="Hannah"
        subject={estimateSubject(updated)}
        code="QUO-2026-042"
        projectType="API integration"
        amount={updated ? '£22,000' : '£24,000'}
        deliveryTime="6–8 weeks"
        validUntil="23 November 2026"
        summary="Connect your booking engine to your channel manager and your accounting software, so bookings and invoices sync automatically."
      />
    ),
  })),
  {
    key: 'lead-alert-message',
    row: 'Contact message received',
    to: 'Super admins, admins and managers: the team alert',
    subject: 'New message MSG-2026-019 from Laura Bennett · Partnership',
    render: (siteUrl) => (
      <NewLeadAlertEmail
        siteUrl={siteUrl}
        firstName="Emma"
        subject="New message MSG-2026-019 from Laura Bennett · Partnership"
        code="MSG-2026-019"
        title="Partnership"
        lines={['From: Laura Bennett · laura.bennett@pennineux.co.uk']}
        text="We are a small UX studio in Leeds and often need a development partner for booking projects."
        link={`${siteUrl}/team/leads/messages/MSG-2026-019`}
      />
    ),
  },
  {
    key: 'lead-email',
    row: 'Lead email from the composer',
    to: "The lead's contact, written in the lead's composer",
    subject: leadEmailSubject('quote', 'QUO-2026-042'),
    render: (siteUrl) => (
      <LeadMessageEmail
        siteUrl={siteUrl}
        firstName="Hannah"
        subject={leadEmailSubject('quote', 'QUO-2026-042')}
        body={
          'Hi Hannah, thanks for the details. Could you send the API documentation for your channel manager?\n\nThen we can prepare your estimate.'
        }
        senderName="Sofia Martins"
      />
    ),
  },
];
