import type { EmailService } from '../email/email.service.js';
import {
  AccountLockedEmail,
  accountLockedSubject,
} from '../email/templates/account-locked.js';
import type { LockedAccount } from './auth.js';

/** The email to someone whose account was just locked (sign-in-lock.ts). */
export async function sendLockedNotice(
  email: EmailService,
  siteUrl: string,
  account: LockedAccount,
): Promise<void> {
  const forgot =
    account.side === 'TEAM'
      ? '/team/forgot-password'
      : '/portal/forgot-password';
  await email.send({
    to: account.email,
    subject: accountLockedSubject,
    template: (
      <AccountLockedEmail
        siteUrl={siteUrl}
        firstName={account.name.split(/\s+/)[0] || account.name}
        resetLink={`${siteUrl}${forgot}`}
      />
    ),
  });
}
