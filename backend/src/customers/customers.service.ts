import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvitationsService } from '../accounts/invitations.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { SignedIn } from '../auth/signed-in.js';
import { nextCode } from '../codes/readable-codes.js';
import type {
  LeadType,
  Prisma,
  ProjectStatus,
  ProjectType,
} from '../generated/prisma/client.js';
import { findConvertible, linkConverted } from '../leads/lead-convert.js';
import { can } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OPEN_STATUSES } from '../requests/status-rules.js';
import { pageWindow, type Paging } from '../common/paging.js';
import { progressOf } from '../projects/project-rules.js';
import type { NewCustomerProject } from '../accounts/invitations.service.js';

const TX = { isolationLevel: 'ReadCommitted' } as const;

/** The customers list shows the newest this many that match. */

export type NewCustomer = {
  name: string;
  email: string;
  company: string;
  phone?: string;
  projects: NewCustomerProject[];
  /** Converting a website lead: its code (docs/01 §6, screen 42). */
  from?: string;
  /** The answer to "This email belonged to an account that was deleted". */
  previous?: 'restore' | 'fresh';
};

/**
 * Customers and their projects (docs/01, section 5 "Customers", screens 26
 * to 28). Super admins and admins add and change; managers only look
 * (customers.view / customers.manage in policies.ts, checked by the
 * controller). A customer's status is its contact person's.
 */
@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitations: InvitationsService,
    private readonly audit: AuditService,
  ) {}

  async list(
    actor: SignedIn,
    query: string | undefined,
    paging: Paging = { page: 1, pageSize: 25 },
  ) {
    const search = query?.trim();
    // Deleted customers are history only: never in the list or the counts.
    // The database compares text without caring about capitals.
    const where: Prisma.CustomerWhereInput = search
      ? {
          deletedAt: null,
          OR: [
            { company: { contains: search } },
            { contactUser: { is: { name: { contains: search } } } },
            { contactUser: { is: { email: { contains: search } } } },
            { projects: { some: { name: { contains: search } } } },
          ],
        }
      : { deletedAt: null };

    const total = await this.prisma.customer.count({ where });
    const window = pageWindow(paging, total);
    const [customers, projects, invited, found] = await Promise.all([
      this.prisma.customer.count({ where: { deletedAt: null } }),
      this.prisma.project.count({
        where: { deletedAt: null, customer: { deletedAt: null } },
      }),
      this.prisma.user.count({
        where: { role: 'CUSTOMER', status: 'INVITED' },
      }),
      this.prisma.customer.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: window.skip,
        take: window.take,
        select: {
          id: true,
          company: true,
          contactUser: { select: { name: true, email: true, status: true } },
          projects: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'asc' },
            select: { name: true },
          },
        },
      }),
    ]);
    const open = await this.prisma.supportRequest.groupBy({
      by: ['customerId'],
      where: {
        customerId: { in: found.map((c) => c.id) },
        status: { in: [...OPEN_STATUSES] },
      },
      _count: { _all: true },
    });

    return {
      summary: { customers, projects, invited },
      canManage: can(actor, 'customers.manage'),
      total,
      page: window.page,
      pageSize: window.pageSize,
      rows: found.map((customer) => ({
        id: customer.id,
        company: customer.company,
        name: customer.contactUser?.name ?? '',
        email: customer.contactUser?.email ?? '',
        status: customer.contactUser?.status ?? 'INVITED',
        projects: customer.projects.map((project) => project.name),
        openRequests:
          open.find((row) => row.customerId === customer.id)?._count._all ?? 0,
      })),
    };
  }

  /**
   * Add customer: the customer, its contact and projects are saved
   * together, then the invitation email (which lists the projects) goes out.
   * If the email fails the customer stays, and the page offers Resend.
   */
  async create(actor: SignedIn, input: NewCustomer) {
    const lead = input.from
      ? await findConvertible(this.prisma, input.from)
      : null;
    if (lead && !can(actor, 'leads.convert')) {
      throw new ForbiddenException({ code: 'NOT_ALLOWED' });
    }
    const { customerId, emailSent } = await this.invitations.inviteUser(
      {
        name: input.name,
        email: input.email,
        role: 'CUSTOMER',
        company: input.company,
        phone: input.phone,
        projects: input.projects,
        previous: input.previous,
        sourceLead: lead ? { type: lead.type, id: lead.id } : undefined,
        // The lead is linked in the same save: "Came from" on the customer,
        // "Now a customer" on the lead.
        onCustomer: lead
          ? async (tx, newCustomerId, email) => {
              await linkConverted(tx, lead, newCustomerId, actor, email);
              await this.audit.record(
                {
                  actorId: actor.id,
                  action: 'lead.converted',
                  entityType: 'lead',
                  entityId: lead.id,
                  data: { code: lead.code, customerId: newCustomerId },
                },
                tx,
              );
            }
          : undefined,
      },
      actor.id,
    );
    return { id: customerId!, emailSent };
  }

  async detail(actor: SignedIn, id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        company: true,
        country: true,
        createdAt: true,
        sourceLeadType: true,
        deletedAt: true,
        sourceLeadId: true,
        createdBy: { select: { name: true } },
        contactUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true,
            status: true,
            invitedAt: true,
            activatedAt: true,
            lastActiveAt: true,
          },
        },
        projects: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            status: true,
            items: { select: { status: true } },
          },
        },
      },
    });
    if (!customer?.contactUser || customer.deletedAt) {
      throw new NotFoundException();
    }

    const [open, requests, cameFrom] = await Promise.all([
      this.prisma.supportRequest.groupBy({
        by: ['projectId'],
        where: { customerId: id, status: { in: [...OPEN_STATUSES] } },
        _count: { _all: true },
      }),
      this.prisma.supportRequest.findMany({
        where: { customerId: id },
        orderBy: [{ createdAt: 'desc' }, { code: 'desc' }],
        select: {
          code: true,
          title: true,
          status: true,
          project: { select: { name: true } },
          assignee: { select: { name: true } },
        },
      }),
      this.leadCode(customer.sourceLeadType, customer.sourceLeadId),
    ]);

    const { contactUser: contact } = customer;
    return {
      id: customer.id,
      company: customer.company,
      createdAt: customer.createdAt,
      addedBy: customer.createdBy?.name ?? null,
      cameFrom,
      contact: {
        ...contact,
        country: contact.country ?? customer.country,
      },
      projects: customer.projects.map(({ items, ...project }) => ({
        ...project,
        progress: progressOf(items),
        openRequests:
          open.find((row) => row.projectId === project.id)?._count._all ?? 0,
      })),
      requests,
      canManage: can(actor, 'customers.manage'),
      canDelete: can(actor, 'customers.delete'),
    };
  }

  /** Add project: it starts as Planning. */
  async addProject(
    actor: SignedIn,
    customerId: string,
    input: { name: string; type: ProjectType },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId, deletedAt: null },
        select: { id: true },
      });
      if (!customer) throw new NotFoundException();
      const project = await tx.project.create({
        data: {
          code: await nextCode(tx, 'project'),
          name: input.name.trim(),
          type: input.type,
          customerId,
        },
        select: { id: true, code: true, name: true },
      });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'project.added',
          entityType: 'project',
          entityId: project.id,
          data: { code: project.code, customerId },
        },
        tx,
      );
      return project;
    }, TX);
  }

  /** Edit a project's name and type (customers.manage). */
  async updateProject(
    actor: SignedIn,
    customerId: string,
    projectId: string,
    input: { name: string; type: ProjectType },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: {
          id: projectId,
          customerId,
          deletedAt: null,
          customer: { deletedAt: null },
        },
        select: { id: true, code: true, name: true, type: true },
      });
      if (!project) throw new NotFoundException();
      const name = input.name.trim();
      if (project.name === name && project.type === input.type) {
        return { code: project.code };
      }
      await tx.project.update({
        where: { id: project.id },
        data: { name, type: input.type },
      });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'project.updated',
          entityType: 'project',
          entityId: project.id,
          data: {
            code: project.code,
            from: { name: project.name, type: project.type },
            to: { name, type: input.type },
          },
        },
        tx,
      );
      return { code: project.code };
    }, TX);
  }

  /**
   * Edit the customer's company name (customers.manage). The country shown
   * is the contact's own, from their profile.
   */
  async updateDetails(
    actor: SignedIn,
    customerId: string,
    input: { company: string },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId, deletedAt: null },
        select: { id: true, company: true },
      });
      if (!customer) throw new NotFoundException();
      const company = input.company.trim();
      if (customer.company === company) {
        return { ok: true };
      }
      await tx.customer.update({
        where: { id: customer.id },
        data: { company },
      });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'customer.updated',
          entityType: 'customer',
          entityId: customer.id,
          data: {
            from: { company: customer.company },
            to: { company },
          },
        },
        tx,
      );
      return { ok: true };
    }, TX);
  }

  async setProjectStatus(
    actor: SignedIn,
    customerId: string,
    projectId: string,
    status: ProjectStatus,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: {
          id: projectId,
          customerId,
          deletedAt: null,
          customer: { deletedAt: null },
        },
        select: { id: true, code: true, status: true },
      });
      if (!project) throw new NotFoundException();
      if (project.status === status) return { code: project.code, status };
      await tx.project.update({ where: { id: project.id }, data: { status } });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'project.statusChanged',
          entityType: 'project',
          entityId: project.id,
          data: { code: project.code, from: project.status, to: status },
        },
        tx,
      );
      return { code: project.code, status };
    }, TX);
  }

  /** "Came from": the website lead this customer was converted from. */
  private async leadCode(
    type: LeadType | null,
    id: string | null,
  ): Promise<{ type: LeadType; code: string } | null> {
    if (!type || !id) return null;
    const where = { where: { id }, select: { code: true } };
    const lead =
      type === 'DEMO'
        ? await this.prisma.demoRequest.findUnique(where)
        : type === 'QUOTE'
          ? await this.prisma.quoteRequest.findUnique(where)
          : await this.prisma.contactMessage.findUnique(where);
    return lead ? { type, code: lead.code } : null;
  }
}
