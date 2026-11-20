import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Column,
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

/** The company's details, shown in every email's footer (legal page). */
export const company = {
  brand: 'FlyConnect Tech',
  tagline: 'Travel technology, websites and integrations',
  email: 'info@flyconnecttech.co.uk',
  legal:
    'FlyConnect Tech is a trading brand of FlyConnect Limited, a company registered in England and Wales, company number 16152024.',
};

const footerText = {
  margin: '0 0 6px',
  fontSize: 12,
  lineHeight: '18px',
  color: colors.muted,
  textAlign: 'center' as const,
};
const footerLink = {
  color: colors.navy,
  textDecoration: 'none',
  fontWeight: 600,
};

export function EmailLayout({
  preview,
  siteUrl,
  signOff = true,
  portalNote = false,
  children,
}: {
  /** The short line email programs show next to the subject. */
  preview: string;
  /** The website's address, for the logo and links. */
  siteUrl: string;
  /** "Kind regards, The FlyConnect Tech team" under the message. */
  signOff?: boolean;
  /**
   * For emails about a customer's request: replies sent by email never
   * reach the request, so say where to reply (above the message).
   */
  portalNote?: boolean;
  children: ReactNode;
}) {
  const host = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
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
            maxWidth: 580,
            margin: '0 auto',
            background: '#FFFFFF',
            borderRadius: 16,
            overflow: 'hidden',
            border: `1px solid ${colors.line}`,
          }}
        >
          {/* Header: the logo on navy, a gold line under it. */}
          <Section
            style={{
              background: colors.navy,
              padding: '22px 32px',
              borderBottom: `4px solid ${colors.gold}`,
            }}
          >
            <Row>
              <Column>
                <Link href={siteUrl}>
                  <Img
                    src={`${siteUrl}/brand/email-logo.png`}
                    alt="FlyConnect Tech"
                    height={30}
                    style={{ height: 30, width: 'auto' }}
                  />
                </Link>
              </Column>
              <Column align="right">
                <Text
                  style={{
                    margin: 0,
                    fontSize: 12,
                    lineHeight: '16px',
                    color: '#C5D0EA',
                  }}
                >
                  {host}
                </Text>
              </Column>
            </Row>
          </Section>

          <Section style={{ padding: '32px 32px 8px' }}>
            {portalNote ? (
              <Text
                style={{
                  margin: '0 0 22px',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: colors.chip,
                  fontSize: 13,
                  lineHeight: '20px',
                  color: colors.body,
                }}
              >
                Please reply in the client portal, not to this email. Replies
                sent by email don&apos;t reach your request.
              </Text>
            ) : null}
            {children}
            {signOff ? (
              <Text
                style={{
                  margin: '22px 0 0',
                  fontSize: 15,
                  lineHeight: '24px',
                  color: colors.body,
                }}
              >
                Kind regards,
                <br />
                <strong style={{ color: colors.navy }}>
                  The FlyConnect Tech team
                </strong>
              </Text>
            ) : null}
          </Section>

          {/* Help line inside the card. */}
          <Section style={{ padding: '0 32px 28px' }}>
            <Hr style={{ borderColor: colors.line, margin: '22px 0 16px' }} />
            <Text
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: '20px',
                color: colors.muted,
              }}
            >
              Questions? Reply to this email or write to{' '}
              <Link
                href={`mailto:${company.email}`}
                style={{ color: colors.goldText }}
              >
                {company.email}
              </Link>
              .
            </Text>
          </Section>
        </Container>

        {/* Footer: who we are, how to reach us, the legal line. */}
        <Container style={{ maxWidth: 580, margin: '22px auto 0' }}>
          <Text
            style={{
              ...footerText,
              fontSize: 14,
              fontWeight: 700,
              color: colors.navy,
            }}
          >
            {company.brand}
          </Text>
          <Text style={footerText}>{company.tagline}</Text>
          <Text style={{ ...footerText, margin: '10px 0' }}>
            <Link href={siteUrl} style={footerLink}>
              Website
            </Link>
            {'  ·  '}
            <Link href={`${siteUrl}/portal/sign-in`} style={footerLink}>
              Client portal
            </Link>
            {'  ·  '}
            <Link href={`${siteUrl}/support`} style={footerLink}>
              Support
            </Link>
            {'  ·  '}
            <Link href={`${siteUrl}/privacy`} style={footerLink}>
              Privacy
            </Link>
          </Text>
          <Text style={footerText}>
            <Link href={`mailto:${company.email}`} style={footerLink}>
              {company.email}
            </Link>
            {'  ·  '}
            <Link href={siteUrl} style={footerLink}>
              {host}
            </Link>
          </Text>
          <Text style={{ ...footerText, marginTop: 12, fontSize: 11 }}>
            {company.legal}
          </Text>
          <Text style={{ ...footerText, fontSize: 11 }}>
            You received this email because of your FlyConnect Tech account or
            your enquiry.
          </Text>
        </Container>
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
