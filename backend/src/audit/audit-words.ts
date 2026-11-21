import type { AuditAction } from './audit.service.js';

/** What each kind of entry says on the Activity log ("disabled a team member"). */
export const ACTION_WORDS: Record<AuditAction, string> = {
  'user.invited': 'invited',
  'invitation.resent': 'resent an invitation to',
  'user.roleChanged': 'changed the role of',
  'user.disabled': 'disabled',
  'user.enabled': 'enabled',
  'user.emailChanged': 'changed the email of',
  'user.twoFactorReset': 'reset two-step sign-in for',
  'user.deleted': 'deleted',
  'user.restored': 'restored',
  'passwordReset.sent': 'sent a password reset link to',
  'customer.created': 'added the customer',
  'customer.updated': 'renamed the customer',
  'customer.deleted': 'deleted the customer',
  'customer.restored': 'restored the customer',
  'project.added': 'added the project',
  'project.updated': 'edited the project',
  'project.statusChanged': 'changed the status of the project',
  'project.deleted': 'deleted the project',
  'project.restored': 'restored the project',
  'project.updateRemoved': 'removed an update from the project',
  'request.updated': 'edited the request',
  'export.downloaded': 'downloaded a CSV of',
  'settings.changed': 'changed the setting',
  'lead.converted': 'converted the lead',
  'testimonial.added': 'added a testimonial',
  'testimonial.changed': 'edited a testimonial',
  'testimonial.removed': 'removed a testimonial',
};

/** The groups of the "What" filter. */
export const ACTION_GROUPS: Record<string, AuditAction[]> = {
  accounts: [
    'user.invited',
    'invitation.resent',
    'user.roleChanged',
    'user.disabled',
    'user.enabled',
    'user.emailChanged',
    'user.twoFactorReset',
    'user.deleted',
    'user.restored',
    'passwordReset.sent',
  ],
  customers: [
    'customer.created',
    'customer.updated',
    'customer.deleted',
    'customer.restored',
    'project.added',
    'project.updated',
    'project.statusChanged',
    'project.deleted',
    'project.restored',
    'project.updateRemoved',
    'lead.converted',
  ],
  requests: ['request.updated'],
  exports: ['export.downloaded'],
  settings: [
    'settings.changed',
    'testimonial.added',
    'testimonial.changed',
    'testimonial.removed',
  ],
};

type Data = Record<string, unknown> | null;

const text = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : '';

/**
 * What the entry was about, in a few words: an email, a code, a list, or
 * "from → to". Taken from the entry's saved data; never secrets (the log
 * holds no passwords or links).
 */
export function auditSubject(
  action: AuditAction,
  entityId: string,
  data: Data,
): string {
  const d = data ?? {};
  if (action === 'export.downloaded' && entityId === 'customer-data') {
    return `the data of ${text(d.company)} (ZIP)`;
  }
  if (action === 'export.downloaded') {
    return `${entityId.replace('leads-', 'website ')} (${text(d.rows)} rows)`;
  }
  if (action === 'settings.changed') return entityId;
  if (action === 'user.roleChanged') {
    return `${text(d.email)}: ${text(d.from)} → ${text(d.to)}`;
  }
  if (action === 'user.emailChanged') {
    return `${text(d.from)} → ${text(d.to)}`;
  }
  if (typeof d.email === 'string') return d.email;
  if (typeof d.code === 'string') return d.code;
  const to = d.to as Record<string, unknown> | undefined;
  if (to && typeof to.company === 'string') return to.company;
  return '';
}
