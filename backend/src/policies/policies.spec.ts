import type { Role } from '../generated/prisma/client.js';
import {
  actionsFor,
  allowedStatuses,
  can,
  canInviteRole,
  PERMISSIONS,
  requestScope,
  type Action,
} from './policies.js';

const roles: Role[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'DEVELOPER',
  'CUSTOMER',
];

/**
 * The permission table from docs/01, section 1, written out in full.
 * "yes" means the role may do the action.
 */
const expected: Record<Action, Record<Role, boolean>> = {
  'requests.view': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: true,
    DEVELOPER: true,
    CUSTOMER: false,
  },
  'requests.reply': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: true,
    DEVELOPER: true,
    CUSTOMER: false,
  },
  'requests.assign': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: true,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'requests.changePriority': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: true,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'requests.edit': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: true,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'requests.close': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: true,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'requests.changeStatus': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: true,
    DEVELOPER: true,
    CUSTOMER: false,
  },
  'customers.view': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: true,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'customers.manage': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: false,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'customers.delete': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: false,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'users.view': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: false,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'users.invite': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: false,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'users.delete': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: false,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'users.resetTwoFactor': {
    SUPER_ADMIN: true,
    ADMIN: false,
    MANAGER: false,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'leads.manage': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: true,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'leads.convert': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: false,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'reports.view': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: true,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'settings.manage': {
    SUPER_ADMIN: true,
    ADMIN: false,
    MANAGER: false,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'website.manage': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: false,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'emails.manage': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: false,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'exports.download': {
    SUPER_ADMIN: true,
    ADMIN: true,
    MANAGER: false,
    DEVELOPER: false,
    CUSTOMER: false,
  },
  'audit.view': {
    SUPER_ADMIN: true,
    ADMIN: false,
    MANAGER: false,
    DEVELOPER: false,
    CUSTOMER: false,
  },
};

describe('permission table (docs/01, section 1)', () => {
  it('covers every action', () => {
    expect(Object.keys(expected).sort()).toEqual(
      Object.keys(PERMISSIONS).sort(),
    );
  });

  for (const action of Object.keys(expected) as Action[]) {
    for (const role of roles) {
      const allowed = expected[action][role];
      it(`${role} ${allowed ? 'may' : 'may not'} ${action}`, () => {
        expect(can({ role }, action)).toBe(allowed);
      });
    }
  }

  it('actionsFor lists exactly the allowed actions', () => {
    expect(actionsFor({ role: 'MANAGER' })).toEqual(
      (Object.keys(expected) as Action[]).filter(
        (action) => expected[action].MANAGER,
      ),
    );
    expect(actionsFor({ role: 'CUSTOMER' })).toEqual([]);
  });
});

describe('adding users', () => {
  it('a super admin may add any role', () => {
    for (const role of roles) {
      expect(canInviteRole({ role: 'SUPER_ADMIN' }, role)).toBe(true);
    }
  });

  it('an admin may add Admin, Manager, Developer and customers, not a Super admin', () => {
    expect(canInviteRole({ role: 'ADMIN' }, 'SUPER_ADMIN')).toBe(false);
    expect(canInviteRole({ role: 'ADMIN' }, 'ADMIN')).toBe(true);
    expect(canInviteRole({ role: 'ADMIN' }, 'MANAGER')).toBe(true);
    expect(canInviteRole({ role: 'ADMIN' }, 'DEVELOPER')).toBe(true);
    expect(canInviteRole({ role: 'ADMIN' }, 'CUSTOMER')).toBe(true);
  });

  it('managers, developers and customers may add nobody', () => {
    for (const actor of ['MANAGER', 'DEVELOPER', 'CUSTOMER'] as Role[]) {
      for (const role of roles) {
        expect(canInviteRole({ role: actor }, role)).toBe(false);
      }
    }
  });
});

describe('status changes', () => {
  it('developers may only move to In Progress, Waiting for Customer and Resolved', () => {
    expect(allowedStatuses({ role: 'DEVELOPER' })).toEqual([
      'IN_PROGRESS',
      'WAITING_FOR_CUSTOMER',
      'RESOLVED',
    ]);
  });

  it('super admins, admins and managers may use any status', () => {
    for (const role of ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] as Role[]) {
      expect(allowedStatuses({ role })).toHaveLength(6);
    }
  });

  it('customers may not change status through this rule', () => {
    expect(allowedStatuses({ role: 'CUSTOMER' })).toEqual([]);
  });
});

describe('which requests a person may see', () => {
  it('developers see only requests assigned to them', () => {
    expect(
      requestScope({ id: 'dev-1', role: 'DEVELOPER', customerId: null }),
    ).toEqual({ assigneeId: 'dev-1' });
  });

  it('customers see only their own requests', () => {
    expect(
      requestScope({ id: 'u-1', role: 'CUSTOMER', customerId: 'cust-1' }),
    ).toEqual({ customerId: 'cust-1' });
  });

  it('a customer without a customer record sees nothing', () => {
    expect(
      requestScope({ id: 'u-1', role: 'CUSTOMER', customerId: null }),
    ).toEqual({ customerId: '__none__' });
  });

  it('super admins, admins and managers see all requests', () => {
    for (const role of ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] as Role[]) {
      expect(requestScope({ id: 'x', role, customerId: null })).toEqual({});
    }
  });
});
