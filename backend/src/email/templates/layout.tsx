import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';

/**
 * The look shared by every email: navy header with the logo, white card,
 * gold accents (docs/01, section 7). Email programs ignore most modern CSS,
 * so everything is plain inline styles.
 */

export const colors = {
  navy: '#021A54',
  gold: '#D3AF34',
  goldText: '#846E21',
  body: '#3E4C66',
  muted: '#5A6882',
  line: '#E1E8F2',
  page: '#F4F6FA',
  chip: '#EEF2FA',
};

const font =
  "Inter, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function EmailLayout({
  preview,
  siteUrl,
  children,
}: {
  /** The short line email programs show next to the subject. */
  preview: string;
  /** The website's address, for the logo and links. */
  siteUrl: string;
  children: ReactNode;
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          padding: '32px 12px',
          background: colors.page,
          fontFamily: font,
        }}
      >
        <Container
          style={{
            maxWidth: 560,
            margin: '0 auto',
            background: '#FFFFFF',
            borderRadius: 16,
            overflow: 'hidden',
            border: `1px solid ${colors.line}`,
          }}
        >
          <Section
            style={{
              background: colors.navy,
              padding: '22px 32px',
              borderBottom: `4px solid ${colors.gold}`,
            }}
          >
            <Img
              src={`${siteUrl}/brand/email-logo.png`}
              alt="FlyConnect Tech"
              height={30}
              style={{ height: 30, width: 'auto' }}
            />
          </Section>
          <Section style={{ padding: '32px 32px 28px' }}>{children}</Section>
        </Container>
        <Text
          style={{
            maxWidth: 560,
            margin: '16px auto 0',
            fontSize: 12,
            lineHeight: '18px',
            color: colors.muted,
            textAlign: 'center',
          }}
        >
          FlyConnect Tech · Design, development and integration
        </Text>
      </Body>
    </Html>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        margin: '0 0 14px',
        fontSize: 22,
        lineHeight: '28px',
        fontWeight: 700,
        color: colors.navy,
      }}
    >
      {children}
    </Text>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        margin: '0 0 14px',
        fontSize: 15,
        lineHeight: '24px',
        color: colors.body,
      }}
    >
      {children}
    </Text>
  );
}

export function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Section style={{ margin: '22px 0' }}>
      <Button
        href={href}
        style={{
          display: 'block',
          background: colors.navy,
          color: '#FFFFFF',
          borderRadius: 10,
          padding: '14px 20px',
          fontSize: 16,
          fontWeight: 700,
          textAlign: 'center',
          textDecoration: 'none',
        }}
      >
        {children}
      </Button>
    </Section>
  );
}

/** Small grey print under the button, with the link written out. */
export function SmallPrint({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <>
      <Text
        style={{
          margin: '0 0 8px',
          fontSize: 13,
          lineHeight: '20px',
          color: colors.muted,
        }}
      >
        {children}
      </Text>
      <Hr style={{ borderColor: colors.line, margin: '18px 0' }} />
      <Text
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: '18px',
          color: colors.muted,
          wordBreak: 'break-all',
        }}
      >
        If the button does not work, copy this link into your browser:{' '}
        <a href={href} style={{ color: colors.goldText }}>
          {href}
        </a>
      </Text>
    </>
  );
}
