import { cn } from "@/lib/utils";

/**
 * Shown for a moment while the portal or team panel checks who is signed in.
 * The sidebar's outline only, so the page does not jump when it appears.
 */
export function ShellLoading({
  tone = "portal",
}: {
  tone?: "portal" | "team";
}) {
  const team = tone === "team";
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("flex min-h-screen", team ? "bg-team-bg" : "bg-portal-bg")}
    >
      <div
        className={cn(
          "hidden w-[270px] shrink-0 app:block",
          team ? "bg-navy" : "border-r border-line-2 bg-white",
        )}
      />
      <div className="flex-1">
        <div className="h-[72px] border-b border-line-2" />
      </div>
    </div>
  );
}
