import { Text } from '@react-email/components';
import type { ReactNode } from 'react';
import {
  colors,
  EmailLayout,
  Heading,
  Paragraph,
  PrimaryButton,
} from './layout.js';
import { RequestCard } from './request-parts.js';

export type SummaryRow = {
  code: string;
  title: string;
  project: string;
  /** "In Progress", "Resolved"… */
  status: string;
};

export const weeklySummarySubject = 'Your weekly support summary';

function Subheading({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        margin: '22px 0 10px',
        fontSize: 15,
        lineHeight: '22px',
        fontWeight: 700,
        color: colors.navy,
      }}
    >
      {children}
    </Text>
  );
}

/**
 * The customer's weekly summary ("Weekly summary of my requests", screen
 * 15): their open requests, and what was resolved or closed this week.
 */
export function WeeklySummaryEmail(props: {
  siteUrl: string;
  firstName: string;
  open: SummaryRow[];
  finished: SummaryRow[];
  /** My requests in the client portal. */
  link: string;
}) {
  const card = (row: SummaryRow) => (
    <RequestCard
      key={row.code}
      code={row.code}
      title={row.title}
      lines={[`${row.project} · ${row.status}`]}
    />
  );
  return (
    <EmailLayout preview={weeklySummarySubject} siteUrl={props.siteUrl}>
      <Heading>Your week in support</Heading>
      <Paragraph>
        Hi {props.firstName}, here is where your requests stand.
      </Paragraph>
      {props.open.length ? (
        <>
          <Subheading>Open requests · {props.open.length}</Subheading>
          {props.open.map(card)}
        </>
      ) : null}
      {props.finished.length ? (
        <>
          <Subheading>
            Resolved or closed this week · {props.finished.length}
          </Subheading>
          {props.finished.map(card)}
        </>
      ) : null}
      <PrimaryButton href={props.link}>View my requests</PrimaryButton>
      <Paragraph>
        You get this summary because you asked for it in your profile. You can
        turn it off there at any time.
      </Paragraph>
    </EmailLayout>
  );
}
