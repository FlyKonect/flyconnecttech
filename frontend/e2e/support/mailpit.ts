import { e2e } from "./e2e-env";

/**
 * Reads the emails the app sent, from Mailpit's API, so tests can follow the
 * links in them like a person would.
 */

type Summary = { ID: string; Subject: string; To: { Address: string }[] };

export type Email = { subject: string; text: string; html: string };

/** Waits for the newest email to this address (up to 20 seconds). */
export async function waitForEmail(
  to: string,
  subject?: RegExp,
): Promise<Email> {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    const search = await fetch(
      `${e2e.mailpitUrl}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`,
    );
    if (search.ok) {
      const { messages } = (await search.json()) as { messages: Summary[] };
      const match = messages.find(
        (message) => !subject || subject.test(message.Subject),
      );
      if (match) {
        const full = await fetch(
          `${e2e.mailpitUrl}/api/v1/message/${match.ID}`,
        );
        const body = (await full.json()) as {
          Subject: string;
          Text: string;
          HTML: string;
        };
        return { subject: body.Subject, text: body.Text, html: body.HTML };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No email to ${to} arrived in Mailpit.`);
}

/** The first link in an email that contains `path`, for example "/invite/". */
export function linkIn(email: Email, path: string): string {
  const match = email.text.match(
    new RegExp(`https?://[^\\s)\\]]*${path}[A-Za-z0-9_-]+`),
  );
  if (!match) throw new Error(`No ${path} link in "${email.subject}".`);
  return match[0];
}
