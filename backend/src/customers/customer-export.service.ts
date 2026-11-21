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

const README = `Your data from FlyConnect Tech
===============================

These files hold what we keep about your account (UK GDPR, the right of
access):

- profile.csv   your company and contact details
- projects.csv  your projects
- requests.csv  your support requests
- messages.csv  the conversation on each request (your replies, our
                replies and the status lines)
- files/        the files on your requests, one folder per request

Our team's internal notes are not part of your data and are not included.
Questions: info@flyconnecttech.co.uk
`;

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
          select: {
            code: true,
            name: true,
            type: true,
            status: true,
            createdAt: true,
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
        ['Code', 'Name', 'Type', 'Status', 'Added'],
        customer.projects.map((p) => [
          p.code,
          p.name,
          p.type,
          p.status,
          ukStamp(p.createdAt),
        ]),
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
