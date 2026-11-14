import { jest } from '@jest/globals';
import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { HealthController } from './health.controller.js';

async function controllerWith(databaseUp: boolean): Promise<HealthController> {
  const moduleRef = await Test.createTestingModule({
    controllers: [HealthController],
    providers: [
      {
        provide: PrismaService,
        useValue: {
          isUp: jest.fn<() => Promise<boolean>>().mockResolvedValue(databaseUp),
        },
      },
    ],
  }).compile();

  return moduleRef.get(HealthController);
}

describe('HealthController', () => {
  it('reports ok when the database answers', async () => {
    const controller = await controllerWith(true);

    await expect(controller.check()).resolves.toEqual({
      status: 'ok',
      database: 'up',
    });
  });

  it('fails with 503 when the database is down', async () => {
    const controller = await controllerWith(false);

    await expect(controller.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
