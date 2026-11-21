import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import type { SignedIn } from '../auth/signed-in.js';
import { pageWindow, type Paging } from '../common/paging.js';
import type {
  Prisma,
  TopicKind,
  TopicStatus,
} from '../generated/prisma/client.js';
import { can, projectScope } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  FileStorageService,
  type UploadedFile,
} from '../uploads/file-storage.service.js';
import { ProjectEventsService } from './project-events.service.js';
import { TopicEventsService, type Listener } from './topic-events.service.js';
import {
  systemLine,
  type DecisionInput,
  type NewTopicInput,
  type PostInput,
} from './topic-rules.js';

const TX = { isolationLevel: 'ReadCommitted' } as const;
const TEAM_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DEVELOPER'] as const;
const ADMINS = ['SUPER_ADMIN', 'ADMIN'];

const topicNotFound = () =>
  new NotFoundException({
    code: 'TOPIC_NOT_FOUND',
    message: 'This discussion does not exist.',
  });

const listenerSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  emailPrefs: true,
} satisfies Prisma.UserSelect;

/**
 * Project discussions. Customer topics: the customer and the project
 * team. Team topics (INTERNAL): the project team only, never the customer
 * (every portal query asks for CUSTOMER topics, and the portal controller
 * fixes the kind). The team reaches a project within projectScope(), so
 * developers only on the projects they are on.
 */
@Injectable()
export class TopicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: FileStorageService,
    private readonly events: TopicEventsService,
    private readonly projectEvents: ProjectEventsService,
    private readonly audit: AuditService,
  ) {}

  // ------------------------------------------------------------ reading

  async list(
    actor: SignedIn,
    code: string,
    kind: TopicKind,
    status: TopicStatus,
    paging: Paging,
  ) {
    const project = await this.project(actor, code, kind);
    const where = { projectId: project.id, kind, status };
    const [total, open, closed] = await Promise.all([
      this.prisma.projectTopic.count({ where }),
      this.prisma.projectTopic.count({
        where: { projectId: project.id, kind, status: 'OPEN' },
      }),
      this.prisma.projectTopic.count({
        where: { projectId: project.id, kind, status: 'CLOSED' },
      }),
    ]);
    const window = pageWindow(paging, total);
    const rows = await this.prisma.projectTopic.findMany({
      where,
      orderBy: [{ lastPostAt: 'desc' }, { number: 'desc' }],
      skip: window.skip,
      take: window.take,
      select: {
        number: true,
        title: true,
        status: true,
        createdAt: true,
        lastPostAt: true,
        answerPostId: true,
        module: { select: { id: true, name: true } },
        author: { select: { name: true, role: true } },
        asks: {
          where: { answeredAt: null },
          select: { user: { select: { name: true } } },
        },
        posts: {
          where: { kind: 'PROPOSAL', proposalState: 'PENDING' },
          select: { id: true },
        },
        _count: { select: { posts: { where: { kind: { not: 'SYSTEM' } } } } },
      },
    });
    return {
      counts: { open, closed },
      can: { start: !project.deletedAt },
      modules: project.modules,
      askChoices: kind === 'INTERNAL' ? await this.askChoices(project.id) : [],
      total,
      page: window.page,
      pageSize: window.pageSize,
      rows: rows.map((row) => ({
        number: row.number,
        title: row.title,
        status: row.status,
        createdAt: row.createdAt,
        lastPostAt: row.lastPostAt,
        module: row.module,
        startedBy: row.author.name,
        startedByCustomer: row.author.role === 'CUSTOMER',
        replies: Math.max(0, row._count.posts - 1),
        answered: Boolean(row.answerPostId),
        proposalWaiting: row.posts.length > 0,
        waitingFor: row.asks.map((ask) => ask.user.name),
      })),
    };
  }

  async detail(actor: SignedIn, code: string, kind: TopicKind, number: number) {
    const project = await this.project(actor, code, kind);
    const topic = await this.prisma.projectTopic.findUnique({
      where: { projectId_number: { projectId: project.id, number } },
      select: {
        id: true,
        number: true,
        kind: true,
        title: true,
        status: true,
        createdAt: true,
        closedAt: true,
        closeNote: true,
        answerPostId: true,
        authorId: true,
        module: { select: { id: true, name: true } },
        closedBy: { select: { name: true } },
        author: { select: { id: true, name: true, role: true } },
        asks: {
          orderBy: { createdAt: 'asc' },
          select: {
            answeredAt: true,
            user: { select: { id: true, name: true } },
          },
        },
        posts: {
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            kind: true,
            body: true,
            createdAt: true,
            editedAt: true,
            proposalState: true,
            decidedAt: true,
            decisionNote: true,
            decidedBy: { select: { name: true } },
            author: {
              select: { id: true, name: true, role: true, jobTitle: true },
            },
            files: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                fileName: true,
                contentType: true,
                size: true,
              },
            },
          },
        },
      },
    });
    if (!topic || topic.kind !== kind) throw topicNotFound();
    const customer = actor.role === 'CUSTOMER';
    const open = topic.status === 'OPEN' && !project.deletedAt;
    const admin = ADMINS.includes(actor.role);
    const mayClose =
      topic.authorId === actor.id ||
      (!customer && (admin || project.leadId === actor.id));
    return {
      number: topic.number,
      kind: topic.kind,
      title: topic.title,
      status: topic.status,
      createdAt: topic.createdAt,
      module: topic.module,
      startedBy: topic.author.name,
      closed: topic.closedAt
        ? {
            at: topic.closedAt,
            by: topic.closedBy?.name ?? null,
            note: topic.closeNote,
          }
        : null,
      answerPostId: topic.answerPostId,
      asked: topic.asks.map((ask) => ({
        id: ask.user.id,
        name: ask.user.name,
        answered: Boolean(ask.answeredAt),
      })),
      posts: topic.posts.map((post) => ({
        id: post.id,
        kind: post.kind,
        body: post.body,
        createdAt: post.createdAt,
        editedAt: post.editedAt,
        author: post.author
          ? {
              id: post.author.id,
              name: post.author.name,
              // The customer's own side, or FlyConnect Tech.
              customer: post.author.role === 'CUSTOMER',
              jobTitle:
                post.author.role === 'CUSTOMER' ? null : post.author.jobTitle,
            }
          : null,
        proposal:
          post.kind === 'PROPOSAL'
            ? {
                state: post.proposalState,
                decidedBy: post.decidedBy?.name ?? null,
                decidedAt: post.decidedAt,
                note: post.decisionNote,
              }
            : null,
        files: post.files,
        mine: post.author?.id === actor.id,
      })),
      can: {
        reply: open,
        propose: open && !customer && kind === 'CUSTOMER',
        ask: open && !customer && kind === 'INTERNAL',
        decide: open && customer,
        answer:
          !project.deletedAt &&
          (topic.authorId === actor.id || (!customer && admin)),
        close: open && mayClose,
        reopen: topic.status === 'CLOSED' && !project.deletedAt && mayClose,
        removePosts: !customer && admin && !project.deletedAt,
        delete: !customer && admin && !project.deletedAt,
      },
      askChoices:
        kind === 'INTERNAL' && open ? await this.askChoices(project.id) : [],
    };
  }

  /** A file on a post of a topic this person may see. */
  async file(
    actor: SignedIn,
    code: string,
    kind: TopicKind,
    number: number,
    fileId: string,
  ) {
    const project = await this.project(actor, code, kind);
    const file = await this.prisma.topicFile.findFirst({
      where: { id: fileId, topic: { projectId: project.id, number, kind } },
      select: {
        fileName: true,
        contentType: true,
        size: true,
        storageKey: true,
      },
    });
    if (!file) throw topicNotFound();
    return { ...file, stream: this.storage.read(file.storageKey) };
  }

  // ------------------------------------------------------------ writing

  /** Starts a topic with its first post (and files). */
  async create(
    actor: SignedIn,
    code: string,
    kind: TopicKind,
    input: NewTopicInput,
    files: UploadedFile[],
  ) {
    const project = await this.project(actor, code, kind, true);
    if (!input.body && !files.length) {
      throw new BadRequestException({
        code: 'EMPTY_POST',
        message: 'Write the first message or attach a file.',
      });
    }
    if (
      input.moduleId &&
      !project.modules.some((m) => m.id === input.moduleId)
    ) {
      throw new BadRequestException({
        code: 'MODULE_NOT_FOUND',
        message: 'This module is not part of the project.',
      });
    }
    const asked =
      kind === 'INTERNAL'
        ? await this.checkAsked(project.id, input.ask, actor)
        : [];
    const checked = await this.storage.check(files);
    const topicId = randomUUID();
    const keys = await this.storage.keepIn(checked, `topics/${topicId}`);

    let number = 0;
    let listeners: Listener[] = [];
    try {
      number = await this.withNumber(project.id, async (tx, next) => {
        await tx.projectTopic.create({
          data: {
            id: topicId,
            projectId: project.id,
            number: next,
            kind,
            moduleId: input.moduleId,
            title: input.title,
            authorId: actor.id,
          },
        });
        const post = await tx.topicPost.create({
          data: { topicId, authorId: actor.id, body: input.body },
          select: { id: true },
        });
        await this.saveFiles(tx, topicId, post.id, checked, keys, actor.id);
        if (asked.length) await this.ask(tx, topicId, asked, actor);
        // Who hears: the people asked, the project team, and the customer
        // when the team starts a customer topic (never the author).
        const team = await this.projectEvents.projectTeam(project.id, tx);
        const customer =
          kind === 'CUSTOMER' ? await this.contact(project.customerId, tx) : [];
        listeners = unique(
          [
            ...asked,
            ...(kind === 'INTERNAL' && asked.length
              ? []
              : await this.asListeners(tx, team)),
            ...customer,
          ],
          actor.id,
        );
        const topic = this.eventTopic(project, next, kind, input.title);
        await this.events.notify(
          tx,
          topic,
          listeners.filter((p) => !asked.some((a) => a.id === p.id)),
          `${actor.name} started "${input.title}" on ${project.code}`,
        );
        if (asked.length) {
          await this.events.notify(
            tx,
            topic,
            asked.filter((p) => p.id !== actor.id),
            `${actor.name} asked you about ${project.code}: ${input.title}`,
          );
        }
        return next;
      });
    } catch (error) {
      await this.storage.remove(keys);
      throw error;
    }
    const topic = this.eventTopic(project, number, kind, input.title);
    const post = {
      authorName: actor.name,
      body: input.body,
      files: checked.length,
    };
    await this.events.send(
      topic,
      listeners.filter((p) => !asked.some((a) => a.id === p.id)),
      'new',
      post,
    );
    await this.events.send(
      topic,
      asked.filter((p) => p.id !== actor.id),
      'asked',
      post,
    );
    return { number };
  }

  /** A reply (or, from the team on customer topics, a proposal). */
  async post(
    actor: SignedIn,
    code: string,
    kind: TopicKind,
    number: number,
    input: PostInput,
    files: UploadedFile[],
  ) {
    const project = await this.project(actor, code, kind, true);
    const topic = await this.openTopic(project.id, kind, number);
    const customer = actor.role === 'CUSTOMER';
    if (input.proposal && (customer || kind !== 'CUSTOMER')) {
      throw new ForbiddenException({
        code: 'NOT_ALLOWED',
        message: 'Only the team posts proposals, on customer discussions.',
      });
    }
    if (!input.body && !files.length) {
      throw new BadRequestException({
        code: 'EMPTY_POST',
        message: 'Write a reply or attach a file.',
      });
    }
    const asked =
      kind === 'INTERNAL' && !customer
        ? await this.checkAsked(project.id, input.ask, actor)
        : [];
    const checked = await this.storage.check(files);
    const keys = await this.storage.keepIn(checked, `topics/${topic.id}`);
    let listeners: Listener[] = [];
    try {
      listeners = await this.prisma.$transaction(async (tx) => {
        const post = await tx.topicPost.create({
          data: {
            topicId: topic.id,
            authorId: actor.id,
            body: input.body,
            kind: input.proposal ? 'PROPOSAL' : 'MESSAGE',
            proposalState: input.proposal ? 'PENDING' : null,
          },
          select: { id: true },
        });
        await this.saveFiles(tx, topic.id, post.id, checked, keys, actor.id);
        await tx.projectTopic.update({
          where: { id: topic.id },
          data: { lastPostAt: new Date() },
        });
        // Their reply answers what they were asked.
        await tx.topicAsk.updateMany({
          where: { topicId: topic.id, userId: actor.id, answeredAt: null },
          data: { answeredAt: new Date() },
        });
        if (asked.length) await this.ask(tx, topic.id, asked, actor);
        const people = unique(
          await this.participants(tx, topic.id, kind, project),
          actor.id,
        );
        const event = this.eventTopic(project, number, kind, topic.title);
        await this.events.notify(
          tx,
          event,
          people.filter((p) => !asked.some((a) => a.id === p.id)),
          input.proposal
            ? `${actor.name} posted a proposal on "${topic.title}"`
            : `${actor.name} replied on "${topic.title}"`,
        );
        if (asked.length) {
          await this.events.notify(
            tx,
            event,
            asked.filter((p) => p.id !== actor.id),
            `${actor.name} asked you about ${project.code}: ${topic.title}`,
          );
        }
        return people;
      }, TX);
    } catch (error) {
      await this.storage.remove(keys);
      throw error;
    }
    const event = this.eventTopic(project, number, kind, topic.title);
    const post = {
      authorName: actor.name,
      body: input.body,
      files: checked.length,
    };
    const others = listeners.filter((p) => !asked.some((a) => a.id === p.id));
    // A proposal: the customer gets "waiting for your approval".
    if (input.proposal) {
      await this.events.send(
        event,
        others.filter((p) => p.role === 'CUSTOMER'),
        'proposal',
        post,
      );
      await this.events.send(
        event,
        others.filter((p) => p.role !== 'CUSTOMER'),
        'reply',
        post,
      );
    } else {
      await this.events.send(event, others, 'reply', post);
    }
    await this.events.send(
      event,
      asked.filter((p) => p.id !== actor.id),
      'asked',
      post,
    );
    return { ok: true };
  }

  /** The author corrects their own post. */
  async editPost(
    actor: SignedIn,
    code: string,
    kind: TopicKind,
    number: number,
    postId: string,
    body: string,
  ) {
    const project = await this.project(actor, code, kind, true);
    const topic = await this.openTopic(project.id, kind, number);
    const post = await this.prisma.topicPost.findFirst({
      where: { id: postId, topicId: topic.id, kind: { not: 'SYSTEM' } },
      select: { id: true, authorId: true, kind: true, proposalState: true },
    });
    if (!post) throw topicNotFound();
    if (post.authorId !== actor.id) {
      throw new ForbiddenException({
        code: 'NOT_ALLOWED',
        message: 'You can only edit your own messages.',
      });
    }
    if (post.kind === 'PROPOSAL' && post.proposalState !== 'PENDING') {
      throw new ConflictException({
        code: 'ALREADY_DECIDED',
        message: 'This proposal has been answered; post a new one instead.',
      });
    }
    await this.prisma.topicPost.update({
      where: { id: post.id },
      data: { body, editedAt: new Date() },
    });
    return { ok: true };
  }

  /** Super admins and admins remove a post and its files. */
  async removePost(
    actor: SignedIn,
    code: string,
    kind: TopicKind,
    number: number,
    postId: string,
  ) {
    this.adminsOnly(actor);
    const project = await this.project(actor, code, kind, true);
    const topic = await this.anyTopic(project.id, kind, number);
    const keys = await this.prisma.$transaction(async (tx) => {
      const post = await tx.topicPost.findFirst({
        where: { id: postId, topicId: topic.id },
        select: { id: true, files: { select: { storageKey: true } } },
      });
      if (!post) throw topicNotFound();
      const first = await tx.topicPost.findFirst({
        where: { topicId: topic.id },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: { id: true },
      });
      if (first?.id === post.id) {
        throw new ConflictException({
          code: 'FIRST_POST',
          message: 'This is the first message: delete the topic instead.',
        });
      }
      await tx.topicPost.delete({ where: { id: post.id } });
      return post.files.map((file) => file.storageKey);
    }, TX);
    await this.storage.remove(keys);
    return { removed: true };
  }

  /** Mark (or clear) the reply that answered the topic. */
  async setAnswer(
    actor: SignedIn,
    code: string,
    kind: TopicKind,
    number: number,
    postId: string | null,
  ) {
    const project = await this.project(actor, code, kind, true);
    const topic = await this.anyTopic(project.id, kind, number);
    const customer = actor.role === 'CUSTOMER';
    if (
      topic.authorId !== actor.id &&
      (customer || !ADMINS.includes(actor.role))
    ) {
      throw new ForbiddenException({
        code: 'NOT_ALLOWED',
        message: 'Only who started the topic, or an admin, marks the answer.',
      });
    }
    return this.prisma.$transaction(async (tx) => {
      let author = '';
      if (postId) {
        const post = await tx.topicPost.findFirst({
          where: { id: postId, topicId: topic.id, kind: { not: 'SYSTEM' } },
          select: { author: { select: { name: true } } },
        });
        if (!post) throw topicNotFound();
        author = post.author?.name ?? '';
      }
      await tx.projectTopic.update({
        where: { id: topic.id },
        data: { answerPostId: postId },
      });
      await this.line(
        tx,
        topic.id,
        postId
          ? systemLine.answered(actor.name, author)
          : systemLine.unanswered(actor.name),
      );
      return { answerPostId: postId };
    }, TX);
  }

  async close(
    actor: SignedIn,
    code: string,
    kind: TopicKind,
    number: number,
    note: string | null,
  ) {
    const project = await this.project(actor, code, kind, true);
    const topic = await this.openTopic(project.id, kind, number);
    this.mayClose(actor, topic, project);
    const listeners = await this.prisma.$transaction(async (tx) => {
      await tx.projectTopic.update({
        where: { id: topic.id },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          closedById: actor.id,
          closeNote: note,
        },
      });
      await this.line(tx, topic.id, systemLine.closed(actor.name, note));
      const people = unique(
        await this.participants(tx, topic.id, kind, project),
        actor.id,
      );
      await this.events.notify(
        tx,
        this.eventTopic(project, number, kind, topic.title),
        people,
        `${actor.name} closed "${topic.title}"`,
      );
      return people;
    }, TX);
    return { status: 'CLOSED', notified: listeners.length };
  }

  async reopen(actor: SignedIn, code: string, kind: TopicKind, number: number) {
    const project = await this.project(actor, code, kind, true);
    const topic = await this.anyTopic(project.id, kind, number);
    if (topic.status !== 'CLOSED') return { status: topic.status };
    this.mayClose(actor, topic, project);
    await this.prisma.$transaction(async (tx) => {
      await tx.projectTopic.update({
        where: { id: topic.id },
        data: {
          status: 'OPEN',
          closedAt: null,
          closedById: null,
          closeNote: null,
          lastPostAt: new Date(),
        },
      });
      await this.line(tx, topic.id, systemLine.reopened(actor.name));
      const people = unique(
        await this.participants(tx, topic.id, kind, project),
        actor.id,
      );
      await this.events.notify(
        tx,
        this.eventTopic(project, number, kind, topic.title),
        people,
        `${actor.name} reopened "${topic.title}"`,
      );
    }, TX);
    return { status: 'OPEN' };
  }

  /** The customer approves a proposal or asks for changes. */
  async decide(
    actor: SignedIn,
    code: string,
    number: number,
    postId: string,
    input: DecisionInput,
  ) {
    const project = await this.project(actor, code, 'CUSTOMER', true);
    const topic = await this.openTopic(project.id, 'CUSTOMER', number);
    const listeners = await this.prisma.$transaction(async (tx) => {
      const changed = await tx.topicPost.updateMany({
        where: {
          id: postId,
          topicId: topic.id,
          kind: 'PROPOSAL',
          proposalState: 'PENDING',
        },
        data: {
          proposalState:
            input.decision === 'approve' ? 'APPROVED' : 'CHANGES_REQUESTED',
          decidedById: actor.id,
          decidedAt: new Date(),
          decisionNote: input.note,
        },
      });
      if (!changed.count) {
        throw new ConflictException({
          code: 'NOT_PENDING',
          message: 'This proposal has been answered already.',
        });
      }
      await this.line(
        tx,
        topic.id,
        input.decision === 'approve'
          ? systemLine.approved(actor.name, input.note)
          : systemLine.changes(actor.name, input.note ?? ''),
      );
      await tx.projectTopic.update({
        where: { id: topic.id },
        data: { lastPostAt: new Date() },
      });
      const people = unique(
        await this.participants(tx, topic.id, 'CUSTOMER', project),
        actor.id,
      );
      await this.events.notify(
        tx,
        this.eventTopic(project, number, 'CUSTOMER', topic.title),
        people,
        input.decision === 'approve'
          ? `${actor.name} approved the proposal on "${topic.title}"`
          : `${actor.name} asked for changes on "${topic.title}"`,
      );
      return people;
    }, TX);
    await this.events.send(
      this.eventTopic(project, number, 'CUSTOMER', topic.title),
      listeners,
      input.decision === 'approve' ? 'approved' : 'changes',
      { authorName: actor.name, body: input.note ?? '', files: 0 },
    );
    return {
      state: input.decision === 'approve' ? 'APPROVED' : 'CHANGES_REQUESTED',
    };
  }

  /** Super admins and admins delete a whole topic (audited). */
  async remove(actor: SignedIn, code: string, kind: TopicKind, number: number) {
    this.adminsOnly(actor);
    const project = await this.project(actor, code, kind, true);
    const topic = await this.anyTopic(project.id, kind, number);
    const keys = await this.prisma.$transaction(async (tx) => {
      const files = await tx.topicFile.findMany({
        where: { topicId: topic.id },
        select: { storageKey: true },
      });
      // The answer points at a post: clear it first.
      await tx.projectTopic.update({
        where: { id: topic.id },
        data: { answerPostId: null },
      });
      await tx.projectTopic.delete({ where: { id: topic.id } });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'topic.deleted',
          entityType: 'project',
          entityId: project.id,
          data: { code, number, kind, title: topic.title },
        },
        tx,
      );
      return files.map((file) => file.storageKey);
    }, TX);
    await this.storage.remove(keys);
    return { removed: true };
  }

  // ------------------------------------------------------------ helpers

  /**
   * The project, within this person's scope: customers only their own
   * company's (and only customer topics), developers only theirs.
   */
  private async project(
    actor: SignedIn,
    code: string,
    kind: TopicKind,
    write = false,
  ) {
    if (actor.role === 'CUSTOMER' && kind !== 'CUSTOMER') throw topicNotFound();
    if (actor.role !== 'CUSTOMER' && !can(actor, 'discussions.join')) {
      throw new ForbiddenException({ code: 'NOT_ALLOWED' });
    }
    const project = await this.prisma.project.findFirst({
      where: {
        code,
        ...projectScope(actor),
        customer: { deletedAt: null },
        // Customers never see deleted projects; the team reads them.
        ...(actor.role === 'CUSTOMER' || write ? { deletedAt: null } : {}),
      },
      select: {
        id: true,
        code: true,
        name: true,
        customerId: true,
        leadId: true,
        deletedAt: true,
        modules: {
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
          select: { id: true, name: true },
        },
      },
    });
    if (!project) {
      throw new NotFoundException({
        code: 'PROJECT_NOT_FOUND',
        message: 'This project does not exist.',
      });
    }
    return project;
  }

  private async anyTopic(projectId: string, kind: TopicKind, number: number) {
    const topic = await this.prisma.projectTopic.findUnique({
      where: { projectId_number: { projectId, number } },
      select: {
        id: true,
        kind: true,
        status: true,
        title: true,
        authorId: true,
      },
    });
    if (!topic || topic.kind !== kind) throw topicNotFound();
    return topic;
  }

  private async openTopic(projectId: string, kind: TopicKind, number: number) {
    const topic = await this.anyTopic(projectId, kind, number);
    if (topic.status === 'CLOSED') {
      throw new ConflictException({
        code: 'TOPIC_CLOSED',
        message: 'This topic is closed. Reopen it to reply.',
      });
    }
    return topic;
  }

  private mayClose(
    actor: SignedIn,
    topic: { authorId: string },
    project: { leadId: string | null },
  ) {
    const customer = actor.role === 'CUSTOMER';
    const allowed =
      topic.authorId === actor.id ||
      (!customer &&
        (ADMINS.includes(actor.role) || project.leadId === actor.id));
    if (!allowed) {
      throw new ForbiddenException({
        code: 'NOT_ALLOWED',
        message:
          'Who started the topic, the project lead or an admin closes it.',
      });
    }
  }

  private adminsOnly(actor: SignedIn) {
    if (!ADMINS.includes(actor.role)) {
      throw new ForbiddenException({ code: 'NOT_ALLOWED' });
    }
  }

  /** Team topics: who may be asked (super admins, admins, managers, the team). */
  private async askChoices(projectId: string) {
    return this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { role: { in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] } },
          { role: 'DEVELOPER', projectTeams: { some: { projectId } } },
        ],
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, jobTitle: true, role: true },
    });
  }

  /** The people asked must be on the project team (not the asker). */
  private async checkAsked(projectId: string, ids: string[], actor: SignedIn) {
    const wanted = ids.filter((id) => id !== actor.id);
    if (!wanted.length) return [];
    const choices = await this.askChoices(projectId);
    if (wanted.some((id) => !choices.some((c) => c.id === id))) {
      throw new BadRequestException({
        code: 'NOT_ON_THE_TEAM',
        message: 'Ask people on the project team.',
      });
    }
    return this.prisma.user.findMany({
      where: { id: { in: wanted } },
      select: listenerSelect,
    });
  }

  private async ask(
    tx: Prisma.TransactionClient,
    topicId: string,
    people: Listener[],
    actor: SignedIn,
  ) {
    for (const person of people) {
      await tx.topicAsk.upsert({
        where: { topicId_userId: { topicId, userId: person.id } },
        create: { topicId, userId: person.id, askedById: actor.id },
        update: {
          askedById: actor.id,
          answeredAt: null,
          createdAt: new Date(),
        },
      });
    }
    await this.line(
      tx,
      topicId,
      systemLine.asked(
        actor.name,
        people.map((person) => person.name),
      ),
    );
  }

  /**
   * Everyone taking part: who started it, everyone who posted, everyone
   * asked, and on customer topics the customer's contact. Active only.
   */
  private async participants(
    tx: Prisma.TransactionClient,
    topicId: string,
    kind: TopicKind,
    project: { customerId: string },
  ): Promise<Listener[]> {
    const topic = await tx.projectTopic.findUniqueOrThrow({
      where: { id: topicId },
      select: {
        author: { select: listenerSelect },
        posts: {
          where: { authorId: { not: null } },
          select: { author: { select: listenerSelect } },
        },
        asks: { select: { user: { select: listenerSelect } } },
      },
    });
    const people = [
      topic.author,
      ...topic.posts.map((post) => post.author),
      ...topic.asks.map((ask) => ask.user),
      ...(kind === 'CUSTOMER'
        ? await this.contact(project.customerId, tx)
        : []),
    ].filter((person): person is NonNullable<typeof person> => Boolean(person));
    return people.filter(
      (person) =>
        person.status === 'ACTIVE' &&
        (kind === 'CUSTOMER' || person.role !== 'CUSTOMER'),
    );
  }

  private async contact(customerId: string, tx: Prisma.TransactionClient) {
    return tx.user.findMany({
      where: { customerId, role: 'CUSTOMER', status: 'ACTIVE' },
      select: listenerSelect,
    });
  }

  private async asListeners(
    tx: Prisma.TransactionClient,
    people: { id: string }[],
  ): Promise<Listener[]> {
    if (!people.length) return [];
    return tx.user.findMany({
      where: {
        id: { in: people.map((p) => p.id) },
        role: { in: [...TEAM_ROLES] },
      },
      select: listenerSelect,
    });
  }

  private async saveFiles(
    tx: Prisma.TransactionClient,
    topicId: string,
    postId: string,
    checked: Awaited<ReturnType<FileStorageService['check']>>,
    keys: string[],
    uploadedById: string,
  ) {
    if (!checked.length) return;
    await tx.topicFile.createMany({
      data: checked.map((file, index) => ({
        topicId,
        postId,
        fileName: file.fileName,
        contentType: file.contentType,
        size: file.size,
        storageKey: keys[index],
        uploadedById,
      })),
    });
  }

  /** A system line in the thread ("Emma closed this topic"). */
  private line(tx: Prisma.TransactionClient, topicId: string, body: string) {
    return tx.topicPost.create({
      data: { topicId, authorId: null, kind: 'SYSTEM', body },
    });
  }

  /**
   * Runs the save with the project's next topic number (#1, #2…). Two
   * topics started at once can pick the same number; the second tries
   * again with the next one.
   */
  private async withNumber<T>(
    projectId: string,
    save: (tx: Prisma.TransactionClient, number: number) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const last = await tx.projectTopic.findFirst({
            where: { projectId },
            orderBy: { number: 'desc' },
            select: { number: true },
          });
          return save(tx, (last?.number ?? 0) + 1);
        }, TX);
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code !== 'P2002' || attempt >= 3) throw error;
      }
    }
  }

  private eventTopic(
    project: { code: string; name: string },
    number: number,
    kind: TopicKind,
    title: string,
  ) {
    return {
      number,
      kind,
      title,
      project: { code: project.code, name: project.name },
    };
  }
}

/** Each person once, never the one acting. */
function unique(people: Listener[], except: string): Listener[] {
  const seen = new Map<string, Listener>();
  for (const person of people) {
    if (person.id !== except) seen.set(person.id, person);
  }
  return [...seen.values()];
}
