import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageLoading } from "@/components/shell/page-loading";
import {
  AccountButton,
  AddProjectRow,
  DeleteCustomerButton,
  EditCompanyButton,
  EditProjectButton,
  ProjectStatusSelect,
} from "@/components/team/customer-actions";
import { TeamPageTitle } from "@/components/team/team-shell";
import { Avatar } from "@/components/ui/avatar";
import { LabelPill } from "@/components/ui/pill";
import { serverApi } from "@/lib/api-server";
import { requireTeamMember } from "@/lib/auth/server";
import { formatDayMonth, formatMonthYear, formatWhen } from "@/lib/format-time";
import { projectTypes } from "@/lib/labels";
import { routes } from "@/lib/routes";
import type { CustomerDetail } from "@/lib/team/types";

export const metadata: Metadata = { title: "Customer" };

const card = "rounded-[22px] border border-line-2 bg-white p-6";

const LEADS = {
  DEMO: { label: "Demo request", href: routes.teamDemos },
  QUOTE: { label: "Quote request", href: routes.teamQuotes },
  MESSAGE: { label: "Message", href: routes.teamMessages },
} as const;

/** One customer (screen 28): projects, requests, contact and account access. */
async function CustomerContent({ params }: PageProps<"/team/customers/[id]">) {
  const { id } = await params;
  const me = await requireTeamMember();
  const customer = await serverApi<CustomerDetail>(
    `/team/customers/${encodeURIComponent(id)}`,
    { signIn: routes.teamSignIn },
  );
  const { contact } = customer;
  const zone = me.timezone;
  const now = new Date();
  const first = contact.name.split(/\s+/)[0] || contact.name;
  const since =
    contact.status === "ACTIVE" && contact.activatedAt
      ? formatMonthYear(contact.activatedAt, zone)
      : `Invited ${formatDayMonth(contact.invitedAt ?? customer.createdAt, zone)}`;

  return (
    <>
      <TeamPageTitle title={`Customer · ${customer.company}`} />
      <div>
        <Link
          href={routes.teamCustomers}
          className="inline-flex min-h-9 items-center text-sm font-bold text-gold-text hover:underline"
        >
          ← Customers
        </Link>
      </div>

      <section
        aria-label="Customer"
        className={`${card} flex flex-wrap items-center justify-between gap-4`}
      >
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={contact.name} className="size-14 text-lg" />
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2.5 font-heading text-[22px] font-bold tracking-[-0.02em]">
              {contact.name}
              <LabelPill group="userStatus" value={contact.status} />
            </h1>
            <p className="mt-0.5 text-[15px] break-all text-muted-foreground">
              {customer.company} · {contact.email}
            </p>
          </div>
        </div>
        {customer.canManage || customer.canDelete ? (
          <div className="flex flex-wrap items-center gap-2.5">
            {customer.canManage ? (
              <EditCompanyButton
                customerId={customer.id}
                company={customer.company}
              />
            ) : null}
            {customer.canManage ? (
              <AccountButton
                userId={contact.id}
                email={contact.email}
                status={contact.status}
              />
            ) : null}
            {customer.canDelete ? (
              <DeleteCustomerButton
                customerId={customer.id}
                company={customer.company}
                contactName={contact.name}
                email={contact.email}
                openRequests={customer.projects.reduce(
                  (sum, project) => sum + project.openRequests,
                  0,
                )}
              />
            ) : null}
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[1.6_1_520px] flex-col gap-4">
          <section aria-labelledby="projects-heading" className={card}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="projects-heading" className="text-[17px] font-bold">
                Projects · {customer.projects.length}
              </h2>
              <span className="text-[13px] text-muted-foreground">
                Only {first} can raise requests for these projects
              </span>
            </div>
            <ul className="mt-2">
              {customer.projects.map((project) => (
                <li
                  key={project.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-t border-line-3 py-3.5 first:border-t-0"
                >
                  <span className="min-w-0 flex-[1_1_220px]">
                    <span className="block text-xs font-bold text-muted-foreground">
                      {project.code} · {projectTypes[project.type].label}
                    </span>
                    <span className="mt-0.5 block text-[15px] font-bold">
                      {project.name}
                    </span>
                  </span>
                  {customer.canManage ? (
                    <>
                      <ProjectStatusSelect
                        customerId={customer.id}
                        project={project}
                      />
                      <EditProjectButton
                        customerId={customer.id}
                        project={project}
                      />
                    </>
                  ) : (
                    <LabelPill group="projectStatus" value={project.status} />
                  )}
                  <span className="text-[13px] whitespace-nowrap text-muted-foreground">
                    {project.openRequests} open
                  </span>
                </li>
              ))}
            </ul>
            {customer.canManage ? (
              <AddProjectRow
                customerId={customer.id}
                company={customer.company}
              />
            ) : null}
          </section>

          <section aria-labelledby="requests-heading" className={card}>
            <h2 id="requests-heading" className="text-[17px] font-bold">
              Support requests · {customer.requests.length}
            </h2>
            {customer.requests.length ? (
              <ul className="mt-2">
                {customer.requests.map((request) => (
                  <li
                    key={request.code}
                    className="border-t border-line-3 first:border-t-0"
                  >
                    <Link
                      href={routes.teamRequest(request.code)}
                      className="flex flex-wrap items-center gap-x-3.5 gap-y-2 py-3.5 hover:bg-soft/40"
                    >
                      <span className="min-w-0 flex-[1_1_240px]">
                        <span className="block text-xs font-bold text-muted-foreground">
                          {request.code} · {request.project.name}
                        </span>
                        <span className="mt-0.5 block text-[15px] font-bold">
                          {request.title}
                        </span>
                      </span>
                      <LabelPill group="requestStatus" value={request.status} />
                      <span className="text-[13px] whitespace-nowrap text-muted-foreground">
                        {request.assignee?.name ?? "Unassigned"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-muted-foreground">
                No requests yet. They appear here once {first} signs in and
                sends one.
              </p>
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          <section
            aria-labelledby="contact-heading"
            className={`${card} flex flex-col gap-2.5 text-sm`}
          >
            <h2 id="contact-heading" className="text-[17px] font-bold">
              Contact
            </h2>
            <dl className="flex flex-col gap-2.5">
              <Fact label="Email">{contact.email}</Fact>
              <Fact label="Phone">{contact.phone ?? "Not added yet"}</Fact>
              <Fact label="Country">{contact.country ?? "Not added yet"}</Fact>
              <Fact label="Customer since">{since}</Fact>
              <Fact label="Added by">{customer.addedBy ?? "—"}</Fact>
              {customer.cameFrom ? (
                <Fact label="Came from">
                  <Link
                    href={`${LEADS[customer.cameFrom.type].href}/${customer.cameFrom.code}`}
                    className="text-gold-text hover:underline"
                  >
                    {LEADS[customer.cameFrom.type].label}{" "}
                    {customer.cameFrom.code}
                  </Link>
                </Fact>
              ) : null}
            </dl>
          </section>

          <section aria-labelledby="access-heading" className={card}>
            <h2 id="access-heading" className="text-[17px] font-bold">
              Account access
            </h2>
            {contact.status === "INVITED" ? (
              <p className="mt-3 rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-3 text-sm leading-[1.55] text-[#92400E]">
                Invitation sent. Waiting for {first} to verify their email and
                set a password.
              </p>
            ) : contact.status === "ACTIVE" ? (
              <p className="mt-3 rounded-[14px] border border-[#BBF7D0] bg-[#ECFDF5] px-3.5 py-3 text-sm leading-[1.55] text-[#166534]">
                Active. {first} verified their email and set their own password.{" "}
                {contact.lastActiveAt
                  ? `Last signed in ${formatWhen(contact.lastActiveAt, zone, now)}.`
                  : "Not signed in yet."}
              </p>
            ) : (
              <p className="mt-3 rounded-[14px] border border-line-2 bg-[#F6F8FC] px-3.5 py-3 text-sm leading-[1.55] text-body">
                Disabled. {first} can&apos;t sign in.
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-bold [overflow-wrap:anywhere]">
        {children}
      </dd>
    </div>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function CustomerPage(props: PageProps<"/team/customers/[id]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <CustomerContent {...props} />
    </Suspense>
  );
}
