import type { Readable } from 'node:stream';
import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { ZipFile } from 'yazl';
import { AuditService } from '../audit/audit.service.js';
import type { SignedIn } from '../auth/signed-in.js';
import { toCsv, ukStamp } from '../common/csv.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from '../requests/labels.js';
import {
  CUSTOMER_VISIBLE,
  visibleFiles,
} from '../requests/requests.service.js';
import { FileStorageService } from '../uploads/file-storage.service.js';
import type {
  ProjectItemStatus,
  ProposalState,
} from '../generated/prisma/client.js';
import { STAGE_LABELS } from '../projects/module-rules.js';
import {
  calendarDay,
  progressOf,
  progressWords,
} from '../projects/project-rules.js';

const README = `Your data from FlyConnect Tech
===============================

These files hold what we keep about your account (UK GDPR, the right of
access):

- profile.csv          your company and contact details
- projects.csv         your projects and their details
- project-items.csv    what each project includes, and how far it is
- project-updates.csv  the updates we posted on your projects
- modules.csv          each project's modules, their stage and dates
- module-timeline.csv  every stage each module went through
- discussions.csv      your project discussions with us
- discussion-messages.csv  the messages in them
- requests.csv         your support requests
- messages.csv         the conversation on each request (your replies, our
                       replies and the status lines)
- files/               the files on your requests (one folder per request)
                       and on project updates and discussions
                       (files/projects/<code>/)

Our team's internal notes (on requests and projects) and our team's own
discussions are not part of your data and are not included.
Questions: info@flyconnecttech.co.uk
`;

const ITEM_WORDS: Record<ProjectItemStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

const PROPOSAL_WORDS: Record<ProposalState, string> = {
  PENDING: 'waiting',
  APPROVED: 'approved',
  CHANGES_REQUESTED: 'changes requested',
};

const KIND_WORDS: Record<string, string> = {
  CUSTOMER_REPLY: 'Your reply',
  STAFF_REPLY: 'Our reply',
  SYSTEM: 'Status line',
};

/** A file name safe inside a ZIP: no folders, no odd characters. */
function safeName(name: string): string {
  let safe = '';
  for (let i = 0; i < name.length && safe.length < 150; i += 1) {
    const char = name.charAt(i);
    safe += name.charCodeAt(i) < 32 || '\\/:*?"<>|'.includes(char) ? '_' : char;
  }
  return safe || 'file';
}

/**
 * A customer's data as one ZIP (UK GDPR subject access), from the customer
 * page (customers.manage). Only what the customer can see in the portal:
 * never internal notes or the files on them. Each export is audited.
 */
@Injectable()
export class CustomerExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: FileStorageService,
    private readonly audit: AuditService,
  ) {}

  async zip(actor: SignedIn, customerId: string): Promise<StreamableFile> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        company: true,
        country: true,
        createdAt: true,
        contactUser: {
          select: {
            name: true,
            email: true,
            phone: true,
            country: true,
            status: true,
            createdAt: true,
          },
        },
        projects: {
          orderBy: { code: 'asc' },
          // Never teamNotes: they are the team's, not the customer's.
          select: {
            code: true,
            name: true,
            type: true,
            status: true,
            description: true,
            startDate: true,
            targetDate: true,
            liveDate: true,
            supportUntil: true,
            liveUrl: true,
            testUrl: true,
            builtWith: true,
            deletedAt: true,
            createdAt: true,
            lead: { select: { name: true } },
            items: {
              orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
              select: {
                title: true,
                detail: true,
                status: true,
                doneAt: true,
                module: { select: { name: true } },
              },
            },
            modules: {
              orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
              select: {
                name: true,
                stage: true,
                round: true,
                startDate: true,
                targetDate: true,
                doneAt: true,
                stages: {
                  orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
                  select: {
                    from: true,
                    to: true,
                    round: true,
                    note: true,
                    createdAt: true,
                    by: { select: { name: true } },
                  },
                },
              },
            },
            // Customer discussions only: team topics are not their data.
            topics: {
              where: { kind: 'CUSTOMER' },
              orderBy: { number: 'asc' },
              select: {
                number: true,
                title: true,
                status: true,
                createdAt: true,
                closedAt: true,
                closeNote: true,
                module: { select: { name: true } },
                author: { select: { name: true } },
                posts: {
                  orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
                  select: {
                    kind: true,
                    body: true,
                    createdAt: true,
                    proposalState: true,
                    author: { select: { name: true } },
                    files: {
                      orderBy: { createdAt: 'asc' },
                      select: { fileName: true, storageKey: true },
                    },
                  },
                },
              },
            },
            updates: {
              orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
              select: {
                body: true,
                createdAt: true,
                author: { select: { name: true } },
                files: {
                  orderBy: { createdAt: 'asc' },
                  select: { fileName: true, storageKey: true },
                },
              },
            },
          },
        },
        requests: {
          orderBy: { createdAt: 'asc' },
          select: {
            code: true,
            title: true,
            description: true,
            url: true,
            type: true,
            priority: true,
            status: true,
            createdAt: true,
            resolvedAt: true,
            closedAt: true,
            rating: true,
            ratingComment: true,
            project: { select: { name: true } },
            messages: {
              where: { kind: { in: CUSTOMER_VISIBLE } },
              orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
              select: {
                kind: true,
                body: true,
                createdAt: true,
                author: { select: { name: true } },
              },
            },
            attachments: {
              where: visibleFiles,
              orderBy: { createdAt: 'asc' },
              select: { fileName: true, storageKey: true },
            },
          },
        },
      },
    });
    if (!customer) throw new NotFoundException();
    const contact = customer.contactUser;

    const zip = new ZipFile();
    const add = (name: string, text: string) =>
      zip.addBuffer(Buffer.from(text, 'utf8'), name);

    add('README.txt', README);
    add(
      'profile.csv',
      toCsv(
        [
          'Company',
          'Country',
          'Contact',
          'Email',
          'Phone',
          'Account',
          'Customer since',
        ],
        [
          [
            customer.company,
            contact?.country ?? customer.country ?? '',
            contact?.name ?? '',
            contact?.email ?? '',
            contact?.phone ?? '',
            contact?.status ?? '',
            ukStamp(customer.createdAt),
          ],
        ],
      ),
    );
    add(
      'projects.csv',
      toCsv(
        [
          'Code',
          'Name',
          'Type',
          'Status',
          'Description',
          'Start',
          'Target',
          'Went live',
          'Support until',
          'Live address',
          'Test address',
          'Built with',
          'Lead',
          'Progress',
          'Added',
          'Deleted',
        ],
        customer.projects.map((p) => [
          p.code,
          p.name,
          p.type,
          p.status,
          p.description,
          calendarDay(p.startDate),
          calendarDay(p.targetDate),
          calendarDay(p.liveDate),
          calendarDay(p.supportUntil),
          p.liveUrl,
          p.testUrl,
          p.builtWith,
          p.lead?.name ?? '',
          progressWords(progressOf(p.items)),
          ukStamp(p.createdAt),
          ukStamp(p.deletedAt),
        ]),
      ),
    );
    add(
      'project-items.csv',
      toCsv(
        ['Project', 'Module', 'Item', 'Detail', 'Status', 'Done'],
        customer.projects.flatMap((p) =>
          p.items.map((item) => [
            p.code,
            item.module.name,
            item.title,
            item.detail,
            ITEM_WORDS[item.status],
            ukStamp(item.doneAt),
          ]),
        ),
      ),
    );
    add(
      'modules.csv',
      toCsv(
        ['Project', 'Module', 'Stage', 'Round', 'Start', 'Target', 'Done'],
        customer.projects.flatMap((p) =>
          p.modules.map((m) => [
            p.code,
            m.name,
            STAGE_LABELS[m.stage],
            m.round,
            calendarDay(m.startDate),
            calendarDay(m.targetDate),
            ukStamp(m.doneAt),
          ]),
        ),
      ),
    );
    add(
      'module-timeline.csv',
      toCsv(
        ['Project', 'Module', 'When', 'From', 'To', 'Round', 'By', 'Note'],
        customer.projects.flatMap((p) =>
          p.modules.flatMap((m) =>
            m.stages.map((change) => [
              p.code,
              m.name,
              ukStamp(change.createdAt),
              change.from ? STAGE_LABELS[change.from] : '',
              STAGE_LABELS[change.to],
              change.round,
              change.by?.name ?? '',
              change.note,
            ]),
          ),
        ),
      ),
    );
    add(
      'discussions.csv',
      toCsv(
        [
          'Project',
          'Topic',
          'Title',
          'Module',
          'Started by',
          'Started',
          'Status',
          'Closed',
          'Closing note',
        ],
        customer.projects.flatMap((p) =>
          p.topics.map((topic) => [
            p.code,
            `#${topic.number}`,
            topic.title,
            topic.module?.name ?? '',
            topic.author.name,
            ukStamp(topic.createdAt),
            topic.status === 'OPEN' ? 'Open' : 'Closed',
            ukStamp(topic.closedAt),
            topic.closeNote,
          ]),
        ),
      ),
    );
    add(
      'discussion-messages.csv',
      toCsv(
        ['Project', 'Topic', 'When', 'From', 'Kind', 'Message', 'Files'],
        customer.projects.flatMap((p) =>
          p.topics.flatMap((topic) =>
            topic.posts.map((post) => [
              p.code,
              `#${topic.number}`,
              ukStamp(post.createdAt),
              post.author?.name ?? '',
              post.kind === 'PROPOSAL'
                ? `Proposal (${PROPOSAL_WORDS[post.proposalState ?? 'PENDING']})`
                : post.kind === 'SYSTEM'
                  ? 'Line'
                  : 'Message',
              post.body,
              post.files.map((file) => file.fileName).join(', '),
            ]),
          ),
        ),
      ),
    );
    add(
      'project-updates.csv',
      toCsv(
        ['Project', 'When', 'From', 'Update', 'Files'],
        customer.projects.flatMap((p) =>
          p.updates.map((update) => [
            p.code,
            ukStamp(update.createdAt),
            update.author.name,
            update.body,
            update.files.map((file) => file.fileName).join(', '),
          ]),
        ),
      ),
    );
    add(
      'requests.csv',
      toCsv(
        [
          'Code',
          'Title',
          'Description',
          'Link',
          'Project',
          'Type',
          'Priority',
          'Status',
          'Sent',
          'Resolved',
          'Closed',
          'Your rating',
          'Your comment',
        ],
        customer.requests.map((r) => [
          r.code,
          r.title,
          r.description,
          r.url,
          r.project.name,
          TYPE_LABELS[r.type],
          PRIORITY_LABELS[r.priority],
          STATUS_LABELS[r.status],
          ukStamp(r.createdAt),
          ukStamp(r.resolvedAt),
          ukStamp(r.closedAt),
          r.rating,
          r.ratingComment,
        ]),
      ),
    );
    add(
      'messages.csv',
      toCsv(
        ['Request', 'When', 'Kind', 'From', 'Message'],
        customer.requests.flatMap((r) =>
          r.messages.map((m) => [
            r.code,
            ukStamp(m.createdAt),
            KIND_WORDS[m.kind] ?? m.kind,
            m.kind === 'STAFF_REPLY'
              ? 'FlyConnect Tech'
              : (m.author?.name ?? ''),
            m.body,
          ]),
        ),
      ),
    );

    let files = 0;
    for (const request of customer.requests) {
      const used = new Set<string>();
      for (const file of request.attachments) {
        let name = safeName(file.fileName);
        for (let n = 2; used.has(name); n += 1)
          name = `${n}-${safeName(file.fileName)}`;
        used.add(name);
        zip.addReadStream(
          this.storage.read(file.storageKey),
          `files/${request.code}/${name}`,
        );
        files += 1;
      }
    }
    for (const project of customer.projects) {
      const used = new Set<string>();
      for (const file of project.updates.flatMap((u) => u.files)) {
        let name = safeName(file.fileName);
        for (let n = 2; used.has(name); n += 1)
          name = `${n}-${safeName(file.fileName)}`;
        used.add(name);
        zip.addReadStream(
          this.storage.read(file.storageKey),
          `files/projects/${project.code}/${name}`,
        );
        files += 1;
      }
    }
    for (const project of customer.projects) {
      for (const topic of project.topics) {
        const used = new Set<string>();
        for (const file of topic.posts.flatMap((post) => post.files)) {
          let name = safeName(file.fileName);
          for (let n = 2; used.has(name); n += 1)
            name = `${n}-${safeName(file.fileName)}`;
          used.add(name);
          zip.addReadStream(
            this.storage.read(file.storageKey),
            `files/projects/${project.code}/discussion-${topic.number}/${name}`,
          );
          files += 1;
        }
      }
    }
    zip.end();

    await this.audit.record({
      actorId: actor.id,
      action: 'export.downloaded',
      entityType: 'export',
      entityId: 'customer-data',
      data: {
        customerId: customer.id,
        company: customer.company,
        requests: customer.requests.length,
        files,
      },
    });

    const day = new Date().toISOString().slice(0, 10);
    const slug = customer.company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    // yazl's output is a Node stream (a PassThrough), typed loosely.
    return new StreamableFile(zip.outputStream as Readable, {
      type: 'application/zip',
      disposition: `attachment; filename="${slug || 'customer'}-data-${day}.zip"`,
    });
  }
}
