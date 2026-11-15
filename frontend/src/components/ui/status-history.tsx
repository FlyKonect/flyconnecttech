import { cn } from "@/lib/utils";

/**
 * A request's status history: a line of dots, the latest one filled navy
 * (screen 13, "Status history").
 *
 *   <StatusHistory items={[{ label: "Submitted", time: "2 Nov, 10:14" }]} />
 */
function StatusHistory({
  items,
  className,
}: {
  items: { label: string; time: string }[];
  className?: string;
}) {
  return (
    <ol data-slot="status-history" className={cn("flex flex-col", className)}>
      {items.map((item, index) => {
        const latest = index === items.length - 1;
        return (
          <li
            key={`${item.label}-${item.time}-${index}`}
            aria-current={latest ? "step" : undefined}
            className="flex gap-3"
          >
            <span aria-hidden="true" className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-[3px] size-3 shrink-0 rounded-full",
                  latest
                    ? "bg-navy shadow-[0_0_0_4px_#E3E9F5]"
                    : "border-2 border-[#A3AEC2] bg-white",
                )}
              />
              <span className="min-h-[18px] w-0.5 flex-1 bg-line-2" />
            </span>
            <span className="pb-3.5">
              <span className="block text-sm font-bold">{item.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {item.time}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export { StatusHistory };
