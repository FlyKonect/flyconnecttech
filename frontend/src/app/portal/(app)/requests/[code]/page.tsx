import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageLoading } from "@/components/shell/page-loading";
import { Banner } from "@/components/ui/banner";
import { LabelPill, Pill } from "@/components/ui/pill";
import { StatusHistory } from "@/components/ui/status-history";
import { Conversation } from "@/components/portal/conversation";
import { ReplyBox } from "@/components/portal/reply-box";
import { RequestActions } from "@/components/portal/request-actions";
import { serverApi } from "@/lib/api-server";
import { requireCustomer } from "@/lib/auth/server";
import { formatDate, formatMessageTime, formatWhen } from "@/lib/format-time";
import { priorities, requestStatuses, requestTypes } from "@/lib/labels";
import type { RequestDetail } from "@/lib/portal/types";
import { routes } from "@/lib/routes";

export async function generateMetadata({
  params,
}: PageProps<"/portal/requests/[code]">): Promise<Metadata> {
  const { code } = await params;
  return { title: `Request ${decodeURIComponent(code)}` };
}

/** One request and its conversation (screen 13, phone M4). */
async function RequestPageContent({
  params,
}: PageProps<"/portal/requests/[code]">) {
  const { code } = await params;
  const me = await requireCustomer();
  const request = await serverApi<RequestDetail>(
    `/portal/requests/${encodeURIComponent(decodeURIComponent(code))}`,
  );
  const zone = me.timezone;
  const now = new Date();

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3.5">
        <div className="min-w-0">
          <Link
            href={routes.portalRequests}
            className="inline-flex min-h-9 items-center gap-1 text-sm font-bold text-gold-text hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            My requests
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
          </p>
        </div>
        <RequestActions
          code={request.code}
          status={request.status}
          actions={request.actions}
        />
      </div>

      {request.status === "WAITING_FOR_CUSTOMER" ? (
        <Banner variant="warning">
          The support team is waiting for your reply. Answer below to move this
          request forward.
        </Banner>
      ) : null}

      <div className="flex flex-wrap items-start gap-5">
        <section
          aria-label="Messages"
          className="flex min-w-0 flex-[2_1_520px] flex-col gap-4 rounded-[22px] border border-line-2 bg-white p-[clamp(16px,2.4vw,24px)]"
        >
          <Conversation request={request} timeZone={zone} />
          <ReplyBox code={request.code} />
        </section>

        <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-4">
          <section
            aria-labelledby="request-details"
            className="flex flex-col gap-3 rounded-[22px] border border-line-2 bg-white p-[22px] text-sm"
          >
            <h2 id="request-details" className="text-base font-bold">
              Request details
            </h2>
            <dl className="flex flex-col gap-3">
              <Detail label="Assigned to">
                {request.assignee?.name ?? "Unassigned"}
              </Detail>
              <Detail label="Project">{request.project.name}</Detail>
              <Detail label="Created">
                {formatDate(request.createdAt, zone)}
              </Detail>
              <Detail label="Last updated">
                {formatWhen(request.updatedAt, zone, now)}
              </Detail>
              <Detail label="Attachments">{request.files.length}</Detail>
            </dl>
          </section>
          <section
            aria-labelledby="status-history"
            className="rounded-[22px] border border-line-2 bg-white p-[22px]"
          >
            <h2 id="status-history" className="text-base font-bold">
              Status history
            </h2>
            <StatusHistory
              className="mt-3.5"
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

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-bold">{children}</dd>
    </div>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function RequestPage(
  props: PageProps<"/portal/requests/[code]">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <RequestPageContent {...props} />
    </Suspense>
  );
}
