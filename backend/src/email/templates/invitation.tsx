import { Section, Text } from '@react-email/components';
import {
  colors,
  EmailLayout,
  Heading,
  Paragraph,
  PrimaryButton,
  SmallPrint,
} from './layout.js';

export type InvitationEmailProps = {
  siteUrl: string;
  /** The person invited, for "Hi Sarah". */
  firstName: string;
  /** Who created the account, for example "Emma Clarke". Empty for the first super admin. */
  inviterName: string | null;
  link: string;
  expiresInHours: number;
} & (
  | { kind: 'customer'; company: string; projects: string[] }
  | { kind: 'team'; roleLabel: string }
);

export function invitationSubject(props: InvitationEmailProps): string {
  return props.kind === 'customer'
    ? 'Your FlyConnect Tech support account is ready'
    : 'Your FlyConnect Tech team account is ready';
}

/** The invitation email (design/screens/portal/02-invitation-email.jpg). */
export function InvitationEmail(props: InvitationEmailProps) {
  const by = props.inviterName ? `${props.inviterName} has` : 'we have';

  return (
    <EmailLayout preview={invitationSubject(props)} siteUrl={props.siteUrl}>
      <Heading>{invitationSubject(props)}</Heading>
      {props.kind === 'customer' ? (
        <>
          <Paragraph>
            Hi {props.firstName}, {by} created a customer account for{' '}
            {props.company} so you can send and track support requests
            {props.projects.length ? ' for these projects:' : '.'}
          </Paragraph>
          {props.projects.length ? (
            <Section style={{ margin: '0 0 6px' }}>
              {props.projects.map((project) => (
                <Text
                  key={project}
                  style={{
                    display: 'inline-block',
                    margin: '0 8px 8px 0',
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: colors.chip,
                    color: '#0C3584',
                    fontSize: 13,
                    fontWeight: 700,
                    lineHeight: '20px',
                  }}
                >
                  {project}
                </Text>
              ))}
            </Section>
          ) : null}
        </>
      ) : (
        <Paragraph>
          Hi {props.firstName}, {by} added you to the FlyConnect Tech team panel
          as {props.roleLabel}. Set your password, then set up two-factor
          sign-in with an authenticator app.
        </Paragraph>
      )}
      <PrimaryButton href={props.link}>
        Verify email and set password
      </PrimaryButton>
      <SmallPrint href={props.link}>
        This link expires in {props.expiresInHours} hours. If you were not
        expecting this email, you can ignore it.
      </SmallPrint>
    </EmailLayout>
  );
}
