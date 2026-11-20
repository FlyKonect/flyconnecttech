import { EmailLayout, Heading, Paragraph, PrimaryButton } from './layout.js';
import { RequestCard } from './request-parts.js';

/** One request in the digest. */
export type DigestRow = {
  code: string;
  title: string;
  company: string;
  priority: string;
  /** "Waiting 2 days" */
  waiting: string;
  /** "Due Tue 10 Nov, 14:00", "Overdue", or nothing. */
  due: string | null;
};

export const dailyDigestSubject = (count: number) =>
  count === 1
    ? '1 request waiting for review'
    : `${count} requests waiting for review`;

/**
 * The daily digest (docs/01 §7): the support requests still waiting for
 * review, oldest first, for super admins, admins and managers.
 */
export function DailyDigestEmail(props: {
  siteUrl: string;
  firstName: string;
  rows: DigestRow[];
  /** All waiting requests; rows holds the oldest of them. */
  total: number;
  /** New requests in the team panel. */
  link: string;
}) {
  const more = props.total - props.rows.length;
  return (
    <EmailLayout
      preview={dailyDigestSubject(props.total)}
      siteUrl={props.siteUrl}
      signOff={false}
    >
      <Heading>Requests waiting for review</Heading>
      <Paragraph>
        Hi {props.firstName},{' '}
        {props.total === 1
          ? '1 support request is waiting for someone to review it and assign a developer.'
          : `${props.total} support requests are waiting for someone to review them and assign a developer. The oldest come first.`}
      </Paragraph>
      {props.rows.map((row) => (
        <RequestCard
          key={row.code}
          code={row.code}
          title={row.title}
          lines={[
            `${row.company} · ${row.priority}`,
            [row.waiting, row.due].filter(Boolean).join(' · '),
          ]}
        />
      ))}
      {more > 0 ? (
        <Paragraph>And {more} more in the team panel.</Paragraph>
      ) : null}
      <PrimaryButton href={props.link}>Review new requests</PrimaryButton>
    </EmailLayout>
  );
}
