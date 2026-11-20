import { render } from '@react-email/render';
import { EMAIL_PREVIEWS } from './previews.js';

/** The rows of docs/01 §7 (plus the weekly summary, asked for in Phase 9). */
const ROWS = [
  'Customer or team invitation',
  'Password reset requested or sent by admin',
  'Email address changed by an admin',
  'Account locked after wrong passwords',
  'New support request',
  'Request assigned or transferred',
  'Team reply to customer',
  'Customer reply',
  'Status changed / needs info / resolved / closed',
  'Daily digest of requests waiting for review',
  'Weekly summary of my requests',
  'Demo requested',
  'Demo confirmed or rescheduled',
  'Demo cancelled',
  'Quote requested',
  'Estimate sent or updated',
  'Contact message received',
  'Lead email from the composer',
];

describe('every email, for /dev/emails', () => {
  it('covers every row of the docs/01 §7 table that sends an email', () => {
    expect([...new Set(EMAIL_PREVIEWS.map((p) => p.row))].sort()).toEqual(
      [...ROWS].sort(),
    );
  });

  it('has a unique key, a subject and who gets it', () => {
    const keys = EMAIL_PREVIEWS.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const preview of EMAIL_PREVIEWS) {
      expect(preview.subject.length).toBeGreaterThan(5);
      expect(preview.to.length).toBeGreaterThan(5);
    }
  });

  it.each(EMAIL_PREVIEWS.map((p) => [p.key, p] as const))(
    '%s renders as HTML and as plain text, in the brand layout',
    async (_key, preview) => {
      const element = preview.render('http://localhost:3001');
      const html = await render(element);
      const text = await render(element, { plainText: true });
      expect(html).toContain('/brand/email-logo.png');
      // The navy header with the gold line.
      expect(html).toContain('#021A54');
      expect(html).toContain('#D3AF34');
      expect(text.trim().length).toBeGreaterThan(40);
      expect(text).not.toMatch(/<\/?[a-z][^>]*>/i);
      expect(text).not.toContain('Northstack');
      expect(html).not.toContain('Northstack');
    },
  );
});
