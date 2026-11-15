import { buildDemoInvite, icsText } from './ics.js';

const base = {
  code: 'DEM-2026-031',
  start: new Date('2026-11-10T11:00:00Z'),
  minutes: 30,
  summary: 'FlyConnect Tech demo: Travel booking platform',
  description: 'A 30-minute video call with Emma Clarke, from FlyConnect Tech.',
  organizer: { name: 'FlyConnect Tech', email: 'hello@yourdomain.com' },
  attendee: { name: 'Olivia Grant', email: 'olivia@skyhaven.example' },
  domain: 'yourdomain.com',
  now: new Date('2026-11-09T12:00:00Z'),
};

describe('the demo calendar invite', () => {
  it('is a meeting request for the 30 minutes, in UTC', () => {
    const ics = buildDemoInvite({ ...base, method: 'REQUEST' });
    expect(ics).toContain('METHOD:REQUEST');
    expect(ics).toContain('DTSTART:20261110T110000Z');
    expect(ics).toContain('DTEND:20261110T113000Z');
    expect(ics).toContain('UID:dem-2026-031@yourdomain.com');
    expect(ics).toContain('mailto:olivia@skyhaven.example');
    expect(ics).toContain('STATUS:CONFIRMED');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('keeps every line within 75 bytes and escapes commas', () => {
    const ics = buildDemoInvite({
      ...base,
      method: 'REQUEST',
      url: 'https://meet.example.com/abc-defg-hij?pwd=a-rather-long-password-value',
    });
    for (const line of ics.split('\r\n')) {
      expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(75);
    }
    expect(icsText('Emma Clarke, from; us')).toBe(
      String.raw`Emma Clarke\, from\; us`,
    );
  });

  it('cancels the same entry, with a higher sequence', () => {
    const first = buildDemoInvite({ ...base, method: 'REQUEST' });
    const cancel = buildDemoInvite({
      ...base,
      method: 'CANCEL',
      now: new Date('2026-11-09T13:00:00Z'),
    });
    const sequence = (ics: string) => Number(/SEQUENCE:(\d+)/.exec(ics)![1]);
    expect(cancel).toContain('METHOD:CANCEL');
    expect(cancel).toContain('STATUS:CANCELLED');
    expect(cancel).toContain('UID:dem-2026-031@yourdomain.com');
    expect(sequence(cancel)).toBeGreaterThan(sequence(first));
  });
});
