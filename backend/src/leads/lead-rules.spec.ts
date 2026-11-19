import {
  ESTIMATE_FROM_BUDGET,
  formatGbp,
  isDemoSlot,
  isOfferedSlot,
  offeredDemoSlots,
  pageName,
  PROJECT_TYPE_FROM_DEMO,
  PROJECT_TYPE_FROM_QUOTE,
  suggestedProjectName,
  ukDayShort,
  ukSlotLong,
} from './lead-rules.js';

describe('the page a lead was sent from', () => {
  it('names the website pages', () => {
    expect(pageName('/travel-technology')).toBe('Travel Technology');
    expect(pageName('/contact?tab=quote')).toBe('Contact & Quote');
    expect(pageName('/services/api-integrations/')).toBe('API Integrations');
    expect(pageName('/')).toBe('Home');
  });

  it('calls anything else "Website"', () => {
    expect(pageName('/somewhere-else')).toBe('Website');
  });
});

describe('demo slots (UK time)', () => {
  // Monday 9 November 2026, 10:00 in London (GMT).
  const monday = new Date('2026-11-09T10:00:00Z');

  it('offers the next 10 weekdays after today, six slots each', () => {
    const slots = offeredDemoSlots(monday);
    expect(slots).toHaveLength(60);
    expect(slots[0].toISOString()).toBe('2026-11-10T09:30:00.000Z');
    expect(slots[5].toISOString()).toBe('2026-11-10T17:00:00.000Z');
    expect(ukDayShort(slots[59])).toBe('Mon 23 Nov');
    expect(slots.some((slot) => [0, 6].includes(slot.getUTCDay()))).toBe(false);
  });

  it('follows British Summer Time', () => {
    const june = offeredDemoSlots(new Date('2026-06-15T10:00:00Z'));
    // 09:30 in London is 08:30 UTC in summer.
    expect(june[0].toISOString()).toBe('2026-06-16T08:30:00.000Z');
  });

  it('knows a real slot from anything else', () => {
    const slot = new Date('2026-11-10T11:00:00Z');
    expect(isDemoSlot(slot, monday)).toBe(true);
    expect(isOfferedSlot(slot, monday)).toBe(true);
    expect(isDemoSlot(new Date('2026-11-10T10:00:00Z'), monday)).toBe(false);
    expect(isDemoSlot(new Date('2026-11-14T11:00:00Z'), monday)).toBe(false);
    expect(isDemoSlot(new Date('2026-11-09T09:30:00Z'), monday)).toBe(false);
    // Today is never offered on the website.
    expect(isOfferedSlot(new Date('2026-11-09T14:00:00Z'), monday)).toBe(false);
  });

  it('writes times the way the design does', () => {
    expect(ukSlotLong(new Date('2026-11-10T11:00:00Z'))).toBe(
      'Tuesday 10 November, 11:00 UK time',
    );
  });
});

describe('estimates', () => {
  it('writes pounds without cents unless there are some', () => {
    expect(formatGbp(2_400_000)).toBe('£24,000');
    expect(formatGbp(2_400_050)).toBe('£24,000.50');
  });

  it('starts from the visitor budget', () => {
    expect(ESTIMATE_FROM_BUDGET.FROM_15K_TO_50K).toBe(24000);
    expect(ESTIMATE_FROM_BUDGET.NOT_SURE).toBeNull();
  });
});

describe('converting a lead', () => {
  it('maps project types as docs/01 section 6 says', () => {
    expect(PROJECT_TYPE_FROM_DEMO.AGENT_ADMIN_DASHBOARDS).toBe('AGENT_PORTAL');
    expect(PROJECT_TYPE_FROM_DEMO.CUSTOM_SOFTWARE_WEBSITES).toBe(
      'CUSTOM_SOFTWARE',
    );
    expect(PROJECT_TYPE_FROM_QUOTE.AMADEUS_SABRE_INTEGRATION).toBe(
      'API_INTEGRATION',
    );
    expect(PROJECT_TYPE_FROM_QUOTE.WEBSITE_REDESIGN).toBe('WEBSITE');
    expect(PROJECT_TYPE_FROM_QUOTE.OTHER).toBe('WEB_APPLICATION');
  });

  it('suggests a project name from the company, or their surname', () => {
    expect(
      suggestedProjectName(
        'Coastline Tours',
        'Grace Owusu',
        'TRAVEL_BOOKING_PLATFORM',
      ),
    ).toBe('Coastline booking platform');
    expect(suggestedProjectName(null, 'Imran Sheikh', 'WEBSITE')).toBe(
      'Sheikh website',
    );
  });
});
