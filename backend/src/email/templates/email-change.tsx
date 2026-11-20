import {
  EmailLayout,
  Heading,
  Paragraph,
  PrimaryButton,
  SmallPrint,
} from './layout.js';

export const emailChangeSubject = 'Confirm your new FlyConnect Tech email';
export const emailChangedSubject = 'Your FlyConnect Tech email was changed';

/** To the new address: the link that confirms it (an admin asked for it). */
export function EmailChangeEmail(props: {
  siteUrl: string;
  firstName: string;
  newEmail: string;
  link: string;
  expiresInHours: number;
}) {
  return (
    <EmailLayout preview={emailChangeSubject} siteUrl={props.siteUrl}>
      <Heading>Confirm your new email address</Heading>
      <Paragraph>
        Hi {props.firstName}, our team is changing the email address of your
        FlyConnect Tech account to <strong>{props.newEmail}</strong>. Confirm it
        to finish: from then on you sign in with this address.
      </Paragraph>
      <PrimaryButton href={props.link}>Confirm new email</PrimaryButton>
      <SmallPrint href={props.link}>
        This link expires in {props.expiresInHours} hours and works once. If you
        did not expect it, you can ignore this email: nothing changes.
      </SmallPrint>
    </EmailLayout>
  );
}

/** To the old address, once the change is confirmed. */
export function EmailChangedEmail(props: {
  siteUrl: string;
  firstName: string;
  newEmail: string;
}) {
  return (
    <EmailLayout preview={emailChangedSubject} siteUrl={props.siteUrl}>
      <Heading>Your email address was changed</Heading>
      <Paragraph>
        Hi {props.firstName}, the email address of your FlyConnect Tech account
        is now <strong>{props.newEmail}</strong>. Sign in with the new address
        from now on; your password stays the same.
      </Paragraph>
      <Paragraph>
        If you did not expect this, reply to this email or write to
        info@flyconnecttech.co.uk straight away.
      </Paragraph>
    </EmailLayout>
  );
}
