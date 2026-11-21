import { progressWords, type Progress } from "@/lib/projects";
import { cn } from "@/lib/utils";

/**
 * A project's progress: a bar and "6 of 10 done", or "Nothing listed yet".
 *
 *   <ProgressBar progress={project.progress} label="Bluewave booking website" />
 *   <ProgressBar progress={project.progress} size="lg" />  (a project's header)
 */
function ProgressBar({
  progress,
  label,
  size = "sm",
  className,
}: {
  progress: Progress;
  /** What the bar is for, for screen readers: the project's name. */
  label?: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const percent = progress.percent ?? 0;
  const words = progressWords(progress);
  return (
    <span
      data-slot="progress-bar"
      className={cn("flex min-w-0 flex-col gap-1.5", className)}
    >
      <span
        role="progressbar"
        aria-label={label ? `Progress of ${label}` : "Progress"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={
          progress.percent === null ? words : `${percent}%, ${words}`
        }
        className={cn(
          "block w-full overflow-hidden rounded-full bg-soft",
          size === "lg" ? "h-3" : "h-2",
        )}
      >
        <span
          className={cn(
            "block h-full rounded-full transition-[width]",
            percent === 100 ? "bg-[#16A34A]" : "bg-navy",
          )}
          style={{ width: `${percent}%` }}
        />
      </span>
      <span
        className={cn(
          "text-muted-foreground",
          size === "lg" ? "text-sm" : "text-xs",
        )}
      >
        {progress.percent === null ? (
          words
        ) : (
          <>
            <strong className="font-bold text-navy">{percent}%</strong> ·{" "}
            {words}
          </>
        )}
      </span>
    </span>
  );
}

export { ProgressBar };
