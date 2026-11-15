import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';
import {
  HOME_TESTIMONIALS,
  type PublicTestimonial,
  type TestimonialInput,
  type WebsiteContent,
} from './website-rules.js';

const PUBLIC_FIELDS = {
  id: true,
  quote: true,
  name: true,
  role: true,
  company: true,
} as const;

/** Newest first; the id keeps the order fixed when two share a time. */
const NEWEST = [{ createdAt: 'desc' as const }, { id: 'asc' as const }];

/**
 * Website content: the testimonials and the live-project link that the
 * public website shows, managed by super admins and admins.
 */
@Injectable()
export class WebsiteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly audit: AuditService,
  ) {}

  /** What the public website shows (GET /website). */
  async publicContent(): Promise<WebsiteContent> {
    const [website, home, caseStudy] = await Promise.all([
      this.settings.getWebsite(),
      this.prisma.testimonial.findMany({
        where: { showOnHome: true },
        orderBy: NEWEST,
        take: HOME_TESTIMONIALS,
        select: PUBLIC_FIELDS,
      }),
      this.prisma.testimonial.findFirst({
        where: { showOnCaseStudy: true },
        orderBy: NEWEST,
        select: PUBLIC_FIELDS,
      }),
    ]);
    return {
      liveProjectUrl: website.liveProjectUrl,
      home: home satisfies PublicTestimonial[],
      caseStudy,
    };
  }

  /** The Website content screen: the link and every testimonial. */
  async teamView() {
    const [website, testimonials] = await Promise.all([
      this.settings.getWebsite(),
      this.prisma.testimonial.findMany({
        orderBy: NEWEST,
        select: {
          ...PUBLIC_FIELDS,
          showOnHome: true,
          showOnCaseStudy: true,
          createdAt: true,
          createdBy: { select: { name: true } },
        },
      }),
    ]);
    return {
      liveProjectUrl: website.liveProjectUrl,
      testimonials: testimonials.map(({ createdBy, ...testimonial }) => ({
        ...testimonial,
        addedBy: createdBy?.name ?? null,
      })),
    };
  }

  async saveLink(actorId: string, liveProjectUrl: string) {
    return this.settings.saveWebsite(actorId, { liveProjectUrl });
  }

  async add(actorId: string, input: TestimonialInput) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.testimonial.create({
        data: { ...input, createdById: actorId },
        select: { id: true },
      });
      await this.audit.record(
        {
          actorId,
          action: 'testimonial.added',
          entityType: 'testimonial',
          entityId: created.id,
          data: input,
        },
        tx,
      );
      return created;
    });
  }

  async update(actorId: string, id: string, input: TestimonialInput) {
    return this.prisma.$transaction(async (tx) => {
      const before = await tx.testimonial.findUnique({
        where: { id },
        select: {
          quote: true,
          name: true,
          role: true,
          company: true,
          showOnHome: true,
          showOnCaseStudy: true,
        },
      });
      if (!before) throw new NotFoundException();
      await tx.testimonial.update({ where: { id }, data: input });
      await this.audit.record(
        {
          actorId,
          action: 'testimonial.changed',
          entityType: 'testimonial',
          entityId: id,
          data: { from: before, to: input },
        },
        tx,
      );
      return { id };
    });
  }

  async remove(actorId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const before = await tx.testimonial.findUnique({
        where: { id },
        select: { quote: true, name: true, company: true },
      });
      if (!before) throw new NotFoundException();
      await tx.testimonial.delete({ where: { id } });
      await this.audit.record(
        {
          actorId,
          action: 'testimonial.removed',
          entityType: 'testimonial',
          entityId: id,
          data: before,
        },
        tx,
      );
      return { ok: true };
    });
  }
}
