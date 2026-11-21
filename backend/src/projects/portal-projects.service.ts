import { Injectable } from '@nestjs/common';
import type { SignedIn } from '../auth/signed-in.js';
import { customerScope } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OPEN_STATUSES } from '../requests/status-rules.js';
import { FileStorageService } from '../uploads/file-storage.service.js';
import { calendarDay, progressOf } from './project-rules.js';
import { notFound, pageSelect, sharedPage } from './projects.service.js';

/**
 * The customer's own projects (My Projects), view only. Always within
 * customerScope(): another customer's project answers 404. Deleted
 * projects are left out, and team notes never leave the team panel.
 */
@Injectable()
export class PortalProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: FileStorageService,
  ) {}

  /** My Projects, and the choices in New request. */
  async list(actor: SignedIn) {
    const projects = await this.prisma.project.findMany({
      where: { ...customerScope(actor), deletedAt: null },
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        status: true,
        description: true,
        targetDate: true,
        lead: { select: { name: true } },
        items: { select: { status: true } },
      },
    });
    return projects.map(({ items, targetDate, lead, ...project }) => ({
      ...project,
      targetDate: calendarDay(targetDate),
      lead: lead?.name ?? null,
      progress: progressOf(items),
    }));
  }

  async detail(actor: SignedIn, code: string) {
    const project = await this.prisma.project.findFirst({
      where: { code, ...customerScope(actor), deletedAt: null },
      // Never teamNotes: pageSelect leaves them out.
      select: pageSelect,
    });
    if (!project) throw notFound();
    const [open, total] = await Promise.all([
      this.prisma.supportRequest.count({
        where: { projectId: project.id, status: { in: [...OPEN_STATUSES] } },
      }),
      this.prisma.supportRequest.count({ where: { projectId: project.id } }),
    ]);
    const { lead, ...page } = sharedPage(project);
    return {
      ...page,
      lead: lead ? { name: lead.name, jobTitle: lead.jobTitle } : null,
      requests: { open, total },
    };
  }

  async file(actor: SignedIn, code: string, fileId: string) {
    const file = await this.prisma.projectFile.findFirst({
      where: {
        id: fileId,
        project: { code, ...customerScope(actor), deletedAt: null },
      },
      select: {
        fileName: true,
        contentType: true,
        size: true,
        storageKey: true,
      },
    });
    if (!file) throw notFound();
    return { ...file, stream: this.storage.read(file.storageKey) };
  }
}
