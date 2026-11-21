import {
  PNG,
  startTestApp,
  type Person,
  type TestApp,
} from './support/test-app.js';

// Project discussions on a real database: customer topics (the customer
// and the project team, with proposals, the answer, close and reopen) and
// team topics (internal: asking people, "waiting for", never the
// customer), with their notices, emails and files.

let t: TestApp;
let admin: Person;
let manager: Person;
let developer: Person;
let outsider: Person;
let customer: Person;
let otherCustomer: Person;

const TITLE = 'Checkout on one page?';

/** A pattern that matches the text as it is (the title has a ?). */
const literal = (text: string) =>
  new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

/** A project for Sarah's company, led by the admin, with Priya on the team. */
async function newProject() {
  const created = await t
    .as(admin)
    .post('/team/projects', {
      customerId: customer.customerId,
      name: 'Bluewave booking website',
      type: 'TRAVEL_BOOKING_PLATFORM',
      leadId: admin.id,
    })
    .expect(201);
  const code = created.body.code as string;
  await t
    .as(admin)
    .post(`/team/projects/${code}/members`, { userId: developer.id })
    .expect(200);
  return code;
}

const portalBoard = (code: string) => `/portal/projects/${code}/discussions`;
const teamBoard = (code: string) => `/team/projects/${code}/discussions`;
const internalBoard = (code: string) =>
  `/team/projects/${code}/team-discussions`;

type Topic = {
  status: string;
  answerPostId: string | null;
  asked: { name: string; answered: boolean }[];
  posts: {
    id: string;
    kind: string;
    body: string;
    author: { name: string; customer: boolean } | null;
    proposal: { state: string } | null;
    files: { id: string; fileName: string }[];
  }[];
  can: Record<string, boolean>;
};

beforeAll(async () => {
  t = await startTestApp('@discussions.test');
  admin = await t.person('ADMIN', 'Emma Clarke');
  manager = await t.person('MANAGER', 'Sofia Martins');
  developer = await t.person('DEVELOPER', 'Priya Nair');
  outsider = await t.person('DEVELOPER', 'Daniyal Ahmed');
  customer = await t.person('CUSTOMER', 'Sarah Mitchell', 'Bluewave Holidays');
  otherCustomer = await t.person('CUSTOMER', 'Omar Khan', 'Skyline Travel');
});

afterAll(async () => {
  await t?.close();
});

describe('customer topics', () => {
  it('the customer starts one with a file; the project team hears and replies', async () => {
    const code = await newProject();
    const started = await t
      .as(customer)
      .upload(portalBoard(code))
      .field('title', TITLE)
      .field('body', 'Our agents find two steps slow.')
      .attach('files', PNG, 'checkout.png')
      .expect(201);
    const number = started.body.number as number;

    // The lead and the team developer hear about it; nobody else.
    for (const who of [admin, developer]) {
      expect(t.emailsTo(who, `New discussion: ${TITLE}`)).toHaveLength(1);
      expect(
        await t.noticesFor(who, literal(`started "${TITLE}"`)),
      ).toHaveLength(1);
    }
    expect(t.emailsTo(outsider, `New discussion: ${TITLE}`)).toHaveLength(0);

    // Who may see it.
    await t
      .as(otherCustomer)
      .get(`${portalBoard(code)}/${number}`)
      .expect(404);
    await t
      .as(outsider)
      .get(`${teamBoard(code)}/${number}`)
      .expect(404);
    await t
      .as(manager)
      .get(`${teamBoard(code)}/${number}`)
      .expect(200);

    // Priya replies: Sarah gets a notice and an email.
    await t
      .as(developer)
      .post(`${teamBoard(code)}/${number}/posts`, { body: 'Yes, we can.' })
      .expect(200);
    expect(t.emailsTo(customer, `Priya Nair replied: ${TITLE}`)).toHaveLength(
      1,
    );
    expect(
      await t.noticesFor(customer, literal(`Priya Nair replied on "${TITLE}"`)),
    ).toHaveLength(1);
    const notice = (
      await t.noticesFor(customer, new RegExp(`Priya Nair replied`))
    )[0];
    expect(notice.href).toBe(`/portal/projects/${code}/discussions/${number}`);

    // With "A discussion reply is posted" off, no email (the notice stays).
    await t.prisma.user.update({
      where: { id: customer.id },
      data: { emailPrefs: { discussionReplies: false } },
    });
    await t
      .as(developer)
      .post(`${teamBoard(code)}/${number}/posts`, { body: 'Mock-up tomorrow.' })
      .expect(200);
    expect(t.emailsTo(customer, `Priya Nair replied: ${TITLE}`)).toHaveLength(
      1,
    );
    await t.prisma.user.update({
      where: { id: customer.id },
      data: { emailPrefs: {} },
    });

    // Her file downloads for her, not for another customer.
    const topic = (
      await t
        .as(customer)
        .get(`${portalBoard(code)}/${number}`)
        .expect(200)
    ).body as Topic;
    const file = topic.posts[0].files[0];
    expect(file.fileName).toBe('checkout.png');
    await t
      .as(customer)
      .get(`${portalBoard(code)}/${number}/files/${file.id}`)
      .expect(200);
    await t
      .as(otherCustomer)
      .get(`${portalBoard(code)}/${number}/files/${file.id}`)
      .expect(404);
    expect(
      topic.posts.map((p) => [p.author?.name, p.author?.customer]),
    ).toEqual([
      ['Sarah Mitchell', true],
      ['Priya Nair', false],
      ['Priya Nair', false],
    ]);
  });

  it('a proposal: the customer approves it once; the team hears', async () => {
    const code = await newProject();
    const { body } = await t
      .as(customer)
      .post(portalBoard(code), { title: TITLE, body: 'Can it be one page?' })
      .expect(201);
    const number = body.number as number;

    // Only the team posts proposals.
    await t
      .as(customer)
      .post(`${portalBoard(code)}/${number}/posts`, {
        body: 'Mine',
        proposal: true,
      })
      .expect(403);
    await t
      .as(admin)
      .post(`${teamBoard(code)}/${number}/posts`, {
        body: 'One page: details above, payment below.',
        proposal: true,
      })
      .expect(200);
    expect(
      t.emailsTo(customer, `Proposal waiting for your approval: ${TITLE}`),
    ).toHaveLength(1);
    const list = await t.as(customer).get(portalBoard(code)).expect(200);
    expect(list.body.rows[0]).toMatchObject({ number, proposalWaiting: true });

    const topic = (
      await t
        .as(customer)
        .get(`${portalBoard(code)}/${number}`)
        .expect(200)
    ).body as Topic;
    const proposal = topic.posts.find((p) => p.kind === 'PROPOSAL')!;
    const decide = (decision: object) =>
      t
        .as(customer)
        .post(
          `${portalBoard(code)}/${number}/posts/${proposal.id}/decision`,
          decision,
        );
    await decide({ decision: 'changes' }).expect(400);
    await decide({ decision: 'approve', note: 'Perfect' }).expect(200);
    await decide({ decision: 'approve' }).expect(409);
    expect(
      t.emailsTo(admin, `Sarah Mitchell approved the proposal: ${TITLE}`),
    ).toHaveLength(1);

    const after = (
      await t
        .as(admin)
        .get(`${teamBoard(code)}/${number}`)
        .expect(200)
    ).body as Topic;
    expect(
      after.posts.find((p) => p.kind === 'PROPOSAL')!.proposal,
    ).toMatchObject({
      state: 'APPROVED',
    });
    expect(after.posts.at(-1)).toMatchObject({
      kind: 'SYSTEM',
      body: 'Sarah Mitchell approved the proposal: Perfect',
    });
  });

  it('the answer, close and reopen follow who may do them', async () => {
    const code = await newProject();
    const { body } = await t
      .as(customer)
      .post(portalBoard(code), { title: TITLE, body: 'Question' })
      .expect(201);
    const number = body.number as number;
    await t
      .as(admin)
      .post(`${teamBoard(code)}/${number}/posts`, { body: 'Answer' })
      .expect(200);
    const topic = (
      await t
        .as(customer)
        .get(`${portalBoard(code)}/${number}`)
        .expect(200)
    ).body as Topic;
    const reply = topic.posts[1];

    // Only who started it (or an admin) marks the answer.
    await t
      .as(developer)
      .post(`${teamBoard(code)}/${number}/answer`, { postId: reply.id })
      .expect(403);
    await t
      .as(customer)
      .post(`${portalBoard(code)}/${number}/answer`, { postId: reply.id })
      .expect(200);

    // Close: the starter may; a team developer who isn't the lead may not.
    await t
      .as(developer)
      .post(`${teamBoard(code)}/${number}/close`, {})
      .expect(403);
    await t
      .as(customer)
      .post(`${portalBoard(code)}/${number}/close`, { note: 'Sorted, thanks' })
      .expect(200);
    await t
      .as(customer)
      .post(`${portalBoard(code)}/${number}/posts`, { body: 'One more' })
      .expect(409);
    const closed = (
      await t
        .as(customer)
        .get(`${portalBoard(code)}/${number}`)
        .expect(200)
    ).body as Topic & { closed: { by: string; note: string } };
    expect(closed).toMatchObject({
      status: 'CLOSED',
      answerPostId: reply.id,
      closed: { by: 'Sarah Mitchell', note: 'Sorted, thanks' },
    });
    expect(closed.can).toMatchObject({ reply: false, reopen: true });
    const closedList = await t
      .as(customer)
      .get(`${portalBoard(code)}?status=closed`)
      .expect(200);
    expect(closedList.body.counts).toEqual({ open: 0, closed: 1 });

    // The project lead (the admin here) reopens it.
    await t
      .as(developer)
      .post(`${teamBoard(code)}/${number}/reopen`)
      .expect(403);
    await t
      .as(admin)
      .post(`${teamBoard(code)}/${number}/reopen`)
      .expect(200);
    const lines = (
      (
        await t
          .as(admin)
          .get(`${teamBoard(code)}/${number}`)
          .expect(200)
      ).body as Topic
    ).posts
      .filter((p) => p.kind === 'SYSTEM')
      .map((p) => p.body);
    expect(lines).toEqual([
      "Sarah Mitchell marked Emma Clarke's reply as the answer",
      'Sarah Mitchell closed this topic: Sorted, thanks',
      'Emma Clarke reopened this topic',
    ]);
  });
});

describe('team topics (internal)', () => {
  it('asks a developer, waits for them, and never reaches the customer', async () => {
    const code = await newProject();
    const sentToSarah = t.emailsTo(customer, /./).length;

    // Asking someone off the team is refused.
    await t
      .as(admin)
      .post(internalBoard(code), {
        title: 'Fees?',
        body: 'Where?',
        ask: [outsider.id],
      })
      .expect(400);
    const { body } = await t
      .as(admin)
      .post(internalBoard(code), {
        title: 'Card fees',
        body: 'Priya, where should the card fee show?',
        ask: [developer.id],
      })
      .expect(201);
    const number = body.number as number;
    expect(
      t.emailsTo(developer, 'Emma Clarke asked you: Card fees'),
    ).toHaveLength(1);
    expect(
      await t.noticesFor(
        developer,
        new RegExp(`asked you about ${code}: Card fees`),
      ),
    ).toHaveLength(1);
    let list = await t.as(admin).get(internalBoard(code)).expect(200);
    expect(list.body.rows[0]).toMatchObject({
      number,
      waitingFor: ['Priya Nair'],
    });

    // Priya replies: no longer waited for. Managers read and reply too.
    await t
      .as(developer)
      .post(`${internalBoard(code)}/${number}/posts`, {
        body: 'Above the Pay button.',
      })
      .expect(200);
    list = await t.as(admin).get(internalBoard(code)).expect(200);
    expect(list.body.rows[0].waitingFor).toEqual([]);
    await t
      .as(manager)
      .post(`${internalBoard(code)}/${number}/posts`, { body: 'Agreed.' })
      .expect(200);
    // Proposals are for customer topics only.
    await t
      .as(admin)
      .post(`${internalBoard(code)}/${number}/posts`, {
        body: 'x',
        proposal: true,
      })
      .expect(403);

    // The customer never sees it: not in the list, not by number, no email.
    const portal = await t.as(customer).get(portalBoard(code)).expect(200);
    expect(
      portal.body.rows.map((r: { number: number }) => r.number),
    ).not.toContain(number);
    await t
      .as(customer)
      .get(`${portalBoard(code)}/${number}`)
      .expect(404);
    await t.as(customer).get(internalBoard(code)).expect(403);
    expect(t.emailsTo(customer, /./).length).toBe(sentToSarah);
    // And a team topic isn't reachable through the customer board either.
    await t
      .as(admin)
      .get(`${teamBoard(code)}/${number}`)
      .expect(404);
  });

  it('admins remove a post or delete a topic (audited); others may not', async () => {
    const code = await newProject();
    const { body } = await t
      .as(developer)
      .post(internalBoard(code), { title: 'Temporary', body: 'First' })
      .expect(201);
    const number = body.number as number;
    await t
      .as(manager)
      .post(`${internalBoard(code)}/${number}/posts`, { body: 'Oops' })
      .expect(200);
    const topic = (
      await t
        .as(admin)
        .get(`${internalBoard(code)}/${number}`)
        .expect(200)
    ).body as Topic;
    const oops = topic.posts.find((p) => p.body === 'Oops')!;
    await t
      .as(developer)
      .post(`${internalBoard(code)}/${number}/posts/${oops.id}/remove`)
      .expect(403);
    await t
      .as(admin)
      .post(
        `${internalBoard(code)}/${number}/posts/${topic.posts[0].id}/remove`,
      )
      .expect(409);
    await t
      .as(admin)
      .post(`${internalBoard(code)}/${number}/posts/${oops.id}/remove`)
      .expect(200);
    // Authors edit only their own messages.
    await t
      .as(manager)
      .post(`${internalBoard(code)}/${number}/posts/${topic.posts[0].id}`, {
        body: 'Changed',
      })
      .expect(403);
    await t
      .as(developer)
      .post(`${internalBoard(code)}/${number}/delete`)
      .expect(403);
    await t
      .as(admin)
      .post(`${internalBoard(code)}/${number}/delete`)
      .expect(200);
    await t
      .as(admin)
      .get(`${internalBoard(code)}/${number}`)
      .expect(404);
    expect(
      await t.prisma.auditLog.count({
        where: {
          action: 'topic.deleted',
          data: { path: '$.code', equals: code },
        },
      }),
    ).toBe(1);
  });
});
