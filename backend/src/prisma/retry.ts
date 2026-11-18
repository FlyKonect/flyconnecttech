import { Prisma } from '../generated/prisma/client.js';

/**
 * Runs a transaction again when the database cancelled it because two
 * requests locked each other (a deadlock or write conflict, Prisma's
 * P2034). The database says to retry, and a second try nearly always
 * succeeds. Any other error is passed on at once.
 */
export async function retryOnConflict<T>(
  run: () => Promise<T>,
  attempts = 3,
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await run();
    } catch (error) {
      const conflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034';
      if (!conflict || attempt >= attempts) throw error;
      // A short, random pause so the two requests don't meet again.
      await new Promise((resolve) =>
        setTimeout(resolve, 20 + Math.random() * 80 * attempt),
      );
    }
  }
}
