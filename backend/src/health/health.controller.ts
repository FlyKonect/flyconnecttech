import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators.js';
import { PrismaService } from '../prisma/prisma.service.js';

export type HealthReport = {
  status: 'ok';
  database: 'up';
};

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Answers 200 when the backend and the database both work, 503 if the database is down. */
  @Get()
  @ApiOperation({
    summary: 'Is the backend running and connected to the database?',
  })
  async check(): Promise<HealthReport> {
    if (!(await this.prisma.isUp())) {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'down',
      });
    }

    return { status: 'ok', database: 'up' };
  }
}
