import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Flag,
  Globe,
  Inbox,
  Lock,
  Mail,
  MessageSquare,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import { notificationDots, type NotificationKind } from "@/lib/labels";
import { cn } from "@/lib/utils";

/** One icon per kind; the colour comes from `notificationDots`. */
const ICONS: Record<NotificationKind, LucideIcon> = {
  reply: MessageSquare,
  info: AlertTriangle,
  status: CircleDot,
  ok: CheckCircle2,
  closed: Lock,
  urgent: Flag,
  new: Inbox,
  high: ArrowUpRight,
  review: UserCheck,
  invite: Mail,
  lead: Globe,
};

/**
 * One row in a notifications list: an icon in the kind's colour, a small
 * heading, the text and the time. Unread rows have a pale gold background,
 * a gold edge and a dot. The whole row is a link.
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
  const Icon = ICONS[kind] ?? Bell;
  const colour = notificationDots[kind];
  return (
    <Link
      href={href}
      onClick={onClick}
      data-slot="notification-row"
      data-unread={unread || undefined}
      className={cn(
        "group relative flex items-start gap-3.5 border-t border-line-3 px-5 py-4 text-navy transition-colors hover:bg-[#F6F8FC]",
        unread &&
          "bg-unread before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-gold hover:bg-[#F7F0D9]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: `${colour}14`, color: colour }}
      >
        <Icon className="size-[18px]" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        {heading ? (
          <span className="block text-xs font-bold tracking-[0.02em] text-muted-foreground">
            {heading}
          </span>
        ) : null}
        <span
          className={cn(
            "mt-0.5 block text-[15px] leading-snug",
            unread ? "font-bold" : "font-medium text-body",
          )}
        >
          {unread ? <span className="sr-only">Unread: </span> : null}
          {text}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-2">
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          {time}
        </span>
        {unread ? (
          <span aria-hidden="true" className="size-2 rounded-full bg-gold" />
        ) : (
          <ChevronRight
            aria-hidden="true"
            className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          />
        )}
      </span>
    </Link>
  );
}

export { NotificationRow };
