"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { requestStatuses, type RequestStatus } from "@/lib/labels";
import type { CustomerAction } from "@/lib/portal/types";
import { routes } from "@/lib/routes";

/**
 * The customer's buttons on a request (screen 13): Close request while it is
 * open, Confirm it's fixed / I still need help when Resolved, Reopen request
 * when Closed (for a few days only: later, a new request is asked). The
 * backend says which ones apply.
 */
export function RequestActions({
  code,
  status,
  actions,
  reopenWithinDays,
}: {
  code: string;
  status: RequestStatus;
  actions: CustomerAction[];
  reopenWithinDays: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = React.useState<CustomerAction | null>(null);
  const [rating, setRating] = React.useState(false);

  async function run(action: CustomerAction, body?: object) {
    setBusy(action);
    try {
      const result = await apiFetch<{ status: RequestStatus }>(
        `/portal/requests/${encodeURIComponent(code)}/${action}`,
        { method: "POST", ...(body ? { body } : {}) },
      );
      setRating(false);
      toast(`${code} is now ${requestStatuses[result.status].label}`);
      router.refresh();
    } catch (error) {
      toast(apiErrorMessage(error), "error");
    } finally {
      setBusy(null);
    }
  }

  const button = (
    action: CustomerAction,
    label: string,
    variant: "outline" | "success" | "navy",
  ) => (
    <Button
      key={`${action}-${label}`}
      variant={variant}
      className="h-11 px-4"
      disabled={busy !== null}
      onClick={() => (action === "confirm" ? setRating(true) : run(action))}
    >
      {busy === action ? "Saving…" : label}
    </Button>
  );

  if (status === "CLOSED" && !actions.includes("reopen")) {
    return (
      <div className="flex max-w-[360px] flex-col items-start gap-2">
        <p className="text-sm text-muted-foreground">
          This request closed more than {reopenWithinDays} days ago. Need more
          help? Send a new request and mention {code}.
        </p>
        <Button asChild variant="navy" className="h-11 px-4">
          <Link href={routes.portalNewRequest}>Start a new request</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.includes("close")
        ? button("close", "Close request", "outline")
        : null}
      {actions.includes("confirm")
        ? button("confirm", "Confirm it's fixed", "success")
        : null}
      {actions.includes("reopen")
        ? status === "RESOLVED"
          ? button("reopen", "I still need help", "outline")
          : button("reopen", "Reopen request", "navy")
        : null}
      {rating ? (
        <RateDialog
          busy={busy === "confirm"}
          onClose={() => setRating(false)}
          onConfirm={(stars, comment) =>
            run(
              "confirm",
              stars ? { rating: stars, comment: comment || undefined } : {},
            )
          }
        />
      ) : null}
    </div>
  );
}

const STAR_WORDS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

/** "How did we do?": 1-5 stars and a comment, both optional. */
function RateDialog({
  busy,
  onClose,
  onConfirm,
}: {
  busy: boolean;
  onClose: () => void;
  onConfirm: (stars: number, comment: string) => void;
}) {
  const [stars, setStars] = React.useState(0);
  const [comment, setComment] = React.useState("");
  return (
    <Dialog open onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogTitle>Confirm it&apos;s fixed</DialogTitle>
        <DialogDescription>
          The request will close. How did we do? Rating is optional.
        </DialogDescription>
        <div
          role="radiogroup"
          aria-label="Your rating"
          className="mt-4 flex gap-1.5"
        >
          {STAR_WORDS.map((word, index) => {
            const value = index + 1;
            return (
              <button
                key={word}
                type="button"
                role="radio"
                aria-checked={stars === value}
                aria-label={`${value} ${value === 1 ? "star" : "stars"}: ${word}`}
                onClick={() => setStars(stars === value ? 0 : value)}
                className={`size-11 cursor-pointer rounded-xl text-2xl leading-none ${value <= stars ? "text-gold-text" : "text-line-2"} hover:bg-tint`}
              >
                ★
              </button>
            );
          })}
        </div>
        <p className="mt-1 h-5 text-sm text-muted-foreground">
          {stars ? STAR_WORDS[stars - 1] : ""}
        </p>
        <label className="mt-3 flex flex-col gap-1.5 text-[13px] font-bold">
          Anything to add? (optional)
          <Textarea
            rows={3}
            maxLength={500}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="success"
            disabled={busy}
            onClick={() => onConfirm(stars, comment.trim())}
          >
            {busy ? "Saving…" : "Confirm it's fixed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
