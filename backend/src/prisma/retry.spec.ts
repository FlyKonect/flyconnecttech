import { Prisma } from '../generated/prisma/client.js';
import { retryOnConflict } from './retry.js';

const conflict = () =>
  new Prisma.PrismaClientKnownRequestError('Deadlock found', {
    code: 'P2034',
    clientVersion: 'test',
  });

describe('retryOnConflict', () => {
  it('runs again after a deadlock and returns the answer', async () => {
    let tries = 0;
    const answer = await retryOnConflict(async () => {
      tries++;
      if (tries < 2) throw conflict();
      return 'done';
    });
    expect(answer).toBe('done');
    expect(tries).toBe(2);
  });

  it('gives up after three tries', async () => {
    let tries = 0;
    await expect(
      retryOnConflict(async () => {
        tries++;
        throw conflict();
      }),
    ).rejects.toThrow('Deadlock found');
    expect(tries).toBe(3);
  });

  it('passes any other error on at once', async () => {
    let tries = 0;
    await expect(
      retryOnConflict(async () => {
        tries++;
        throw new Error('Something else');
      }),
    ).rejects.toThrow('Something else');
    expect(tries).toBe(1);
  });
});
