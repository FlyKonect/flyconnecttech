import { Pill } from "@/components/ui/pill";
import { slaStates } from "@/lib/labels";
import { slaBadge } from "@/lib/sla";
import type { RequestStatus } from "@/lib/labels";

/**
 * A request's SLA as a small pill: "Due in 38m" (red when at risk),
 * "Due tomorrow", "Paused" or "Met". Nothing when there is nothing to say.
 *
 *   <SlaPill request={request} timeZone={me.timezone} />
 */
function SlaPill({
  request,
  timeZone,
  now,
  className,
}: {
  request: {
    status: RequestStatus;
    dueAt: string | null;
    resolveDueAt?: string | null;
    firstResponseAt?: string | null;
    resolvedAt: string | null;
  };
  timeZone: string;
  now?: Date;
  className?: string;
}) {
  const badge = slaBadge(request, timeZone, now);
  if (!badge) return null;
  return (
    <Pill
      data-slot="sla-pill"
      tone={slaStates[badge.state].tone}
      className={className}
    >
      {badge.label}
    </Pill>
  );
}

export { SlaPill };
