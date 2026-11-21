// Sample data for checking the screens on your own computer: team members,
// customers with projects, support requests with conversations, website
// leads and notifications. NEVER for the live site: it stops unless the
// database is on this computer (localhost / 127.0.0.1).
//
//   npm run db:sample            add it (once; a second run says it's there)
//   npm run db:sample -- --for demo.customer@example.com
//                                 sample projects and requests for a real
//                                 customer account (projects "… (sample)")
//   npm run db:sample -- --remove   take it all out again (both kinds)
//
// Every sample email ends in @sample.flyconnecttech.test, so it is easy to
// tell apart and to remove. One sample customer can sign in to the client
// portal (the email and password are printed at the end).
import 'dotenv/config';
import { hashPassword } from 'better-auth/crypto';

import { loginKeyFor } from '../src/accounts/login-key.js';
import { nextCode } from '../src/codes/readable-codes.js';
import type {
  ModuleStage,
  Budget,
  DemoTopic,
  MessageTopic,
  Priority,
  ProjectStatus,
  ProjectType,
  QuoteProjectType,
  RequestStatus,
  RequestType,
  Role,
  Timeline,
} from '../src/generated/prisma/client.js';
import { createPrismaClient } from '../src/prisma/connection.js';

const DOMAIN = 'sample.flyconnecttech.test';
const PORTAL_EMAIL = `sarah.mitchell@${DOMAIN}`;
const PORTAL_PASSWORD = 'Sample-Portal-2026';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set (backend/.env).');
const host = new URL(databaseUrl).hostname;
if (
  process.env.NODE_ENV === 'production' ||
  !['localhost', '127.0.0.1', '::1'].includes(host)
) {
  console.error(
    `Stopped: sample data is only for a database on this computer (this one is on "${host}").`,
  );
  process.exit(1);
}

const prisma = createPrismaClient(databaseUrl);
const remove = process.argv.includes('--remove');
// --for someone@example.com: sample projects and requests for that customer.
const forIndex = process.argv.indexOf('--for');
const forEmail = forIndex > -1 ? process.argv[forIndex + 1] : undefined;
const SAMPLE_MARK = ' (sample)';

// ---------------------------------------------------------------- helpers

/** A repeatable "random" so every run makes the same data. */
let seed = 7;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const pick = <T>(list: readonly T[]): T =>
  list[Math.floor(rand() * list.length)];
const between = (low: number, high: number) =>
  low + Math.floor(rand() * (high - low + 1));
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(Date.now() - ms);
const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z]+/g, '.')
    .replace(/^\.|\.$/g, '');
const emailFor = (name: string) => `${slug(name)}@${DOMAIN}`;

const FIRST = [
  'Sarah',
  'James',
  'Amira',
  'Oliver',
  'Priya',
  'Daniel',
  'Chloe',
  'Hassan',
  'Emily',
  'Lucas',
  'Fatima',
  'George',
  'Hannah',
  'Mohammed',
  'Sophie',
  'Thomas',
  'Aisha',
  'William',
  'Grace',
  'Ethan',
  'Zara',
  'Henry',
  'Isla',
  'Omar',
  'Ruby',
  'Jack',
  'Leila',
  'Noah',
  'Maya',
  'Adam',
];
const LAST = [
  'Mitchell',
  'Carter',
  'Khan',
  'Bennett',
  'Shah',
  'Walker',
  'Evans',
  'Ali',
  'Hughes',
  'Turner',
  'Ahmed',
  'Wright',
  'Patel',
  'Clarke',
  'Hussain',
  'Morgan',
  'Rahman',
  'Cooper',
  'Begum',
  'Price',
];
const COMPANIES = [
  'Bluewave Holidays',
  'Skyline Travel',
  'Horizon Escapes',
  'Atlas Tours',
  'Sunway Journeys',
  'Northern Lights Travel',
  'Coral Bay Trips',
  'Silverline Flights',
  'Globetrotter Co',
  'Harbour Holidays',
  'Summit Adventures',
  'Crescent Travel',
  'Meridian Voyages',
  'Evergreen Getaways',
  'Compass Travel Group',
  'Pinnacle Tours',
  'Oasis Holidays',
  'Voyager Direct',
  'Lakeside Breaks',
  'Starlight Travel',
  'Kingfisher Tours',
  'Amber Coast Travel',
  'Wanderlust Ltd',
  'Riverside Journeys',
  'Falcon Air Travel',
  'Seaview Holidays',
  'Trailblazer Trips',
  'Golden Gate Travel',
  'Moonrise Tours',
  'Cityhop Travel',
];
const COUNTRIES = [
  'United Kingdom',
  'United Kingdom',
  'United Kingdom',
  'Ireland',
  'United Arab Emirates',
  'Pakistan',
  'Spain',
  'Germany',
];
const PROJECT_NAMES: [string, ProjectType][] = [
  ['booking website', 'TRAVEL_BOOKING_PLATFORM'],
  ['agent portal', 'AGENT_PORTAL'],
  ['company website', 'WEBSITE'],
  ['Amadeus integration', 'API_INTEGRATION'],
  ['admin dashboard', 'WEB_APPLICATION'],
  ['mobile redesign', 'UI_UX_DESIGN'],
  ['support plan', 'MAINTENANCE_PLAN'],
  ['back office system', 'CUSTOM_SOFTWARE'],
];
/** A sample project's modules and items, and the updates on it. */
const SAMPLE_MODULES: { name: string; items: string[] }[] = [
  { name: 'Design', items: ['Discovery and plan', 'Designs'] },
  { name: 'Flight booking', items: ['Flight search', 'Fare rules', 'Seats'] },
  { name: 'Payments', items: ['Stripe payments', 'Confirmation emails'] },
  { name: 'Launch', items: ['Testing', 'Go live'] },
];
const SAMPLE_UPDATES = [
  'Designs are signed off. We start building the search pages this week.',
  'Flight search is ready to try on the test site. Next up: payments.',
];

/** The stages each module has passed, by the project's status. */
const PATHS: Record<ProjectStatus, ModuleStage[][]> = {
  PLANNING: [
    ['NOT_STARTED'],
    ['NOT_STARTED'],
    ['NOT_STARTED'],
    ['NOT_STARTED'],
  ],
  IN_DESIGN: [
    ['NOT_STARTED', 'DESIGN'],
    ['NOT_STARTED'],
    ['NOT_STARTED'],
    ['NOT_STARTED'],
  ],
  // One module waits for the client's review; one is on its second round.
  IN_DEVELOPMENT: [
    ['NOT_STARTED', 'DESIGN', 'CLIENT_REVIEW', 'DONE'],
    ['NOT_STARTED', 'DEVELOPMENT', 'TESTING', 'CLIENT_REVIEW'],
    [
      'NOT_STARTED',
      'DEVELOPMENT',
      'TESTING',
      'CLIENT_REVIEW',
      'CHANGES_REQUESTED',
      'DEVELOPMENT',
    ],
    ['NOT_STARTED'],
  ],
  LIVE: SAMPLE_MODULES.map(() => [
    'NOT_STARTED',
    'DEVELOPMENT',
    'TESTING',
    'CLIENT_REVIEW',
    'DONE',
  ]),
  COMPLETED: SAMPLE_MODULES.map(() => [
    'NOT_STARTED',
    'DEVELOPMENT',
    'TESTING',
    'CLIENT_REVIEW',
    'DONE',
  ]),
};

/**
 * Modules at stages that fit the project's status (with their timeline),
 * their items, a developer on the team and one or two updates, so the
 * project pages and My Projects have something to show.
 */
async function addProgress(
  projectId: string,
  status: ProjectStatus,
  authorId: string,
  contactId: string,
) {
  const day = 24 * 60 * 60 * 1000;
  for (const [index, sample] of SAMPLE_MODULES.entries()) {
    const path = PATHS[status][index];
    const stage = path[path.length - 1];
    const round = path.includes('CHANGES_REQUESTED') ? 2 : 1;
    const started = Date.now() - 30 * day + index * 5 * day;
    const module = await prisma.projectModule.create({
      data: {
        projectId,
        name: sample.name,
        position: index,
        stage,
        round,
        doneAt: stage === 'DONE' ? new Date() : null,
        targetDate: new Date(
          new Date(started + 21 * day).toISOString().slice(0, 10),
        ),
      },
    });
    let lineRound = 1;
    for (const [step, to] of path.entries()) {
      if (to === 'CHANGES_REQUESTED') lineRound = 2;
      await prisma.moduleStageChange.create({
        data: {
          moduleId: module.id,
          from: step === 0 ? null : path[step - 1],
          to,
          round: lineRound,
          note:
            to === 'CHANGES_REQUESTED'
              ? 'Please show the card fee before the Pay button.'
              : null,
          byId: step === 0 ? null : authorId,
          createdAt: new Date(started + step * 2 * day),
        },
      });
    }
    await prisma.projectItem.createMany({
      data: sample.items.map((title, position) => {
        const done =
          stage === 'DONE' || (stage !== 'NOT_STARTED' && position === 0);
        return {
          projectId,
          moduleId: module.id,
          title,
          position,
          status: done
            ? 'DONE'
            : stage === 'NOT_STARTED'
              ? 'TODO'
              : 'IN_PROGRESS',
          doneAt: done ? new Date() : null,
        } as const;
      }),
    });
  }
  await prisma.project.update({
    where: { id: projectId },
    data: {
      description: 'Online booking for flights and hotels, with payments.',
      builtWith: 'Next.js, Amadeus, Stripe',
      leadId: authorId,
      members: { create: { userId: authorId } },
    },
  });
  if (status !== 'PLANNING') {
    await prisma.projectUpdate.createMany({
      data: SAMPLE_UPDATES.slice(0, status === 'IN_DESIGN' ? 1 : 2).map(
        (body) => ({ projectId, body, authorId }),
      ),
    });
    await addDiscussions(projectId, authorId, contactId);
  }
}

/**
 * Two discussions: a customer topic with a reply, an approved proposal
 * and the answer marked; and a team topic that asks the developer.
 */
async function addDiscussions(
  projectId: string,
  developerId: string,
  contactId: string,
) {
  const topic = await prisma.projectTopic.create({
    data: {
      projectId,
      number: 1,
      kind: 'CUSTOMER',
      title: 'Checkout on one page?',
      authorId: contactId,
      posts: {
        create: [
          {
            authorId: contactId,
            body: 'Could the passenger details and payment sit on one page? Our agents find two steps slow.',
          },
          {
            authorId: developerId,
            body: 'Yes. Details above, payment below, with the total always in view.',
          },
          {
            authorId: developerId,
            kind: 'PROPOSAL',
            body: 'We propose a one-page checkout, live in the next release.',
            proposalState: 'APPROVED',
            decidedById: contactId,
            decidedAt: new Date(),
          },
          {
            authorId: null,
            kind: 'SYSTEM',
            body: 'The customer approved the proposal',
          },
        ],
      },
    },
    select: { id: true, posts: { select: { id: true, authorId: true } } },
  });
  const reply = topic.posts.find((post) => post.authorId === developerId);
  if (reply) {
    await prisma.projectTopic.update({
      where: { id: topic.id },
      data: { answerPostId: reply.id },
    });
  }
  await prisma.projectTopic.create({
    data: {
      projectId,
      number: 2,
      kind: 'INTERNAL',
      title: 'Card fee wording',
      authorId: developerId,
      posts: {
        create: [
          {
            authorId: developerId,
            body: 'Do we show the card fee before or after the passenger step?',
          },
        ],
      },
      asks: { create: { userId: developerId, askedById: developerId } },
    },
  });
}

const PROJECT_STATUSES: ProjectStatus[] = [
  'LIVE',
  'LIVE',
  'LIVE',
  'IN_DEVELOPMENT',
  'IN_DESIGN',
  'PLANNING',
  'COMPLETED',
];
const REQUESTS: [string, RequestType, string][] = [
  [
    'Prices show in the wrong currency',
    'BUG_REPORT',
    'On the search results page some prices show in euros instead of pounds.',
  ],
  [
    'Checkout page is slow on mobile',
    'TECHNICAL_ISSUE',
    'Customers say the checkout takes more than 10 seconds to load on phones.',
  ],
  [
    'Add a promo code field to checkout',
    'FEATURE_REQUEST',
    'We want customers to enter a promo code before they pay.',
  ],
  [
    'Amadeus search returns no results',
    'INTEGRATION_PROBLEM',
    'Since this morning flight searches to Dubai return nothing.',
  ],
  [
    'Change the homepage banner',
    'DESIGN_MODIFICATION',
    'Please replace the summer banner with the new winter campaign image.',
  ],
  [
    'How do I export bookings?',
    'GENERAL_INQUIRY',
    'Is there a way to download last month’s bookings as a spreadsheet?',
  ],
  [
    'Renew the SSL certificate',
    'MAINTENANCE_REQUEST',
    'The browser warns that the certificate expires next week.',
  ],
  [
    'Hotel images not loading',
    'BUG_REPORT',
    'Hotel photos show a broken image icon on the details page.',
  ],
  [
    'Agent commission report totals are wrong',
    'BUG_REPORT',
    'The commission report shows totals about 8% higher than the bookings.',
  ],
  [
    'Add Arabic language option',
    'FEATURE_REQUEST',
    'Many of our customers would like the site in Arabic.',
  ],
  [
    'Payment confirmation email not sent',
    'TECHNICAL_ISSUE',
    'Some customers did not get the confirmation email after paying.',
  ],
  [
    'Update the footer contact details',
    'DESIGN_MODIFICATION',
    'Our phone number and office address have changed.',
  ],
  [
    'Sabre fares missing taxes',
    'INTEGRATION_PROBLEM',
    'Fares from Sabre show without airport taxes on the summary page.',
  ],
  [
    'Login page shows an error',
    'TECHNICAL_ISSUE',
    'Agents get “Something went wrong” when they sign in on Safari.',
  ],
  [
    'Monthly server updates',
    'MAINTENANCE_REQUEST',
    'Please run this month’s updates out of office hours.',
  ],
];
const STATUSES: RequestStatus[] = [
  'SUBMITTED',
  'SUBMITTED',
  'UNDER_REVIEW',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'IN_PROGRESS',
  'IN_PROGRESS',
  'WAITING_FOR_CUSTOMER',
  'RESOLVED',
  'RESOLVED',
  'CLOSED',
  'CLOSED',
];
const PRIORITIES: Priority[] = [
  'LOW',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'HIGH',
  'HIGH',
  'URGENT',
];
const TARGET_HOURS: Record<Priority, number> = {
  URGENT: 4,
  HIGH: 8,
  MEDIUM: 24,
  LOW: 72,
};
const PAGES = [
  'Home',
  'Travel Technology',
  'Services',
  'Contact & Quote',
  'Case Studies',
  'Products & Solutions',
];

// ---------------------------------------------------------------- remove

/** Projects named "… (sample)" on real customers, with their requests. */
async function removeFromCustomers() {
  const projects = await prisma.project.findMany({
    where: { name: { endsWith: SAMPLE_MARK } },
    select: { id: true },
  });
  const ids = projects.map((p) => p.id);
  const requests = await prisma.supportRequest.findMany({
    where: { projectId: { in: ids } },
    select: { id: true, code: true },
  });
  const hrefs = requests.flatMap((r) => [
    `/team/requests/${r.code}`,
    `/portal/requests/${r.code}`,
  ]);
  await prisma.$transaction(async (tx) => {
    await tx.notification.deleteMany({ where: { href: { in: hrefs } } });
    await tx.supportRequest.deleteMany({
      where: { id: { in: requests.map((r) => r.id) } },
    });
    await tx.project.deleteMany({ where: { id: { in: ids } } });
  });
  if (ids.length) {
    console.log(
      `Removed from real customers: ${ids.length} sample projects, ${requests.length} requests.`,
    );
  }
}

/**
 * Sample projects and requests for a real customer account (by email), so
 * that person's client portal has something to show. The projects are
 * named "… (sample)" and leave with --remove.
 */
async function addForCustomer(email: string) {
  const contact = await prisma.user.findFirst({
    where: { email: email.trim().toLowerCase(), side: 'CUSTOMER' },
    select: {
      id: true,
      customerId: true,
      customer: { select: { company: true } },
    },
  });
  if (!contact?.customerId) {
    console.error(`No customer account with the email ${email}.`);
    process.exit(1);
  }
  const developers = await prisma.user.findMany({
    where: { side: 'TEAM', role: 'DEVELOPER', status: 'ACTIVE' },
    select: { id: true, name: true },
    take: 4,
  });
  if (developers.length === 0) {
    console.error(
      'Run npm run db:sample first: it adds the sample developers.',
    );
    process.exit(1);
  }
  const short = contact.customer?.company.split(' ')[0] ?? 'Demo';
  const plan: [string, ProjectType, ProjectStatus][] = [
    [`${short} booking website`, 'TRAVEL_BOOKING_PLATFORM', 'LIVE'],
    [`${short} agent portal`, 'AGENT_PORTAL', 'IN_DEVELOPMENT'],
    [`${short} company website`, 'WEBSITE', 'LIVE'],
  ];
  const codes: string[] = [];
  for (const [index, [name, type, status]] of plan.entries()) {
    const project = await prisma.$transaction(async (tx) =>
      tx.project.create({
        data: {
          code: await nextCode(tx, 'project'),
          name: `${name}${SAMPLE_MARK}`,
          type,
          status,
          customerId: contact.customerId!,
        },
      }),
    );
    await addProgress(project.id, status, developers[0].id, contact.id);
    const where = {
      id: project.id,
      customerId: contact.customerId!,
      contactId: contact.id,
    };
    for (let r = 0; r < 6; r += 1) {
      codes.push(await addRequest(where, developers, index === 0 && r < 3));
    }
  }
  await prisma.notification.createMany({
    data: codes.slice(0, 10).map((code, i) => ({
      userId: contact.id,
      kind: (['reply', 'status', 'ok', 'info'] as const)[i % 4],
      text:
        i % 2
          ? `${developers[0].name} replied to ${code}`
          : `${code} is now In Progress`,
      href: `/portal/requests/${code}`,
      readAt: i > 3 ? ago(i * HOUR) : null,
      createdAt: ago(i * 5 * HOUR),
    })),
  });
  console.log(
    `Added to ${email}: ${plan.length} sample projects, ${codes.length} requests, 10 notifications.`,
  );
}

async function removeAll() {
  await removeFromCustomers();
  const users = await prisma.user.findMany({
    where: { email: { endsWith: `@${DOMAIN}` } },
    select: { id: true, customerId: true },
  });
  const userIds = users.map((u) => u.id);
  const customerIds = users.flatMap((u) =>
    u.customerId ? [u.customerId] : [],
  );
  const requests = await prisma.supportRequest.findMany({
    where: { customerId: { in: customerIds } },
    select: { id: true, code: true },
  });
  const hrefs = requests.flatMap((r) => [
    `/team/requests/${r.code}`,
    `/portal/requests/${r.code}`,
  ]);
  const leads = { email: { endsWith: `@${DOMAIN}` } };
  const [demos, quotes, messages] = await Promise.all([
    prisma.demoRequest.findMany({
      where: leads,
      select: { id: true, code: true },
    }),
    prisma.quoteRequest.findMany({
      where: leads,
      select: { id: true, code: true },
    }),
    prisma.contactMessage.findMany({
      where: leads,
      select: { id: true, code: true },
    }),
  ]);
  const leadIds = [...demos, ...quotes, ...messages].map((l) => l.id);
  const leadCodes = [...demos, ...quotes, ...messages].map((l) => l.code);

  await prisma.$transaction(async (tx) => {
    await tx.notification.deleteMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          { href: { in: hrefs } },
          ...leadCodes.map((code) => ({ href: { endsWith: code } })),
        ],
      },
    });
    await tx.leadActivity.deleteMany({ where: { leadId: { in: leadIds } } });
    await tx.demoRequest.deleteMany({
      where: { id: { in: demos.map((d) => d.id) } },
    });
    await tx.quoteRequest.deleteMany({
      where: { id: { in: quotes.map((q) => q.id) } },
    });
    await tx.contactMessage.deleteMany({
      where: { id: { in: messages.map((m) => m.id) } },
    });
    await tx.testimonial.deleteMany({
      where: { company: { endsWith: '(sample)' } },
    });
    await tx.supportRequest.deleteMany({
      where: { id: { in: requests.map((r) => r.id) } },
    });
    await tx.project.deleteMany({ where: { customerId: { in: customerIds } } });
    await tx.estimate.deleteMany({ where: { sentById: { in: userIds } } });
    await tx.user.deleteMany({ where: { id: { in: userIds } } });
    await tx.customer.deleteMany({ where: { id: { in: customerIds } } });
  });
  console.log(
    `Removed: ${users.length} people, ${customerIds.length} customers, ${requests.length} requests, ${leadIds.length} leads.`,
  );
}

// ---------------------------------------------------------------- add

/** One request with its conversation and status history. Returns its code. */
async function addRequest(
  project: { id: string; customerId: string; contactId: string },
  developers: { id: string; name: string }[],
  forceActive: boolean,
): Promise<string> {
  const [title, type, description] = pick(REQUESTS);
  const status = forceActive
    ? pick(['IN_PROGRESS', 'WAITING_FOR_CUSTOMER'] as const)
    : pick(STATUSES);
  const priority = pick(PRIORITIES);
  const createdAt = ago(between(1, 60 * 24) * HOUR);
  const assigned = status !== 'SUBMITTED';
  const assignee = assigned ? pick(developers) : null;
  const replied = !['SUBMITTED', 'UNDER_REVIEW'].includes(status);
  const firstResponseAt = replied
    ? new Date(createdAt.getTime() + between(1, 20) * HOUR)
    : null;
  const resolvedAt = ['RESOLVED', 'CLOSED'].includes(status)
    ? new Date(createdAt.getTime() + between(6, 120) * HOUR)
    : null;
  const closedAt =
    status === 'CLOSED' && resolvedAt
      ? new Date(resolvedAt.getTime() + 2 * DAY)
      : null;

  const request = await prisma.$transaction(async (tx) => {
    const code = await nextCode(tx, 'request', createdAt);
    return tx.supportRequest.create({
      data: {
        code,
        title,
        description,
        type,
        priority,
        status,
        projectId: project.id,
        customerId: project.customerId,
        assigneeId: assignee?.id ?? null,
        dueAt: new Date(createdAt.getTime() + TARGET_HOURS[priority] * HOUR),
        slaPausedAt:
          status === 'WAITING_FOR_CUSTOMER' ? ago(between(1, 30) * HOUR) : null,
        firstResponseAt,
        resolvedAt,
        closedAt,
        createdAt,
      },
    });
  });

  const at = (hours: number) => new Date(createdAt.getTime() + hours * HOUR);
  const lines: {
    kind: 'CUSTOMER_REPLY' | 'STAFF_REPLY' | 'INTERNAL_NOTE' | 'SYSTEM';
    authorId: string | null;
    body: string;
    createdAt: Date;
  }[] = [];
  const history: {
    from: RequestStatus | null;
    to: RequestStatus;
    byId: string | null;
    createdAt: Date;
  }[] = [{ from: null, to: 'SUBMITTED', byId: project.contactId, createdAt }];
  if (assignee) {
    lines.push({
      kind: 'SYSTEM',
      authorId: null,
      body: `Assigned to ${assignee.name} by Nadia Rahman`,
      createdAt: at(1),
    });
    history.push({
      from: 'SUBMITTED',
      to: 'UNDER_REVIEW',
      byId: null,
      createdAt: at(1),
    });
  }
  if (replied && assignee) {
    lines.push({
      kind: 'STAFF_REPLY',
      authorId: assignee.id,
      body: 'Thanks for the details. I can see the problem and I’m looking into it now.',
      createdAt: firstResponseAt ?? at(2),
    });
    lines.push({
      kind: 'INTERNAL_NOTE',
      authorId: assignee.id,
      body: 'Looks related to last week’s release. Checking the logs.',
      createdAt: at(3),
    });
    lines.push({
      kind: 'CUSTOMER_REPLY',
      authorId: project.contactId,
      body: 'Great, thank you. Let me know if you need anything from us.',
      createdAt: at(4),
    });
    history.push({
      from: 'UNDER_REVIEW',
      to: 'IN_PROGRESS',
      byId: assignee.id,
      createdAt: at(3),
    });
  }
  if (status === 'WAITING_FOR_CUSTOMER' && assignee) {
    lines.push({
      kind: 'STAFF_REPLY',
      authorId: assignee.id,
      body: 'Could you send a screenshot of the page where this happens?',
      createdAt: at(6),
    });
    history.push({
      from: 'IN_PROGRESS',
      to: 'WAITING_FOR_CUSTOMER',
      byId: assignee.id,
      createdAt: at(6),
    });
  }
  if (resolvedAt && assignee) {
    lines.push({
      kind: 'STAFF_REPLY',
      authorId: assignee.id,
      body: 'This is fixed now and live on the site. Please check and confirm.',
      createdAt: resolvedAt,
    });
    history.push({
      from: 'IN_PROGRESS',
      to: 'RESOLVED',
      byId: assignee.id,
      createdAt: resolvedAt,
    });
  }
  if (closedAt) {
    lines.push({
      kind: 'SYSTEM',
      authorId: null,
      body: 'Closed automatically 7 days after it was resolved',
      createdAt: closedAt,
    });
    history.push({
      from: 'RESOLVED',
      to: 'CLOSED',
      byId: null,
      createdAt: closedAt,
    });
  }
  await prisma.requestMessage.createMany({
    data: lines.map((line) => ({ ...line, requestId: request.id })),
  });
  await prisma.requestStatusChange.createMany({
    data: history.map((h) => ({ ...h, requestId: request.id })),
  });
  return request.code;
}

async function addAll() {
  const already = await prisma.user.count({
    where: { email: { endsWith: `@${DOMAIN}` } },
  });
  if (already) {
    console.log(
      'Sample data is already there. To start again: npm run db:sample -- --remove',
    );
    return;
  }

  // The real team (you): they get notifications and own some leads.
  const realTeam = await prisma.user.findMany({
    where: {
      side: 'TEAM',
      status: 'ACTIVE',
      role: { in: ['SUPER_ADMIN', 'ADMIN'] },
    },
    select: { id: true },
  });

  // 1. Team members.
  const team: { id: string; name: string; role: Role }[] = [];
  const teamPlan: [string, Role, string][] = [
    ['Laura Bennett', 'ADMIN', 'Operations lead'],
    ['Imran Qureshi', 'ADMIN', 'Account director'],
    ['Nadia Rahman', 'MANAGER', 'Support manager'],
    ['Chris Holloway', 'MANAGER', 'Delivery manager'],
    ['Ayesha Khan', 'DEVELOPER', 'Frontend developer'],
    ['Ben Foster', 'DEVELOPER', 'Backend developer'],
    ['Ravi Patel', 'DEVELOPER', 'Full-stack developer'],
    ['Ella Brooks', 'DEVELOPER', 'Integration developer'],
    ['Sam Taylor', 'DEVELOPER', 'Junior developer'],
  ];
  for (const [index, [name, role, jobTitle]] of teamPlan.entries()) {
    const email = emailFor(name);
    const invited = index === 8;
    const user = await prisma.user.create({
      data: {
        name,
        email,
        side: 'TEAM',
        loginEmail: loginKeyFor(email, 'TEAM'),
        role,
        jobTitle,
        status: invited ? 'INVITED' : 'ACTIVE',
        emailVerified: !invited,
        invitedAt: ago(between(20, 120) * DAY),
        activatedAt: invited ? null : ago(between(5, 19) * DAY),
        lastActiveAt: invited ? null : ago(between(1, 72) * HOUR),
        country: 'United Kingdom',
      },
    });
    team.push({ id: user.id, name, role });
  }
  const developers = team.filter((t) => t.role === 'DEVELOPER').slice(0, 4);
  const owners = [
    ...team.filter((t) => t.role !== 'DEVELOPER').map((t) => t.id),
    ...realTeam.map((t) => t.id),
  ];

  // 2. Customers, their contact and projects.
  const portalHash = await hashPassword(PORTAL_PASSWORD);
  const projects: {
    id: string;
    customerId: string;
    contactId: string;
    name: string;
  }[] = [];
  for (const [index, company] of COMPANIES.entries()) {
    const name = `${FIRST[index]} ${LAST[index % LAST.length]}`;
    const email =
      index === 0 ? PORTAL_EMAIL : emailFor(`${FIRST[index]} ${company}`);
    const invited = index % 7 === 5;
    const createdAt = ago(between(10, 200) * DAY);
    const customer = await prisma.customer.create({
      data: {
        company,
        country: pick(COUNTRIES),
        createdAt,
        createdById: pick(owners) ?? null,
      },
    });
    const contact = await prisma.user.create({
      data: {
        name,
        email,
        side: 'CUSTOMER',
        loginEmail: loginKeyFor(email, 'CUSTOMER'),
        role: 'CUSTOMER',
        status: invited ? 'INVITED' : 'ACTIVE',
        emailVerified: !invited,
        customerId: customer.id,
        phone: `+44 7700 9${String(100000 + index * 731).slice(0, 5)}`,
        country: customer.country,
        jobTitle: pick([
          'Managing director',
          'Operations manager',
          'Head of digital',
          'Founder',
          null,
        ]),
        invitedAt: createdAt,
        activatedAt: invited ? null : new Date(createdAt.getTime() + 2 * DAY),
        lastActiveAt: invited ? null : ago(between(1, 240) * HOUR),
        emailPrefs: {
          replies: true,
          statusChanges: true,
          weeklySummary: index % 2 === 0,
        },
        createdAt,
      },
    });
    if (index === 0) {
      await prisma.account.create({
        data: {
          userId: contact.id,
          accountId: contact.id,
          providerId: 'credential',
          password: portalHash,
        },
      });
    }
    const count = index === 0 ? 3 : between(1, 3);
    for (let p = 0; p < count; p += 1) {
      const [suffix, type] =
        PROJECT_NAMES[(index + p * 3) % PROJECT_NAMES.length];
      const project = await prisma.$transaction(async (tx) =>
        tx.project.create({
          data: {
            code: await nextCode(tx, 'project'),
            name: `${company.split(' ')[0]} ${suffix}`,
            type,
            status: pick(PROJECT_STATUSES),
            customerId: customer.id,
            createdAt,
          },
        }),
      );
      await addProgress(
        project.id,
        project.status,
        developers[0].id,
        contact.id,
      );
      projects.push({
        id: project.id,
        customerId: customer.id,
        contactId: contact.id,
        name: project.name,
      });
    }
  }

  // 3. Support requests, with a conversation and status history.
  let requestCount = 0;
  const sampleCodes: string[] = [];
  for (const [index, project] of projects.entries()) {
    const howMany =
      project.contactId === projects[0].contactId ? 6 : between(1, 4);
    for (let r = 0; r < howMany; r += 1) {
      sampleCodes.push(
        await addRequest(project, developers, index < 3 && r < 2),
      );
      requestCount += 1;
    }
  }

  // 4. Website leads: demos, quotes and messages.
  const leadPerson = (i: number) => {
    const name = `${FIRST[(i * 7) % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`;
    return { name, email: emailFor(`${name} lead ${i}`) };
  };
  const demoTopics: DemoTopic[] = [
    'TRAVEL_BOOKING_PLATFORM',
    'AGENT_ADMIN_DASHBOARDS',
    'CUSTOM_SOFTWARE_WEBSITES',
    'API_INTEGRATIONS',
  ];
  for (let i = 0; i < 24; i += 1) {
    const person = leadPerson(i);
    const createdAt = ago(between(1, 40 * 24) * HOUR);
    const status = pick([
      'NEW',
      'NEW',
      'SCHEDULED',
      'COMPLETED',
      'CANCELLED',
    ] as const);
    // Scheduled demos: a weekday slot at 13:00 or 14:00 UTC, all different.
    const slot = new Date(Date.now() + (3 + i) * DAY);
    slot.setUTCHours(13 + (i % 2), 0, 0, 0);
    const preferredStart =
      status === 'COMPLETED' ? ago(between(2, 20) * DAY) : slot;
    await prisma.$transaction(async (tx) => {
      const demo = await tx.demoRequest.create({
        data: {
          code: await nextCode(tx, 'demo', createdAt),
          status,
          topic: pick(demoTopics),
          preferredStart,
          scheduledStart:
            status === 'SCHEDULED' || status === 'COMPLETED'
              ? preferredStart
              : null,
          scheduledSlot: status === 'SCHEDULED' ? preferredStart : null,
          hostId: status === 'NEW' ? null : (pick(owners) ?? null),
          ownerId: status === 'NEW' && i % 2 ? null : (pick(owners) ?? null),
          name: person.name,
          email: person.email,
          company: pick(COMPANIES).replace(/ \w+$/, ' Group'),
          phone: i % 3 ? `+44 20 7946 0${String(100 + i).slice(-3)}` : null,
          notes:
            i % 2
              ? 'We run about 2,000 bookings a month and want an agent portal.'
              : null,
          sourcePage: pick(PAGES),
          cancelReason:
            status === 'CANCELLED'
              ? 'The visitor asked to move it to next quarter.'
              : null,
          createdAt,
        },
      });
      await tx.leadActivity.create({
        data: {
          leadType: 'DEMO',
          leadId: demo.id,
          kind: 'SYSTEM',
          body: `Demo requested from the ${demo.sourcePage} page`,
          createdAt,
        },
      });
    });
  }

  const quoteTypes: QuoteProjectType[] = [
    'TRAVEL_BOOKING_PLATFORM',
    'AMADEUS_SABRE_INTEGRATION',
    'NEW_WEBSITE',
    'WEBSITE_REDESIGN',
    'CUSTOM_SOFTWARE',
    'UI_UX_DESIGN',
    'API_INTEGRATION',
    'OTHER',
  ];
  const budgets: Budget[] = [
    'UNDER_5K',
    'FROM_5K_TO_15K',
    'FROM_15K_TO_50K',
    'OVER_50K',
    'NOT_SURE',
  ];
  const timelines: Timeline[] = [
    'ASAP',
    'WITHIN_1_3_MONTHS',
    'WITHIN_3_6_MONTHS',
    'NOT_SURE',
  ];
  const estimator = team.find((t) => t.role === 'ADMIN')!;
  for (let i = 0; i < 26; i += 1) {
    const person = leadPerson(i + 40);
    const createdAt = ago(between(1, 45 * 24) * HOUR);
    const status = pick([
      'NEW',
      'NEW',
      'REVIEWING',
      'ESTIMATE_SENT',
      'WON',
      'LOST',
    ] as const);
    await prisma.$transaction(async (tx) => {
      const quote = await tx.quoteRequest.create({
        data: {
          code: await nextCode(tx, 'quote', createdAt),
          status,
          projectType: pick(quoteTypes),
          budget: pick(budgets),
          timeline: pick(timelines),
          name: person.name,
          email: person.email,
          company: i % 4 ? pick(COMPANIES).replace(/ \w+$/, ' Ltd') : null,
          phone: i % 2 ? `+44 161 496 0${String(200 + i).slice(-3)}` : null,
          requirements:
            'We need a booking site with flights and hotels, Stripe payments and an agent area for our partners.',
          sourcePage: pick(PAGES),
          ownerId: status === 'NEW' ? null : (pick(owners) ?? null),
          lostReason:
            status === 'LOST' ? 'Went with another supplier on price.' : null,
          createdAt,
        },
      });
      if (['ESTIMATE_SENT', 'WON', 'LOST'].includes(status)) {
        await tx.estimate.create({
          data: {
            quoteRequestId: quote.id,
            amountCents: between(40, 600) * 10_000,
            deliveryTime: pick(['4 to 6 weeks', '8 to 10 weeks', '3 months']),
            validUntil: new Date(Date.now() + 30 * DAY),
            summary: 'Design, build and launch, with three months of support.',
            sentById: estimator.id,
            sentAt: new Date(createdAt.getTime() + 2 * DAY),
          },
        });
      }
      await tx.leadActivity.create({
        data: {
          leadType: 'QUOTE',
          leadId: quote.id,
          kind: 'SYSTEM',
          body: `Quote requested from the ${quote.sourcePage} page`,
          createdAt,
        },
      });
    });
  }

  const topics: MessageTopic[] = [
    'GENERAL_QUESTION',
    'PARTNERSHIP',
    'EXISTING_PROJECT',
    'SOMETHING_ELSE',
  ];
  for (let i = 0; i < 22; i += 1) {
    const person = leadPerson(i + 80);
    const createdAt = ago(between(1, 30 * 24) * HOUR);
    const status = pick(['NEW', 'NEW', 'REPLIED', 'CLOSED'] as const);
    await prisma.$transaction(async (tx) => {
      const message = await tx.contactMessage.create({
        data: {
          code: await nextCode(tx, 'message', createdAt),
          status,
          topic: pick(topics),
          name: person.name,
          email: person.email,
          message:
            'Hello, could you tell me more about your Amadeus integration and how long it usually takes?',
          sourcePage: pick(PAGES),
          ownerId: status === 'NEW' ? null : (pick(owners) ?? null),
          createdAt,
        },
      });
      await tx.leadActivity.create({
        data: {
          leadType: 'MESSAGE',
          leadId: message.id,
          kind: 'SYSTEM',
          body: `Message sent from the ${message.sourcePage} page`,
          createdAt,
        },
      });
    });
  }

  // 5. Notifications for you (the real super admins and admins) and the
  //    portal customer, some read and some not.
  const kinds = ['new', 'urgent', 'reply', 'review', 'lead'] as const;
  for (const person of realTeam) {
    await prisma.notification.createMany({
      data: sampleCodes.slice(0, 14).map((code, i) => ({
        userId: person.id,
        kind: kinds[i % kinds.length],
        text:
          i % kinds.length === 1
            ? `Urgent request ${code} from Bluewave Holidays`
            : `New support request ${code} · High`,
        href: `/team/requests/${code}`,
        readAt: i > 5 ? ago(i * HOUR) : null,
        createdAt: ago(i * 3 * HOUR),
      })),
    });
  }
  const portalUser = await prisma.user.findFirstOrThrow({
    where: { email: PORTAL_EMAIL, side: 'CUSTOMER' },
  });
  const portalCodes = (
    await prisma.supportRequest.findMany({
      where: { customerId: portalUser.customerId! },
      select: { code: true },
    })
  ).map((r) => r.code);
  await prisma.notification.createMany({
    data: portalCodes.map((code, i) => ({
      userId: portalUser.id,
      kind: (['reply', 'status', 'ok', 'info'] as const)[i % 4],
      text:
        i % 2 ? `Ayesha Khan replied to ${code}` : `${code} is now In Progress`,
      href: `/portal/requests/${code}`,
      readAt: i > 2 ? ago(i * HOUR) : null,
      createdAt: ago(i * 5 * HOUR),
    })),
  });

  // 6. Testimonials for the local website (marked "(sample)").
  await prisma.testimonial.createMany({
    data: [
      {
        quote:
          'Our booking site went live on time and sales were up 30% in the first quarter.',
        name: 'Sarah Mitchell',
        role: 'Managing director',
        company: 'Bluewave Holidays (sample)',
        showOnHome: true,
        showOnCaseStudy: true,
      },
      {
        quote:
          'The agent portal saved our team hours every week. Support replies the same day.',
        name: 'James Carter',
        role: 'Operations manager',
        company: 'Skyline Travel (sample)',
        showOnHome: true,
      },
      {
        quote:
          'They understood Amadeus from day one. The integration just works.',
        name: 'Amira Khan',
        role: 'Head of digital',
        company: 'Horizon Escapes (sample)',
        showOnHome: true,
      },
    ],
  });

  console.log(
    `Added: ${team.length} team members, ${COMPANIES.length} customers, ${projects.length} projects, ${requestCount} requests, 24 demos, 26 quotes, 22 messages.`,
  );
  console.log(
    `Client portal sign-in (local only): ${PORTAL_EMAIL} / ${PORTAL_PASSWORD}`,
  );
  console.log(
    'Sample team members cannot sign in. Remove everything with: npm run db:sample -- --remove',
  );
}

try {
  if (remove) await removeAll();
  else if (forEmail) await addForCustomer(forEmail);
  else await addAll();
} finally {
  await prisma.$disconnect();
}
