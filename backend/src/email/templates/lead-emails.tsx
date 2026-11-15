import { EmailLayout, Heading, Paragraph, PrimaryButton } from './layout.js';
import { Quote, RequestCard, shorten } from './request-parts.js';

/**
 * Emails about website leads (docs/01, sections 2, 6 and 7): the visitor's
 * confirmations, the team alert, the demo invite and cancellation, the
 * estimate, and an email written in a lead's composer. The wording follows
 * the website's success states and the design's activity lines. Bracketed
 * text is a placeholder the client still has to fill in.
 */

type Base = { siteUrl: string; firstName: string };

// ------------------------------------------------------------ visitor

export const demoReceivedSubject = 'Your FlyConnect Tech demo request';

export function DemoReceivedEmail(
  props: Base & {
    code: string;
    topic: string;
    when: string;
    company: string;
    email: string;
  },
) {
  return (
    <EmailLayout preview={demoReceivedSubject} siteUrl={props.siteUrl}>
      <Heading>Demo requested</Heading>
      <Paragraph>
        Thanks, {props.firstName}. We will send a calendar invite to{' '}
        {props.email} within [1 business day].
      </Paragraph>
      <RequestCard
        code={props.code}
        title={props.topic}
        lines={[
          `When: ${props.when}`,
          'Where: Video call · 30 minutes',
          `Company: ${props.company}`,
        ]}
      />
    </EmailLayout>
  );
}

export const quoteReceivedSubject = 'We received your quote request';

export function QuoteReceivedEmail(
  props: Base & {
    code: string;
    projectType: string;
    budget: string;
    timeline: string | null;
    email: string;
    requirements: string;
  },
) {
  return (
    <EmailLayout preview={quoteReceivedSubject} siteUrl={props.siteUrl}>
      <Heading>Your request is in</Heading>
      <Paragraph>
        Thanks, {props.firstName}. Your request is in. We will reply to{' '}
        {props.email} within 1 business day with next steps, a rough scope and
        an estimate.
      </Paragraph>
      <RequestCard
        code={props.code}
        title={props.projectType}
        lines={[
          `Budget: ${props.budget}`,
          ...(props.timeline ? [`Timeline: ${props.timeline}`] : []),
        ]}
      />
      <Quote>{shorten(props.requirements)}</Quote>
    </EmailLayout>
  );
}

// --------------------------------------------------------------- team

export function NewLeadAlertEmail(
  props: Base & {
    /** "New demo request DEM-2026-031 from Olivia Grant, Skyhaven Travel" */
    subject: string;
    code: string;
    title: string;
    lines: string[];
    text: string | null;
    link: string;
  },
) {
  return (
    <EmailLayout preview={props.subject} siteUrl={props.siteUrl}>
      <Heading>{props.subject.replace(/ [A-Z]{3}-\d{4}-\d+/, '')}</Heading>
      <Paragraph>
        Hi {props.firstName}, this just came in from the website.
      </Paragraph>
      <RequestCard code={props.code} title={props.title} lines={props.lines} />
      {props.text ? <Quote>{shorten(props.text)}</Quote> : null}
      <PrimaryButton href={props.link}>Open in the team panel</PrimaryButton>
    </EmailLayout>
  );
}

// --------------------------------------------------------------- demo

export const demoInviteSubject = (when: string, moved: boolean) =>
  moved
    ? `Your FlyConnect Tech demo has moved: ${when}`
    : `Your FlyConnect Tech demo is confirmed: ${when}`;

/** The invite's text, also saved in the lead's activity. */
export function demoInviteText(props: {
  firstName: string;
  day: string;
  time: string;
  host: string;
  link: string | null;
  moved: boolean;
}): string {
  return (
    `Hi ${props.firstName}, your FlyConnect Tech demo is ` +
    `${props.moved ? 'moved to' : 'confirmed for'} ${props.day} at ${props.time} UK time with ${props.host}. ` +
    (props.link
      ? `Join the video call here: ${props.link}`
      : 'We will email you the video call link before the call.')
  );
}

export function DemoInviteEmail(
  props: Base & {
    subject: string;
    text: string;
    code: string;
    topic: string;
    when: string;
    link: string | null;
  },
) {
  return (
    <EmailLayout preview={props.subject} siteUrl={props.siteUrl}>
      <Heading>Your demo is booked</Heading>
      <Paragraph>{props.text}</Paragraph>
      <RequestCard
        code={props.code}
        title={props.topic}
        lines={[`When: ${props.when}`, 'Where: Video call · 30 minutes']}
      />
      <Paragraph>
        The calendar invite is attached. Add it to your calendar so you do not
        miss it.
      </Paragraph>
      {props.link ? (
        <PrimaryButton href={props.link}>Join the video call</PrimaryButton>
      ) : null}
    </EmailLayout>
  );
}

export const demoCancelledSubject = 'Your FlyConnect Tech demo is cancelled';

export const demoCancelledText = (firstName: string, day: string) =>
  `Hi ${firstName}, we have cancelled your demo request for ${day}. ` +
  'You can book a new time on our website whenever it suits you.';

export function DemoCancelledEmail(props: Base & { text: string }) {
  return (
    <EmailLayout preview={demoCancelledSubject} siteUrl={props.siteUrl}>
      <Heading>Demo cancelled</Heading>
      <Paragraph>{props.text}</Paragraph>
      <PrimaryButton href={props.siteUrl}>Visit our website</PrimaryButton>
    </EmailLayout>
  );
}

// -------------------------------------------------------------- quote

export const estimateSubject = (updated: boolean) =>
  updated
    ? 'Your updated estimate from FlyConnect Tech'
    : 'Your estimate from FlyConnect Tech';

/** The estimate's text, also saved in the lead's activity. */
export function estimateText(props: {
  firstName: string;
  projectType: string;
  amount: string;
  deliveryTime: string;
  validUntil: string;
  summary: string;
}): string {
  return (
    `Hi ${props.firstName}, here is our estimate for your ${props.projectType.toLowerCase()} project: ` +
    `${props.amount}, delivered in about ${props.deliveryTime}. ` +
    (props.summary ? `${props.summary} ` : '') +
    `The estimate is valid until ${props.validUntil}.`
  );
}

export function EstimateEmail(
  props: Base & {
    subject: string;
    code: string;
    projectType: string;
    amount: string;
    deliveryTime: string;
    validUntil: string;
    summary: string;
  },
) {
  return (
    <EmailLayout preview={props.subject} siteUrl={props.siteUrl}>
      <Heading>Your estimate</Heading>
      <Paragraph>
        Hi {props.firstName}, here is our estimate for your{' '}
        {props.projectType.toLowerCase()} project.
      </Paragraph>
      <RequestCard
        code={props.code}
        title={props.amount}
        lines={[
          `Delivery time: ${props.deliveryTime}`,
          `Valid until: ${props.validUntil}`,
        ]}
      />
      {props.summary ? (
        <>
          <Paragraph>What is included:</Paragraph>
          <Quote>{shorten(props.summary, 3000)}</Quote>
        </>
      ) : null}
      <Paragraph>
        Reply to this email with any questions, or to go ahead.
      </Paragraph>
    </EmailLayout>
  );
}

// ------------------------------------------------------------ composer

export const leadEmailSubject = (
  kind: 'demo' | 'quote' | 'message',
  code: string,
) =>
  kind === 'demo'
    ? `About your demo request ${code}`
    : kind === 'quote'
      ? `About your quote request ${code}`
      : 'About your message to FlyConnect Tech';

export function LeadMessageEmail(
  props: Base & { subject: string; body: string; senderName: string },
) {
  return (
    <EmailLayout preview={props.subject} siteUrl={props.siteUrl}>
      {props.body.split(/\n{2,}/).map((paragraph, index) => (
        <Paragraph key={index}>{paragraph}</Paragraph>
      ))}
      <Paragraph>
        {props.senderName}
        <br />
        FlyConnect Tech
      </Paragraph>
    </EmailLayout>
  );
}
