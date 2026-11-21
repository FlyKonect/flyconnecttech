import {
  calendarDay,
  isCalendarDay,
  itemLinesSchema,
  itemsFromLines,
  MAX_ITEMS,
  newProjectSchema,
  progressOf,
  progressWords,
  projectDetailsSchema,
} from './project-rules.js';

const CUSTOMER = '5b0e4c4e-0f3a-4f61-9a62-0c3a2c6f3b11';

describe("What's included, one item a line", () => {
  it('drops blank lines, bullets and extra spaces', () => {
    expect(
      itemsFromLines(
        '  Flight search \r\n\n- Agent   portal\n• Stripe payments\n* Emails\n   ',
      ),
    ).toEqual(['Flight search', 'Agent portal', 'Stripe payments', 'Emails']);
    expect(itemsFromLines('')).toEqual([]);
    expect(itemsFromLines(undefined)).toEqual([]);
  });

  it(`takes up to ${MAX_ITEMS} items of up to 160 characters`, () => {
    const lines = (n: number) =>
      Array.from({ length: n }, (_, i) => `Item ${i + 1}`).join('\n');
    expect(itemLinesSchema.parse(lines(MAX_ITEMS))).toHaveLength(MAX_ITEMS);
    expect(itemLinesSchema.safeParse(lines(MAX_ITEMS + 1)).success).toBe(false);
    expect(itemLinesSchema.safeParse('x'.repeat(161)).success).toBe(false);
    expect(itemLinesSchema.parse(null)).toEqual([]);
  });
});

describe('progress', () => {
  it('is the share of items that are Done', () => {
    const items = [
      { status: 'DONE' as const },
      { status: 'DONE' as const },
      { status: 'IN_PROGRESS' as const },
    ];
    expect(progressOf(items)).toEqual({ done: 2, total: 3, percent: 67 });
    expect(progressWords(progressOf(items))).toBe('2 of 3 done (67%)');
  });

  it('has no percentage with nothing listed', () => {
    expect(progressOf([])).toEqual({ done: 0, total: 0, percent: null });
    expect(progressWords(progressOf([]))).toBe('Nothing listed yet');
  });
});

describe('project details', () => {
  const valid = {
    name: 'Bluewave booking website',
    type: 'WEBSITE',
    startDate: '2026-11-02',
    targetDate: '2027-01-15',
    liveUrl: 'https://bluewave.example.com',
    testUrl: '',
    leadId: '',
  };

  it('saves empty fields as nothing and dates at midnight UTC', () => {
    const parsed = projectDetailsSchema.parse(valid);
    expect(parsed).toMatchObject({
      description: null,
      testUrl: null,
      leadId: null,
      liveDate: null,
    });
    expect(parsed.startDate?.toISOString()).toBe('2026-11-02T00:00:00.000Z');
    expect(calendarDay(parsed.targetDate)).toBe('2027-01-15');
  });

  it('refuses odd dates, a target before the start and non-web addresses', () => {
    expect(isCalendarDay('2026-02-30')).toBe(false);
    expect(isCalendarDay('21/11/2026')).toBe(false);
    for (const bad of [
      { startDate: '2026-02-30' },
      { targetDate: '2026-10-01' },
      { liveUrl: 'javascript:alert(1)' },
      { testUrl: 'ftp://files.example.com' },
      { leadId: 'not-an-id' },
    ]) {
      expect(projectDetailsSchema.safeParse({ ...valid, ...bad }).success).toBe(
        false,
      );
    }
  });

  it('Add project needs a customer and takes the items as lines', () => {
    expect(newProjectSchema.safeParse({ ...valid }).success).toBe(false);
    expect(
      newProjectSchema.parse({
        ...valid,
        customerId: CUSTOMER,
        items: 'Flight search\nPayments',
      }).items,
    ).toEqual(['Flight search', 'Payments']);
  });
});
