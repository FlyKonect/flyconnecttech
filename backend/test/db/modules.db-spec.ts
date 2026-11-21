import { startTestApp, type Person, type TestApp } from './support/test-app.js';

// Modules on a real database: who may add them and move their stages,
// the timeline, the project team, and the customer's client review
// (approve, or ask for changes and a new round), with its notices and
// emails.

let t: TestApp;
let superAdmin: Person;
let admin: Person;
let manager: Person;
let developer: Person;
let otherDeveloper: Person;
let customer: Person;
let otherCustomer: Person;

type Module = {
  id: string;
  name: string;
  stage: string;
  round: number;
  late: boolean;
  progress: { done: number; total: number; percent: number | null };
  items: { id: string; title: string; status: string }[];
  history: {
    from: string | null;
    to: string;
    round: number;
    note: string | null;
    by: string | null;
  }[];
};

/** A new project for Sarah's company, led by the admin. Returns its code. */
async function newProject(items = 'Flight search\nFare rules') {
  const response = await t
    .as(admin)
    .post('/team/projects', {
      customerId: customer.customerId,
      name: 'Bluewave booking website',
      type: 'TRAVEL_BOOKING_PLATFORM',
      items,
      leadId: admin.id,
    })
    .expect(201);
  return response.body.code as string;
}

const page = async (who: Person, code: string) =>
  (await t.as(who).get(`/team/projects/${code}`).expect(200)).body as {
    modules: Module[];
    modulesDone: number;
    members: { id: string }[];
    can: { manage: boolean; work: boolean; viewCustomer: boolean };
  };

const moduleOf = async (code: string, name: string) =>
  (await page(admin, code)).modules.find((m) => m.name === name)!;

const stage = (
  who: Person,
  code: string,
  id: string,
  to: string,
  note?: string,
) =>
  t
    .as(who)
    .post(`/team/projects/${code}/modules/${id}/stage`, { stage: to, note });

beforeAll(async () => {
  t = await startTestApp('@modules.test');
  superAdmin = await t.person('SUPER_ADMIN', 'Hamza Siddiqui');
  admin = await t.person('ADMIN', 'Emma Clarke');
  manager = await t.person('MANAGER', 'Sofia Martins');
  developer = await t.person('DEVELOPER', 'Priya Nair');
  otherDeveloper = await t.person('DEVELOPER', 'Daniyal Ahmed');
  customer = await t.person('CUSTOMER', 'Sarah Mitchell', 'Bluewave Holidays');
  otherCustomer = await t.person('CUSTOMER', 'Omar Khan', 'Skyline Travel');
});

afterAll(async () => {
  await t?.close();
});

describe('modules and the project team', () => {
  it('admins add, edit, move and remove modules; others may not', async () => {
    const code = await newProject();
    expect((await page(admin, code)).modules.map((m) => m.name)).toEqual([
      'General',
    ]);
    const added = await t
      .as(admin)
      .post(`/team/projects/${code}/modules`, {
        name: 'Payments',
        description: 'Cards with Stripe',
        startDate: '2026-11-02',
        targetDate: '2026-12-18',
      })
      .expect(201);
    await t
      .as(superAdmin)
      .post(`/team/projects/${code}/modules`, { name: 'Agent portal' })
      .expect(201);
    await t
      .as(admin)
      .post(`/team/projects/${code}/modules/${added.body.id}/move`, {
        direction: 'up',
      })
      .expect(200);
    expect((await page(admin, code)).modules.map((m) => m.name)).toEqual([
      'Payments',
      'General',
      'Agent portal',
    ]);
    await t
      .as(admin)
      .post(`/team/projects/${code}/modules/${added.body.id}`, {
        name: 'Payments and refunds',
        targetDate: '2026-10-01',
        startDate: '2026-11-02',
      })
      .expect(400);
    await t
      .as(admin)
      .post(`/team/projects/${code}/modules/${added.body.id}`, {
        name: 'Payments and refunds',
      })
      .expect(200);

    // Items go into a module; removing the module takes them with it.
    await t
      .as(admin)
      .post(`/team/projects/${code}/items`, {
        moduleId: added.body.id,
        lines: 'Stripe\nRefunds',
      })
      .expect(200);
    const payments = await moduleOf(code, 'Payments and refunds');
    expect(payments.items.map((i) => i.title)).toEqual(['Stripe', 'Refunds']);
    expect(payments.history.map((h) => h.to)).toEqual(['NOT_STARTED']);
    await t
      .as(admin)
      .post(`/team/projects/${code}/modules/${added.body.id}/remove`)
      .expect(200);
    expect(
      await t.prisma.projectItem.count({ where: { moduleId: added.body.id } }),
    ).toBe(0);

    for (const who of [manager, developer]) {
      await t
        .as(who)
        .post(`/team/projects/${code}/modules`, { name: 'Nope' })
        .expect(403);
    }
  });

  it('a developer reaches a project only once on its team', async () => {
    const code = await newProject();
    const general = await moduleOf(code, 'General');
    await t.as(developer).get(`/team/projects/${code}`).expect(404);
    await stage(developer, code, general.id, 'DEVELOPMENT').expect(404);

    await t
      .as(manager)
      .post(`/team/projects/${code}/members`, { userId: developer.id })
      .expect(403);
    await t
      .as(admin)
      .post(`/team/projects/${code}/members`, { userId: customer.id })
      .expect(400);
    await t
      .as(admin)
      .post(`/team/projects/${code}/members`, { userId: developer.id })
      .expect(200);
    expect(
      await t.noticesFor(developer, new RegExp(`added you to ${code}`)),
    ).toHaveLength(1);

    const theirs = await page(developer, code);
    expect(theirs.can).toMatchObject({
      manage: false,
      work: true,
      viewCustomer: false,
    });
    expect(theirs.members.map((m) => m.id)).toEqual([developer.id]);
    const list = await t.as(developer).get('/team/projects').expect(200);
    expect(list.body.rows.map((r: { code: string }) => r.code)).toContain(code);
    // Another developer still can't.
    await t.as(otherDeveloper).get(`/team/projects/${code}`).expect(404);

    // A developer ticks items but doesn't edit them.
    const [item] = general.items;
    await t
      .as(developer)
      .post(`/team/projects/${code}/items/${item.id}/status`, {
        status: 'DONE',
      })
      .expect(200);
    await t
      .as(developer)
      .post(`/team/projects/${code}/items/${item.id}`, { title: 'Renamed' })
      .expect(403);

    await t
      .as(admin)
      .post(`/team/projects/${code}/members/${developer.id}/remove`)
      .expect(200);
    await t.as(developer).get(`/team/projects/${code}`).expect(404);
    const logged = await t.prisma.auditLog.findMany({
      where: {
        action: { in: ['project.memberAdded', 'project.memberRemoved'] },
        data: { path: '$.code', equals: code },
      },
    });
    expect(logged).toHaveLength(2);
  });
});

describe('stages, the timeline and client review', () => {
  it('from development to client review, a round of changes, then approved', async () => {
    const code = await newProject();
    await t
      .as(admin)
      .post(`/team/projects/${code}/members`, { userId: developer.id })
      .expect(200);
    const general = await moduleOf(code, 'General');

    // Developers move through the working stages; never Done; managers never.
    await stage(developer, code, general.id, 'DEVELOPMENT').expect(200);
    await stage(
      developer,
      code,
      general.id,
      'TESTING',
      'All search tests pass',
    ).expect(200);
    await stage(developer, code, general.id, 'DONE').expect(403);
    await stage(manager, code, general.id, 'TESTING').expect(403);
    const ready = await stage(
      developer,
      code,
      general.id,
      'CLIENT_REVIEW',
    ).expect(200);
    expect(ready.body.emailSent).toBe(true);
    expect(t.emailsTo(customer, 'Ready for your review: General')).toHaveLength(
      1,
    );
    expect(
      await t.noticesFor(customer, /^Ready for your review: General/),
    ).toHaveLength(1);

    // The customer asks for changes (a note is required): round 2.
    const review = (who: Person, body: object) =>
      t
        .as(who)
        .post(`/portal/projects/${code}/modules/${general.id}/review`, body);
    await review(customer, { decision: 'changes' }).expect(400);
    await review(otherCustomer, { decision: 'approve' }).expect(404);
    await review(customer, {
      decision: 'changes',
      note: 'Show the card fee before Pay.',
    }).expect(200);
    let module = await moduleOf(code, 'General');
    expect(module).toMatchObject({ stage: 'CHANGES_REQUESTED', round: 2 });
    for (const who of [admin, developer]) {
      expect(t.emailsTo(who, 'Changes requested on General')).toHaveLength(1);
    }
    expect(
      await t.noticesFor(developer, /asked for changes to General/),
    ).toHaveLength(1);
    // Not in review any more.
    await review(customer, { decision: 'approve' }).expect(409);

    // Rework, retest, review again, approved: Done, with every item done.
    await stage(developer, code, general.id, 'DEVELOPMENT').expect(200);
    await stage(developer, code, general.id, 'RETEST').expect(200);
    await stage(developer, code, general.id, 'CLIENT_REVIEW').expect(200);
    await review(customer, { decision: 'approve' }).expect(200);
    module = await moduleOf(code, 'General');
    expect(module).toMatchObject({ stage: 'DONE', round: 2 });
    expect(module.items.every((i) => i.status === 'DONE')).toBe(true);
    expect(module.progress.percent).toBe(100);
    expect((await page(admin, code)).modulesDone).toBe(1);
    expect(t.emailsTo(developer, 'General approved')).toHaveLength(1);

    // The timeline, in order, with rounds, notes and who.
    expect(module.history.map((h) => [h.to, h.round, h.by])).toEqual([
      ['NOT_STARTED', 1, 'Emma Clarke'],
      ['DEVELOPMENT', 1, 'Priya Nair'],
      ['TESTING', 1, 'Priya Nair'],
      ['CLIENT_REVIEW', 1, 'Priya Nair'],
      ['CHANGES_REQUESTED', 2, 'Sarah Mitchell'],
      ['DEVELOPMENT', 2, 'Priya Nair'],
      ['RETEST', 2, 'Priya Nair'],
      ['CLIENT_REVIEW', 2, 'Priya Nair'],
      ['DONE', 2, 'Sarah Mitchell'],
    ]);
    expect(module.history[2].note).toBe('All search tests pass');
    expect(module.history[4].note).toBe('Show the card fee before Pay.');

    // The customer's own page shows the same modules and timeline.
    const portal = await t
      .as(customer)
      .get(`/portal/projects/${code}`)
      .expect(200);
    expect(portal.body.modules[0]).toMatchObject({ stage: 'DONE', round: 2 });
    expect(portal.body.modules[0].history).toHaveLength(9);
    const mine = await t.as(customer).get('/portal/projects').expect(200);
    expect(
      mine.body.find((p: { code: string }) => p.code === code).modules,
    ).toEqual({ done: 1, total: 1, inReview: 0 });
  });

  it('a module past its target day is late', async () => {
    const code = await newProject();
    const general = await moduleOf(code, 'General');
    await t
      .as(admin)
      .post(`/team/projects/${code}/modules/${general.id}`, {
        name: 'General',
        targetDate: '2020-01-31',
      })
      .expect(200);
    expect((await moduleOf(code, 'General')).late).toBe(true);
    await stage(admin, code, general.id, 'DONE').expect(200);
    expect((await moduleOf(code, 'General')).late).toBe(false);
  });
});
