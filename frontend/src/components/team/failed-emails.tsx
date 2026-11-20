"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MailCheck, MailWarning } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LabelPill } from "@/components/ui/pill";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { formatWhen } from "@/lib/format-time";
import type { FailedEmail } from "@/lib/team/types";

const card =
  "rounded-[20px] border border-line bg-white p-[clamp(18px,2.4vw,26px)] shadow-[0_1px_2px_rgba(2,26,84,0.04)]";

/**
 * Failed emails (super admins and admins): emails the mail server refused.
 * The system tries each one again on its own (5 tries over about 4 hours);
 * after that it waits here to be resent or removed.
 */
export function FailedEmails({
  items,
  timeZone,
}: {
  items: FailedEmail[];
  timeZone: string;
}) {
  return (
    <section aria-labelledby="failed-emails" className={card}>
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-tint text-navy-700"
        >
          <MailWarning className="size-[21px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 id="failed-emails" className="text-[17px] font-bold">
            Emails not delivered
          </h2>
          <p className="mt-1 max-w-[640px] text-sm leading-[1.55] text-muted-foreground">
            When the mail server refuses an email, it is tried again
            automatically, up to 5 times over about 4 hours. If it still fails,
            it waits here. Invitation and password reset emails are not kept:
            send a new one from Users or Customers.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl bg-tint px-4 py-10 text-center">
          <MailCheck
            aria-hidden="true"
            className="size-7 text-green-700"
            strokeWidth={1.9}
          />
          <p className="font-bold">Every email was delivered.</p>
          <p className="text-sm text-muted-foreground">
            Nothing is waiting to be sent.
          </p>
        </div>
      ) : (
        <ul
          aria-label="Emails not delivered"
          className="mt-5 flex flex-col gap-3"
        >
          {items.map((item) => (
            <EmailRow key={item.id} item={item} timeZone={timeZone} />
          ))}
        </ul>
      )}
    </section>
  );
}

function EmailRow({ item, timeZone }: { item: FailedEmail; timeZone: string }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = React.useState<"resend" | "dismiss" | null>(null);

  async function act(action: "resend" | "dismiss") {
    setBusy(action);
    try {
      if (action === "resend") {
        const { sent } = await apiFetch<{ sent: boolean }>(
          `/team/emails/${item.id}/resend`,
          { method: "POST" },
        );
        toast(
          sent
            ? `Email sent to ${item.to}`
            : "Still not sent. The mail server refused it again.",
        );
      } else {
        await apiFetch(`/team/emails/${item.id}/dismiss`, { method: "POST" });
        toast("Email removed from the list");
      }
      router.refresh();
    } catch (failed) {
      toast(apiErrorMessage(failed));
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="flex flex-wrap items-start gap-x-5 gap-y-3 rounded-2xl border border-line p-4">
      <div className="min-w-0 flex-[1_1_320px]">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold break-words">{item.subject}</p>
          <LabelPill group="emailState" value={item.state} />
        </div>
        <p className="mt-1 text-sm break-all text-body">To {item.to}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          First tried {formatWhen(item.createdAt, timeZone)} · {item.attempts}{" "}
          {item.attempts === 1 ? "try" : "tries"}
          {item.nextTryAt
            ? ` · next try ${formatWhen(item.nextTryAt, timeZone)}`
            : ""}
        </p>
        <p className="mt-1 text-xs break-words text-muted-foreground">
          Mail server said: {item.lastError}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          size="sm"
          onClick={() => act("resend")}
          disabled={busy !== null}
        >
          {busy === "resend" ? "Sending…" : "Resend now"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => act("dismiss")}
          disabled={busy !== null}
        >
          {busy === "dismiss" ? "Removing…" : "Remove"}
        </Button>
      </div>
    </li>
  );
}
