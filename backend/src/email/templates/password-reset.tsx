import {
  EmailLayout,
  Heading,
  Paragraph,
  PrimaryButton,
  SmallPrint,
} from './layout.js';

export type PasswordResetEmailProps = {
  siteUrl: string;
  firstName: string;
  link: string;
  expiresInHours: number;
  /** True when a team member sent it from the customer page. */
  sentByTeam: boolean;
};

export const passwordResetSubject = 'Reset your FlyConnect Tech password';

/** The email with the link to choose a new password. */
export function PasswordResetEmail(props: PasswordResetEmailProps) {
  return (
    <EmailLayout preview={passwordResetSubject} siteUrl={props.siteUrl}>
      <Heading>Reset your password</Heading>
      <Paragraph>
        Hi {props.firstName},{' '}
        {props.sentByTeam
          ? 'our team has sent you a link to choose a new password for your FlyConnect Tech account.'
          : 'we received a request to reset the password for your FlyConnect Tech account.'}
      </Paragraph>
      <PrimaryButton href={props.link}>Choose a new password</PrimaryButton>
      <SmallPrint href={props.link}>
        This link expires in {props.expiresInHours} hours and works once. If you
        did not ask for it, you can ignore this email: your password stays the
        same.
      </SmallPrint>
    </EmailLayout>
  );
}
