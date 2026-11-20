import {
  EmailLayout,
  Heading,
  Paragraph,
  PrimaryButton,
  SmallPrint,
} from './layout.js';

export const accountLockedSubject = 'Your FlyConnect Tech account was locked';

/** To the owner, when 10 wrong passwords locked the account (sign-in-lock.ts). */
export function AccountLockedEmail(props: {
  siteUrl: string;
  firstName: string;
  /** The "Forgot password" page of their side (portal or team). */
  resetLink: string;
}) {
  return (
    <EmailLayout preview={accountLockedSubject} siteUrl={props.siteUrl}>
      <Heading>Your account was locked for 15 minutes</Heading>
      <Paragraph>
        Hi {props.firstName}, someone typed a wrong password for your FlyConnect
        Tech account 10 times in a short while, so we locked it for 15 minutes
        to keep it safe.
      </Paragraph>
      <Paragraph>
        If this was you, wait 15 minutes and try again, or choose a new password
        now. If it was not you, choose a new password straight away.
      </Paragraph>
      <PrimaryButton href={props.resetLink}>
        Choose a new password
      </PrimaryButton>
      <SmallPrint href={props.resetLink}>
        Your password has not been changed.
      </SmallPrint>
    </EmailLayout>
  );
}
