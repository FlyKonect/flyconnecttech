import Link from "next/link";

import { notificationDots, type NotificationKind } from "@/lib/labels";
import { cn } from "@/lib/utils";

/**
 * One row in a notifications list: a coloured dot for the kind, an optional
 * small heading, the text and the time. Unread rows have a pale gold
 * background. The whole row is a link.
 */
function NotificationRow({
  kind,
  heading,
  text,
  time,
  href,
  unread = false,
  onClick,
  className,
}: {
  kind: NotificationKind;
  /** Small line above the text, for example "New reply". */
  heading?: string;
  text: string;
  time: string;
  href: string;
  unread?: boolean;
  /** For example, to mark it read before the page opens. */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      data-slot="notification-row"
      data-unread={unread || undefined}
      className={cn(
        "flex items-start gap-3.5 border-t border-line-3 px-5 py-4 text-navy hover:bg-[#F6F8FC]",
        unread && "bg-unread hover:bg-[#F7F0D9]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="mt-[5px] size-2.5 shrink-0 rounded-full"
        style={{ background: notificationDots[kind] }}
      />
      <span className="min-w-0 flex-1">
        {heading ? (
          <span className="block text-xs font-bold text-muted-foreground">
            {heading}
          </span>
        ) : null}
        <span className="block text-[15px] font-semibold">
          {unread ? <span className="sr-only">Unread: </span> : null}
          {text}
        </span>
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">{time}</span>
    </Link>
  );
}

export { NotificationRow };
