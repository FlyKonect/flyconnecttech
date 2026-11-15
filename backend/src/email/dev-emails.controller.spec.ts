import { NotFoundException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { Env } from '../config/env.js';
import { DevEmailsController } from './dev-emails.controller.js';

const config = (nodeEnv: string) =>
  ({
    get: (key: string) =>
      key === 'NODE_ENV' ? nodeEnv : 'http://localhost:3001',
  }) as unknown as ConfigService<Env, true>;

describe('/dev/emails on the live site', () => {
  it('answers "not found" in production', async () => {
    const controller = new DevEmailsController(config('production'));
    expect(() => controller.list()).toThrow(NotFoundException);
    await expect(
      controller.show('daily-digest', undefined, {} as Response),
    ).rejects.toThrow(NotFoundException);
  });

  it('lists the emails in development', () => {
    const controller = new DevEmailsController(config('development'));
    expect(controller.list().length).toBeGreaterThan(20);
  });
});
