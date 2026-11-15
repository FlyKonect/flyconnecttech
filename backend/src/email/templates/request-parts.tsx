import { Section, Text } from '@react-email/components';
import type { ReactNode } from 'react';
import { colors } from './layout.js';

/** A grey box: a request's code and title, and optional lines below. */
export function RequestCard({
  code,
  title,
  lines = [],
}: {
  code: string;
  title: string;
  lines?: string[];
}) {
  return (
    <Section
      style={{
        margin: '4px 0 18px',
        padding: '16px 18px',
        background: colors.page,
        borderRadius: 12,
      }}
    >
      <Text
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: '20px',
          fontWeight: 700,
          color: colors.goldText,
        }}
      >
        {code}
      </Text>
      <Text
        style={{
          margin: '2px 0 0',
          fontSize: 16,
          lineHeight: '24px',
          fontWeight: 700,
          color: colors.navy,
        }}
      >
        {title}
      </Text>
      {lines.map((line) => (
        <Text
          key={line}
          style={{
            margin: '4px 0 0',
            fontSize: 13,
            lineHeight: '20px',
            color: colors.muted,
          }}
        >
          {line}
        </Text>
      ))}
    </Section>
  );
}

/** A message quoted in an email, with a gold line on its left. */
export function Quote({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        margin: '0 0 18px',
        padding: '4px 0 4px 14px',
        borderLeft: `3px solid ${colors.gold}`,
        fontSize: 15,
        lineHeight: '24px',
        color: colors.body,
        whiteSpace: 'pre-wrap',
      }}
    >
      {children}
    </Text>
  );
}

/** Long text cut to a readable length for an email. */
export function shorten(text: string, max = 600): string {
  const clean = text.trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}
