import type { RequestStatus, Role } from '../generated/prisma/client.js';

/**
 * Who may do what (docs/01, section 1 "Permissions").
 *
 * Every route that reads or changes data checks this table on the server.
 * Hiding a button in the frontend is never the protection.
 *
 * Some rules also depend on the record, not just the role:
 * - Developers only ever see and work on requests assigned to them
 *   (`requestScope`).
 * - Customers only ever see their own projects, requests and notifications
 *   (`customerScope`).
 * Those checks are made where the records are read, with the helpers below.
 */

export type TeamRole = Exclude<Role, 'CUSTOMER'>;

export const TEAM_ROLES: readonly TeamRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'DEVELOPER',
];

/** The signed-in person, as the policies need them. */
export type Actor = {
  id: string;
  role: Role;
  /** Set only for customers. */
  customerId: string | null;
};

export type Action =
  /** See support requests (developers: only their own, see requestScope). */
  | 'requests.view'
  /** Reply to the customer and add internal notes (developers: own requests). */
  | 'requests.reply'
  /** Assign or transfer a request to a developer. */
  | 'requests.assign'
  /** Change the priority. */
  | 'requests.changePriority'
  /** Correct a request: its title, type or project (same customer). */
  | 'requests.edit'
  /** Close a request. */
  | 'requests.close'
  /** Change the status (developers: only some statuses, see allowedStatuses). */
  | 'requests.changeStatus'
  /** See customers and projects. */
  | 'customers.view'
  /** Add customers and projects, resend invitations, send password reset links. */
  | 'customers.manage'
  /** Delete a customer (its requests and projects stay as history). */
  | 'customers.delete'
  /** See the team users. */
  | 'users.view'
  /** Add team users (which roles: see canInviteRole). */
  | 'users.invite'
  /** Delete a team user (which roles: see canInviteRole; never yourself). */
  | 'users.delete'
  /** Reset a team member's two-step sign-in (lost phone and backup codes). */
  | 'users.resetTwoFactor'
  /** See and work on website leads: demos, quotes, messages. */
  | 'leads.manage'
  /** Convert a lead into a customer. */
  | 'leads.convert'
  /** Reports and analytics. */
  | 'reports.view'
  /** The settings screen. */
  | 'settings.manage'
  /** Website content: testimonials and the live-project link. */
  | 'website.manage'
  /** Failed emails: see them, resend or remove them. */
  | 'emails.manage'
  /** Download a list as CSV (requests, customers, leads). */
  | 'exports.download';

const ALL_TEAM: TeamRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DEVELOPER'];
const NOT_DEVELOPER: TeamRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'];
const ADMINS: TeamRole[] = ['SUPER_ADMIN', 'ADMIN'];

/** The permission table: which team roles may do each action. */
export const PERMISSIONS: Record<Action, readonly TeamRole[]> = {
  'requests.view': ALL_TEAM,
  'requests.reply': ALL_TEAM,
  'requests.assign': NOT_DEVELOPER,
  'requests.changePriority': NOT_DEVELOPER,
  'requests.edit': NOT_DEVELOPER,
  'requests.close': NOT_DEVELOPER,
  'requests.changeStatus': ALL_TEAM,
  'customers.view': NOT_DEVELOPER,
  'customers.manage': ADMINS,
  'customers.delete': ADMINS,
  'users.view': ADMINS,
  'users.invite': ADMINS,
  'users.delete': ADMINS,
  'users.resetTwoFactor': ['SUPER_ADMIN'],
  'leads.manage': NOT_DEVELOPER,
  'leads.convert': ADMINS,
  'reports.view': NOT_DEVELOPER,
  'settings.manage': ['SUPER_ADMIN'],
  'website.manage': ADMINS,
  'emails.manage': ADMINS,
  'exports.download': ADMINS,
};

export function isTeamRole(role: Role): role is TeamRole {
  return role !== 'CUSTOMER';
}

/** May this person do this action at all? Customers have no team actions. */
export function can(actor: Pick<Actor, 'role'>, action: Action): boolean {
  if (!isTeamRole(actor.role)) return false;
  return PERMISSIONS[action].includes(actor.role);
}

/** Every action this person may do. Sent to the frontend to show the right menus. */
export function actionsFor(actor: Pick<Actor, 'role'>): Action[] {
  return (Object.keys(PERMISSIONS) as Action[]).filter((action) =>
    can(actor, action),
  );
}

/** Which roles this person may give to a new team user. */
export function canInviteRole(actor: Pick<Actor, 'role'>, role: Role): boolean {
  if (role === 'CUSTOMER') return can(actor, 'customers.manage');
  if (!can(actor, 'users.invite')) return false;
  // Admins can add Admins, Managers and Developers, but not a Super admin.
  return actor.role === 'SUPER_ADMIN' || role !== 'SUPER_ADMIN';
}

/** The statuses this person may move a request to. */
export function allowedStatuses(
  actor: Pick<Actor, 'role'>,
): readonly RequestStatus[] {
  if (actor.role === 'DEVELOPER') {
    return ['IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED'];
  }
  if (can(actor, 'requests.changeStatus')) {
    return [
      'SUBMITTED',
      'UNDER_REVIEW',
      'IN_PROGRESS',
      'WAITING_FOR_CUSTOMER',
      'RESOLVED',
      'CLOSED',
    ];
  }
  return [];
}

/**
 * The support requests this person may see, as a database filter.
 * Combine it with any other filter using AND.
 */
export function requestScope(actor: Actor) {
  if (actor.role === 'CUSTOMER') {
    return { customerId: actor.customerId ?? '__none__' };
  }
  if (actor.role === 'DEVELOPER') return { assigneeId: actor.id };
  return {};
}

/** The customer whose projects, requests and notifications this customer may see. */
export function customerScope(actor: Actor) {
  if (actor.role !== 'CUSTOMER' || !actor.customerId) {
    throw new Error('customerScope is only for customers.');
  }
  return { customerId: actor.customerId };
}
