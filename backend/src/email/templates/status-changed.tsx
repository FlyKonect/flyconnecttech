import type { RequestStatus } from '../../generated/prisma/client.js';
import { STATUS_LABELS } from '../../requests/labels.js';
import { EmailLayout, Heading, Paragraph, PrimaryButton } from './layout.js';
import { Quote, RequestCard, shorten } from './request-parts.js';

export type StatusChangedEmailProps = {
  siteUrl: string;
  firstName: string;
  code: string;
  title: string;
  status: RequestStatus;
  /** An optional message from the team, for example the resolve note. */
  note?: string;
  link: string;
};

/** The same words as the in-app notification (docs/01, section 7). */
export function statusChangedSubject(code: string, status: RequestStatus) {
  if (status === 'WAITING_FOR_CUSTOMER') {
    return `${code} needs more information from you`;
  }
  if (status === 'RESOLVED') {
    return `${code} was resolved. Please confirm the fix.`;
  }
  if (status === 'CLOSED') return `${code} was closed`;
  return `${code} moved to ${STATUS_LABELS[status]}`;
}

const content: Partial<
  Record<RequestStatus, { heading: string; text: string; button: string }>
> = {
  WAITING_FOR_CUSTOMER: {
    heading: 'We need more information',
    text: 'The support team is waiting for your reply. Answer to move this request forward.',
    button: 'Reply to the team',
  },
  RESOLVED: {
    heading: 'Your request was resolved',
    text: 'Please check the fix. If everything works, confirm it and the request closes. If not, choose "I still need help" and we will keep working on it.',
    button: 'Confirm the fix',
  },
  CLOSED: {
    heading: 'Your request was closed',
    text: 'If you still need help with it, you can reopen the request.',
    button: 'View request',
  },
};

/** A status change on the customer's request. */
export function StatusChangedEmail(props: StatusChangedEmailProps) {
  const label = STATUS_LABELS[props.status];
  const words = content[props.status] ?? {
    heading: `Your request moved to ${label}`,
    text: `The status of your request is now ${label}.`,
    button: 'View request',
  };
  return (
    <EmailLayout
      preview={statusChangedSubject(props.code, props.status)}
      siteUrl={props.siteUrl}
    >
      <Heading>{words.heading}</Heading>
      <Paragraph>
        Hi {props.firstName}, {words.text}
      </Paragraph>
      <RequestCard
        code={props.code}
        title={props.title}
        lines={[`Status: ${label}`]}
      />
      {props.note ? <Quote>{shorten(props.note, 1500)}</Quote> : null}
      <PrimaryButton href={props.link}>{words.button}</PrimaryButton>
    </EmailLayout>
  );
}
