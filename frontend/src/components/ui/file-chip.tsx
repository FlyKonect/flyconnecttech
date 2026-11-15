import { File, Paperclip, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A file's name in a small chip.
 *
 *   look="picked"  a file chosen but not sent yet, with a remove button
 *                  (New request, the reply box)
 *   look="plain"   a file listed for checking (New request, Review)
 *   look="link"    a sent file that downloads when clicked (conversation)
 */
function FileChip({
  name,
  look = "plain",
  href,
  onRemove,
  className,
}: {
  name: string;
  look?: "picked" | "plain" | "link";
  /** Where the file downloads from (look="link"). */
  href?: string;
  /** Shows the remove button (look="picked"). */
  onRemove?: () => void;
  className?: string;
}) {
  if (look === "picked") {
    return (
      <span
        data-slot="file-chip"
        className={cn(
          "inline-flex max-w-full items-center gap-2 rounded-[10px] bg-[#F6F8FC] py-2 pr-1.5 pl-3 text-[13px] font-semibold text-navy",
          className,
        )}
      >
        <File aria-hidden="true" className="size-[15px] shrink-0" />
        <span className="min-w-0 truncate">{name}</span>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${name}`}
            className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-white hover:text-navy"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}
      </span>
    );
  }

  const content = (
    <>
      <Paperclip aria-hidden="true" className="size-[13px] shrink-0" />
      <span className="min-w-0 truncate">{name}</span>
    </>
  );

  if (look === "link" && href) {
    return (
      <a
        data-slot="file-chip"
        href={href}
        download={name}
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-lg bg-tint px-2.5 py-1.5 text-xs font-bold text-navy-700 hover:underline",
          className,
        )}
      >
        {content}
        <span className="sr-only"> (download)</span>
      </a>
    );
  }

  return (
    <span
      data-slot="file-chip"
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[#F6F8FC] px-2.5 py-1.5 text-[13px] font-semibold text-navy",
        className,
      )}
    >
      {content}
    </span>
  );
}

export { FileChip };
