import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, File } from "lucide-react";

import { PageLoading } from "@/components/shell/page-loading";
import {
  RequestHeaderActions,
  RequestStatusPanel,
} from "@/components/team/request-controls";
import { TeamComposer } from "@/components/team/team-composer";
import {
  TeamConversation,
  teamFileUrl,
} from "@/components/team/team-conversation";
import { Avatar } from "@/components/ui/avatar";
import { LabelPill, Pill } from "@/components/ui/pill";
import { StatusHistory } from "@/components/ui/status-history";
import { serverApi } from "@/lib/api-server";
import { requireTeamMember } from "@/lib/auth/server";
import { formatMessageTime, formatWhen } from "@/lib/format-time";
import {
  priorities,
  projectTypes,
  requestStatuses,
  requestTypes,
} from "@/lib/labels";
import { routes } from "@/lib/routes";
import type { Developer, TeamRequestDetail } from "@/lib/team/types";

export async function generateMetadata({
  params,
}: PageProps<"/team/requests/[code]">): Promise<Metadata> {
  const { code } = await params;
  return { title: `Request ${decodeURIComponent(code)}` };
}

/** Request review (screens 22 to 25). */
async function TeamRequestContent({
  params,
}: PageProps<"/team/requests/[code]">) {
  const { code } = await params;
  const me = await requireTeamMember();
  const request = await serverApi<TeamRequestDetail>(
    `/team/requests/${encodeURIComponent(decodeURIComponent(code))}`,
    { signIn: routes.teamSignIn },
  );
  const developers = request.can.assign
    ? await serverApi<Developer[]>("/team/developers", {
        signIn: routes.teamSignIn,
      })
    : [];
  const zone = me.timezone;
  const now = new Date();
  const isDeveloper = me.role === "DEVELOPER";
  const { customer } = request;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3.5">
        <div className="min-w-0">
          <Link
            href={routes.teamRequests}
            className="inline-flex min-h-9 items-center gap-1 text-sm font-bold text-gold-text hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to requests
          </Link>
          <p className="mt-1.5 text-[13px] font-bold text-muted-foreground">
            {request.code} · {request.project.name} ·{" "}
            {requestTypes[request.type].label}
          </p>
          <h1 className="mt-1 font-heading text-[clamp(22px,2.6vw,30px)] leading-[1.15] font-bold tracking-[-0.035em] break-words">
            {request.title}
          </h1>
          <p className="mt-2.5 flex flex-wrap gap-2">
            <LabelPill group="requestStatus" value={request.status} />
            <Pill tone={priorities[request.priority].tone}>
              {priorities[request.priority].label} priority
            </Pill>
            <Pill tone={{ bg: "#EEF2F7", text: "#021A54" }}>
              Assigned: {request.assignee?.name ?? "Unassigned"}
            </Pill>
          </p>
        </div>
        <RequestHeaderActions request={request} developers={developers} />
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-4">
          <TeamConversation request={request} timeZone={zone} />
          <TeamComposer code={request.code} />
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          <RequestStatusPanel
            request={request}
            developers={developers}
            isDeveloper={isDeveloper}
          />

          <section
            aria-labelledby="customer-panel"
            className="flex flex-col gap-2.5 rounded-[22px] border border-line bg-white p-5 text-sm"
          >
            <h2
              id="customer-panel"
              className="text-[13px] font-bold text-muted-foreground"
            >
              CUSTOMER
            </h2>
            <div className="flex items-center gap-3">
              <Avatar
                name={customer.name ?? customer.company}
                tone="tint"
                className="size-10"
              />
              <span className="min-w-0">
                <span className="block font-bold">
                  {customer.name ?? customer.company}
                </span>
                <span className="block text-[13px] text-muted-foreground">
                  {[customer.company, customer.country]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
            </div>
            {customer.email ? (
              <span className="break-all text-body">
                <strong className="font-semibold text-muted-foreground">
                  Email
                </strong>{" "}
                {customer.email}
              </span>
            ) : null}
            {customer.phone ? (
              <span className="text-body">
                <strong className="font-semibold text-muted-foreground">
                  Phone
                </strong>{" "}
                {customer.phone}
              </span>
            ) : null}
            <dl className="flex flex-col gap-2 border-t border-line-3 pt-2.5">
              <Fact label="Project">{request.project.name}</Fact>
              <Fact label="Project type">
                {projectTypes[request.project.type].label}
              </Fact>
              <Fact label="Request type">
                {requestTypes[request.type].label}
              </Fact>
              <Fact label="Created">
                {formatWhen(request.createdAt, zone, now)}
              </Fact>
              {request.rating ? (
                <Fact label="Customer rating">
                  <span
                    aria-label={`${request.rating} out of 5 stars`}
                    className="text-gold-text"
                  >
                    {"★".repeat(request.rating)}
                    <span className="text-line-2">
                      {"★".repeat(5 - request.rating)}
                    </span>
                  </span>
                </Fact>
              ) : null}
            </dl>
            {request.ratingComment ? (
              <blockquote className="rounded-xl bg-tint px-3 py-2 text-[13px] text-body italic">
                “{request.ratingComment}”
              </blockquote>
            ) : null}
            {me.actions.includes("customers.view") ? (
              <Link
                href={routes.teamCustomer(customer.id)}
                className="inline-flex min-h-9 items-center self-start text-sm font-bold text-gold-text hover:underline"
              >
                View customer and projects →
              </Link>
            ) : null}
          </section>

          <section
            aria-labelledby="attachments-panel"
            className="rounded-[22px] border border-line bg-white p-5"
          >
            <h2
              id="attachments-panel"
              className="text-[13px] font-bold text-muted-foreground"
            >
              ATTACHMENTS · {request.files.length}
            </h2>
            {request.files.length ? (
              <ul className="mt-2.5 flex flex-col gap-2">
                {request.files.map((file) => (
                  <li key={file.id}>
                    <a
                      href={teamFileUrl(request.code, file.id)}
                      download={file.fileName}
                      className="flex items-center gap-2.5 rounded-xl bg-[#F6F8FC] px-3 py-2.5 hover:bg-tint"
                    >
                      <File
                        aria-hidden="true"
                        className="size-[18px] shrink-0 text-navy"
                        strokeWidth={1.8}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold">
                          {file.fileName}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {file.uploadedBy} ·{" "}
                          {formatMessageTime(file.createdAt, zone, now)}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2.5 text-sm text-muted-foreground">
                No files yet.
              </p>
            )}
          </section>

          <section
            aria-labelledby="activity-panel"
            className="rounded-[22px] border border-line bg-white p-5"
          >
            <h2
              id="activity-panel"
              className="text-[13px] font-bold text-muted-foreground"
            >
              ACTIVITY TIMELINE
            </h2>
            <StatusHistory
              className="mt-3"
              items={request.history.map((change) => ({
                label: requestStatuses[change.status].label,
                time: formatMessageTime(change.at, zone, now),
              }))}
            />
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
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-bold">{children}</dd>
    </div>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function TeamRequestPage(
  props: PageProps<"/team/requests/[code]">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <TeamRequestContent {...props} />
    </Suspense>
  );
}
