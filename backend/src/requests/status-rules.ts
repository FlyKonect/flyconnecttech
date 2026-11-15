import type { Priority, RequestStatus } from '../generated/prisma/client.js';
import type { ResponseTargets } from '../settings/defaults.js';
import { dueTime, resumedDueTime } from './sla.js';

/**
 * Support request statuses (docs/01, "Support request statuses").
 * The team's own moves come in Phase 6 and use statusChangeFields too.
 */

/** Not finished yet: the customer can still close these. */
export const OPEN_STATUSES: readonly RequestStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'WAITING_FOR_CUSTOMER',
];

/** The tabs on My requests (screen 12). */
export const PORTAL_TABS = {
  all: null,
  open: ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS'],
  waiting: ['WAITING_FOR_CUSTOMER'],
  resolved: ['RESOLVED', 'CLOSED'],
} as const satisfies Record<string, readonly RequestStatus[] | null>;

export type PortalTab = keyof typeof PORTAL_TABS;

/** What a customer can do to their own request (screen 13). */
export type CustomerAction = 'close' | 'confirm' | 'reopen';

type ActionRule = {
  /** The statuses the action works from. */
  from: readonly RequestStatus[];
  to: RequestStatus;
  /** The line shown in the conversation, with the customer's name. */
  line: (name: string) => string;
  /** The team's notification. */
  teamText: (name: string, code: string) => string;
};

export const CUSTOMER_ACTIONS: Record<CustomerAction, ActionRule> = {
  // "Close request", while the request is open.
  close: {
    from: OPEN_STATUSES,
    to: 'CLOSED',
    line: (name) => `${name} closed this request`,
    teamText: (name, code) => `${name} closed ${code}`,
  },
  // "Confirm it's fixed", when it is Resolved.
  confirm: {
    from: ['RESOLVED'],
    to: 'CLOSED',
    line: (name) => `${name} confirmed the resolution. Request closed.`,
    teamText: (name, code) => `${name} confirmed the fix on ${code}`,
  },
  // "I still need help" (Resolved) and "Reopen request" (Closed).
  reopen: {
    from: ['RESOLVED', 'CLOSED'],
    to: 'IN_PROGRESS',
    line: (name) => `${name} requested further assistance. Request reopened.`,
    teamText: (name, code) => `${name} reopened ${code}`,
  },
};

/** The customer's buttons for a request in this status. */
export function customerActionsFor(status: RequestStatus): CustomerAction[] {
  return (Object.keys(CUSTOMER_ACTIONS) as CustomerAction[]).filter((action) =>
    CUSTOMER_ACTIONS[action].from.includes(status),
  );
}

/** The line shown when a customer's reply wakes a waiting request. */
export const CUSTOMER_REPLIED_LINE =
  'Status changed to In Progress after the customer replied';

export type StatusChange = {
  from: RequestStatus;
  to: RequestStatus;
  now: Date;
  priority: Priority;
  dueAt: Date | null;
  slaPausedAt: Date | null;
  targets: ResponseTargets;
};

const finished = (status: RequestStatus) =>
  status === 'RESOLVED' || status === 'CLOSED';

/** The request fields that change with its status: timestamps and SLA. */
export function statusChangeFields(change: StatusChange) {
  const { from, to, now } = change;
  const fields: {
    status: RequestStatus;
    dueAt?: Date;
    slaPausedAt?: Date | null;
    resolvedAt?: Date | null;
    closedAt?: Date | null;
  } = { status: to };

  if (finished(from) && !finished(to)) {
    // Reopened: a fresh due time, counted from now.
    fields.resolvedAt = null;
    fields.closedAt = null;
    fields.dueAt = dueTime(now, change.priority, change.targets);
    fields.slaPausedAt = to === 'WAITING_FOR_CUSTOMER' ? now : null;
    return fields;
  }

  if (from === 'WAITING_FOR_CUSTOMER' && to !== from) {
    // The clock starts again.
    if (change.dueAt && change.slaPausedAt) {
      fields.dueAt = resumedDueTime(change.dueAt, change.slaPausedAt, now);
    }
    fields.slaPausedAt = null;
  }
  if (to === 'WAITING_FOR_CUSTOMER' && from !== to) {
    fields.slaPausedAt = now;
  }
  if (to === 'RESOLVED') fields.resolvedAt = now;
  if (to === 'CLOSED') fields.closedAt = now;
  return fields;
}
