import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { PageLoading } from "@/components/portal/page-loading";
import { Button } from "@/components/ui/button";
import { LabelPill } from "@/components/ui/pill";
import { serverApi } from "@/lib/api-server";
import type { RequestDetail } from "@/lib/portal/types";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Request submitted" };

const NEXT_STEPS = [
  ["NEXT", "Our team reviews your request"],
  ["THEN", "A developer is assigned and replies"],
  ["ALWAYS", "You are notified at every update"],
] as const;

/** Request submitted (screen 11). */
async function RequestSubmittedPageContent({
  params,
}: PageProps<"/portal/requests/[code]/submitted">) {
  const { code } = await params;
  const request = await serverApi<RequestDetail>(
    `/portal/requests/${encodeURIComponent(decodeURIComponent(code))}`,
  );

  return (
    <section className="mx-auto w-full max-w-[calc(720px+2*clamp(24px,4vw,44px))] rounded-[28px] border border-line-2 bg-white p-[clamp(24px,4vw,44px)] text-center">
      <span className="inline-flex size-[76px] items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">
        <Check aria-hidden="true" className="size-9" strokeWidth={2.4} />
      </span>
      <h1 className="mt-5 font-heading text-[clamp(28px,3.4vw,38px)] leading-[1.15] font-bold tracking-[-0.03em]">
        Request submitted
      </h1>
      <p className="mt-2.5 text-base text-body">
        We have received your request and emailed you a copy.
      </p>
      <p className="mx-auto mt-[22px] inline-block rounded-2xl bg-tint px-6 py-3.5 font-heading text-[26px] font-bold tracking-[0.02em] text-navy-700">
        {request.code}
      </p>
      <p className="mt-4 text-[15px] font-bold break-words">{request.title}</p>
      <p className="mt-2 flex flex-wrap justify-center gap-2">
        <LabelPill group="requestStatus" value={request.status} />
        <LabelPill group="priority" value={request.priority} />
      </p>
      <ul className="mt-[26px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2.5 text-left">
        {NEXT_STEPS.map(([when, what]) => (
          <li key={when} className="rounded-2xl bg-[#F6F8FC] p-4">
            <p className="text-xs font-bold text-gold-text">{when}</p>
            <p className="mt-1 text-sm font-semibold">{what}</p>
          </li>
        ))}
      </ul>
      <div className="mt-[26px] flex flex-wrap justify-center gap-2.5">
        <Button asChild size="lg" className="h-[50px]">
          <Link href={routes.portalRequest(request.code)}>View request</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-[50px]">
          <Link href={routes.portal}>Back to dashboard</Link>
        </Button>
      </div>
    </section>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function RequestSubmittedPage(
  props: PageProps<"/portal/requests/[code]/submitted">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <RequestSubmittedPageContent {...props} />
    </Suspense>
  );
}
