/**
 * A calendar invite (.ics, RFC 5545) for a demo. Written by hand: it is a
 * short text format and needs no package.
 *
 * The same UID is used for every invite about one demo, and SEQUENCE
 * always grows, so a reschedule or a cancellation updates the entry that is
 * already in the visitor's calendar instead of adding a second one.
 */

export type DemoInvite = {
  /** Stable for the demo, for example "DEM-2026-031". */
  code: string;
  start: Date;
  minutes: number;
  summary: string;
  description: string;
  /** The video call link, when there is one. */
  url?: string | null;
  organizer: { name: string; email: string };
  attendee: { name: string; email: string };
  method: 'REQUEST' | 'CANCEL';
  /** When it is sent; also gives the SEQUENCE. */
  now?: Date;
  /** The domain after the @ in the UID. */
  domain: string;
};

/** 20261110T110000Z */
function stamp(when: Date): string {
  return when
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/** Escapes text values: backslash, semicolon, comma and line breaks. */
export function icsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Lines longer than 75 bytes continue on the next line after a space. */
function fold(line: string): string {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  for (const char of line) {
    const limit = parts.length ? 74 : 75;
    if (Buffer.byteLength(current + char, 'utf8') > limit) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join('\r\n ');
}

/** Seconds since 2026: an always-growing SEQUENCE without storing one. */
function sequence(now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - Date.UTC(2026, 0, 1)) / 1000));
}

const name = (value: string) => `"${value.replace(/"/g, "'")}"`;

export function buildDemoInvite(invite: DemoInvite): string {
  const now = invite.now ?? new Date();
  const end = new Date(invite.start.getTime() + invite.minutes * 60_000);
  const description = invite.url
    ? `${invite.description}\n\nJoin the video call: ${invite.url}`
    : invite.description;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FlyConnect Tech//Demo requests//EN',
    'CALSCALE:GREGORIAN',
    `METHOD:${invite.method}`,
    'BEGIN:VEVENT',
    `UID:${invite.code.toLowerCase()}@${invite.domain}`,
    `SEQUENCE:${sequence(now)}`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(invite.start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${icsText(invite.summary)}`,
    `DESCRIPTION:${icsText(description)}`,
    ...(invite.url
      ? [`LOCATION:${icsText(invite.url)}`, `URL:${invite.url}`]
      : ['LOCATION:Video call']),
    `ORGANIZER;CN=${name(invite.organizer.name)}:mailto:${invite.organizer.email}`,
    `ATTENDEE;CN=${name(invite.attendee.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${invite.attendee.email}`,
    `STATUS:${invite.method === 'CANCEL' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}
