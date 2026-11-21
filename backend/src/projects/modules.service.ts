import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import type { SignedIn } from '../auth/signed-in.js';
import type { ModuleStage, Prisma } from '../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { customerScope } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  STAGE_LABELS,
  stageMove,
  stagesFor,
  type ModuleInput,
  type ReviewInput,
} from './module-rules.js';
import { createModule } from './module-writes.js';
import {
  ProjectEventsService,
  teamProjectHref,
} from './project-events.service.js';
import { notFound, ProjectsService } from './projects.service.js';

const TX = { isolationLevel: 'ReadCommitted' } as const;
const TEAM_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DEVELOPER'] as const;

const moduleNotFound = () =>
  new BadRequestException({
    code: 'MODULE_NOT_FOUND',
    message: 'This module is not part of the project.',
  });

/**
 * A project's modules, their stages and timeline, the customer's client
 * review, and the project team. Admins add and change modules and the
 * team (projects.manage); developers on the team move stages
 * (projects.work, within projectScope, never Done); the customer approves
 * or asks for changes while a module is in Client review.
 */
@Injectable()
export class ModulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly events: ProjectEventsService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  // ------------------------------------------------------------ modules

  async add(actor: SignedIn, code: string, input: ModuleInput) {
    return this.prisma.$transaction(async (tx) => {
      const project = await this.projects.findActive(code, tx);
      return createModule(tx, {
        projectId: project.id,
        name: input.name,
        description: input.description,
        startDate: input.startDate,
        targetDate: input.targetDate,
        byId: actor.id,
      });
    }, TX);
  }

  async update(code: string, moduleId: string, input: ModuleInput) {
    return this.prisma.$transaction(async (tx) => {
      const module = await this.find(code, moduleId, tx);
      await tx.projectModule.update({
        where: { id: module.id },
        data: {
          name: input.name,
          description: input.description,
          startDate: input.startDate,
          targetDate: input.targetDate,
        },
      });
      return { id: module.id };
    }, TX);
  }

  /** Swaps the module with the one above or below it. */
  async move(code: string, moduleId: string, direction: 'up' | 'down') {
    return this.prisma.$transaction(async (tx) => {
      const module = await this.find(code, moduleId, tx);
      const modules = await tx.projectModule.findMany({
        where: { projectId: module.projectId },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        select: { id: true },
      });
      const from = modules.findIndex((row) => row.id === module.id);
      const to = direction === 'up' ? from - 1 : from + 1;
      if (to < 0 || to >= modules.length) return { moved: false };
      [modules[from], modules[to]] = [modules[to], modules[from]];
      for (const [position, row] of modules.entries()) {
        await tx.projectModule.update({
          where: { id: row.id },
          data: { position },
        });
      }
      return { moved: true };
    }, TX);
  }

  /** Removes a module with its items and timeline; topics are unlinked. */
  async remove(actor: SignedIn, code: string, moduleId: string) {
    return this.prisma.$transaction(async (tx) => {
      const module = await this.find(code, moduleId, tx);
      await tx.projectModule.delete({ where: { id: module.id } });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'project.moduleRemoved',
          entityType: 'project',
          entityId: module.projectId,
          data: { code, module: module.name },
        },
        tx,
      );
      return { removed: true };
    }, TX);
  }

  // ------------------------------------------------------------ stages

  /**
   * Moves a module to another stage, with a line on its timeline. Admins
   * may choose any stage; developers on the team the working ones and
   * Client review. Client review tells the customer.
   */
  async setStage(
    actor: SignedIn,
    code: string,
    moduleId: string,
    stage: ModuleStage,
    note: string | null,
  ) {
    if (!stagesFor(actor.role).includes(stage)) {
      throw new ForbiddenException({
        code: 'NOT_ALLOWED',
        message: `You can't move a module to ${STAGE_LABELS[stage]}.`,
      });
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const project = await this.projects.findActive(code, tx, actor);
      const module = await this.find(code, moduleId, tx, project.id);
      if (module.stage === stage) return null;
      await this.move_(tx, module, stage, note, actor.id);
      if (stage === 'CLIENT_REVIEW') {
        await this.events.moduleReady(tx, project, module);
      }
      return { project, module };
    }, TX);
    if (!result) return { stage, emailSent: false };
    const emailSent =
      stage === 'CLIENT_REVIEW'
        ? await this.events.emailModuleReady(result.project, result.module)
        : false;
    return { stage, emailSent };
  }

  /**
   * The customer's answer in Client review: Approve marks the module Done
   * (and its open items); Request changes starts a new round.
   */
  async review(
    actor: SignedIn,
    code: string,
    moduleId: string,
    input: ReviewInput,
  ) {
    const result = await this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: { code, deletedAt: null, ...customerScope(actor) },
        select: {
          id: true,
          code: true,
          name: true,
          customerId: true,
          status: true,
        },
      });
      if (!project) throw notFound();
      const module = await tx.projectModule.findFirst({
        where: { id: moduleId, projectId: project.id },
      });
      if (!module) throw notFound();
      if (module.stage !== 'CLIENT_REVIEW') {
        throw new ConflictException({
          code: 'NOT_IN_REVIEW',
          message: 'This module is not waiting for your review any more.',
        });
      }
      const to: ModuleStage =
        input.decision === 'approve' ? 'DONE' : 'CHANGES_REQUESTED';
      const moved = await this.move_(tx, module, to, input.note, actor.id);
      await this.events.moduleDecided(
        tx,
        project,
        module,
        input.decision,
        actor.name,
      );
      return { project, module: { ...module, round: moved.round } };
    }, TX);
    await this.events.emailModuleDecided(
      result.project,
      result.module,
      input.decision,
      input.note,
      actor.name,
    );
    return {
      stage: input.decision === 'approve' ? 'DONE' : 'CHANGES_REQUESTED',
    };
  }

  // ------------------------------------------------------------ the team

  async addMember(actor: SignedIn, code: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const project = await this.projects.findActive(code, tx);
      const user = await tx.user.findFirst({
        where: { id: userId, role: { in: [...TEAM_ROLES] }, status: 'ACTIVE' },
        select: { id: true, name: true },
      });
      if (!user) {
        throw new BadRequestException({
          code: 'NOT_A_TEAM_MEMBER',
          message: 'Choose an active team member.',
        });
      }
      const already = await tx.projectMember.findUnique({
        where: { projectId_userId: { projectId: project.id, userId } },
      });
      if (already) return { added: false };
      await tx.projectMember.create({
        data: { projectId: project.id, userId, addedById: actor.id },
      });
      await this.notifications.notify(
        [userId],
        {
          kind: 'project',
          text: `${actor.name} added you to ${project.code} ${project.name}`,
          href: teamProjectHref(project.code),
        },
        tx,
      );
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'project.memberAdded',
          entityType: 'project',
          entityId: project.id,
          data: { code, userId, name: user.name },
        },
        tx,
      );
      return { added: true };
    }, TX);
  }

  async removeMember(actor: SignedIn, code: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const project = await this.projects.findActive(code, tx);
      const member = await tx.projectMember.findUnique({
        where: { projectId_userId: { projectId: project.id, userId } },
        select: { user: { select: { name: true } } },
      });
      if (!member) return { removed: false };
      await tx.projectMember.delete({
        where: { projectId_userId: { projectId: project.id, userId } },
      });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'project.memberRemoved',
          entityType: 'project',
          entityId: project.id,
          data: { code, userId, name: member.user.name },
        },
        tx,
      );
      return { removed: true };
    }, TX);
  }

  // ------------------------------------------------------------ helpers

  /** The stage move itself: the module, its timeline line, Done's items. */
  private async move_(
    tx: Prisma.TransactionClient,
    module: {
      id: string;
      stage: ModuleStage;
      round: number;
      doneAt: Date | null;
    },
    to: ModuleStage,
    note: string | null,
    byId: string,
  ) {
    const next = stageMove(module, to);
    await tx.projectModule.update({ where: { id: module.id }, data: next });
    await tx.moduleStageChange.create({
      data: {
        moduleId: module.id,
        from: module.stage,
        to,
        round: next.round,
        note,
        byId,
      },
    });
    // Done means everything in it is done.
    if (to === 'DONE') {
      await tx.projectItem.updateMany({
        where: { moduleId: module.id, status: { not: 'DONE' } },
        data: { status: 'DONE', doneAt: new Date() },
      });
    }
    return next;
  }

  /** A module of an active project (the project found by its code). */
  private async find(
    code: string,
    moduleId: string,
    tx: Prisma.TransactionClient,
    projectId?: string,
  ) {
    const id = projectId ?? (await this.projects.findActive(code, tx)).id;
    const module = await tx.projectModule.findFirst({
      where: { id: moduleId, projectId: id },
    });
    if (!module) throw moduleNotFound();
    return module;
  }
}
