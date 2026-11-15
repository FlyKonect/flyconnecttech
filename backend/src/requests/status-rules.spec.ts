import { defaultSettings } from '../settings/defaults.js';
import { customerActionsFor, statusChangeFields } from './status-rules.js';

const targets = defaultSettings.responseTargets;
const now = new Date('2026-11-10T12:00:00Z');

describe("the customer's buttons (screen 13)", () => {
  it('open requests can be closed', () => {
    for (const status of [
      'SUBMITTED',
      'UNDER_REVIEW',
      'IN_PROGRESS',
      'WAITING_FOR_CUSTOMER',
    ] as const) {
      expect(customerActionsFor(status)).toEqual(['close']);
    }
  });

  it('a resolved request can be confirmed or reopened ("I still need help")', () => {
    expect(customerActionsFor('RESOLVED')).toEqual(['confirm', 'reopen']);
  });

  it('a closed request can be reopened', () => {
    expect(customerActionsFor('CLOSED')).toEqual(['reopen']);
  });
});

describe('statusChangeFields', () => {
  const base = {
    now,
    priority: 'HIGH' as const,
    dueAt: new Date('2026-11-10T14:00:00Z'),
    slaPausedAt: null,
    targets,
  };

  it('pauses the SLA while waiting for the customer', () => {
    expect(
      statusChangeFields({
        ...base,
        from: 'IN_PROGRESS',
        to: 'WAITING_FOR_CUSTOMER',
      }),
    ).toEqual({ status: 'WAITING_FOR_CUSTOMER', slaPausedAt: now });
  });

  it('starts the SLA again later by the time spent waiting', () => {
    const fields = statusChangeFields({
      ...base,
      from: 'WAITING_FOR_CUSTOMER',
      to: 'IN_PROGRESS',
      slaPausedAt: new Date('2026-11-10T11:00:00Z'),
    });
    expect(fields).toEqual({
      status: 'IN_PROGRESS',
      slaPausedAt: null,
      dueAt: new Date('2026-11-10T15:00:00Z'),
    });
  });

  it('records when a request is resolved and closed', () => {
    expect(
      statusChangeFields({ ...base, from: 'IN_PROGRESS', to: 'RESOLVED' }),
    ).toEqual({ status: 'RESOLVED', resolvedAt: now });
    expect(
      statusChangeFields({ ...base, from: 'RESOLVED', to: 'CLOSED' }),
    ).toEqual({ status: 'CLOSED', closedAt: now });
  });

  it('a closed request that is closed from waiting stops the pause too', () => {
    expect(
      statusChangeFields({
        ...base,
        from: 'WAITING_FOR_CUSTOMER',
        to: 'CLOSED',
        slaPausedAt: new Date('2026-11-10T11:00:00Z'),
      }),
    ).toMatchObject({ status: 'CLOSED', closedAt: now, slaPausedAt: null });
  });

  it('a reopened request gets a fresh due time from now', () => {
    expect(
      statusChangeFields({ ...base, from: 'CLOSED', to: 'IN_PROGRESS' }),
    ).toEqual({
      status: 'IN_PROGRESS',
      resolvedAt: null,
      closedAt: null,
      slaPausedAt: null,
      // High: 4 hours.
      dueAt: new Date('2026-11-10T16:00:00Z'),
    });
  });
});
