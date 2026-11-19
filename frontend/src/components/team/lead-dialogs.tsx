"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { RadioCard, RadioCards } from "@/components/ui/choice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import {
  demoDayFor,
  demoWhenLong,
  upcomingDemoDays,
  type DemoDay,
} from "@/lib/forms/demo-slots";
import { takenDemoSlots } from "@/lib/forms/submit";
import { budgets, timelines } from "@/lib/labels";
import { demoStart, firstOf, formatGbp } from "@/lib/team/leads";
import type { DemoDetail, LeadPerson, QuoteDetail } from "@/lib/team/types";

/** "{code} · {name} · {company} · {email}" under a dialog's title. */
const about = (lead: {
  code: string;
  name: string;
  email: string;
  company: string | null;
}) =>
  [lead.code, lead.name, lead.company, lead.email].filter(Boolean).join(" · ");

/** A tinted line at the top of a dialog: "They picked …". */
function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-[18px] rounded-xl bg-[#F6F8FC] px-3.5 py-3 text-sm text-body">
      {children}
    </p>
  );
}

/** Sends a dialog's change, then toasts and refreshes. */
function useSend() {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  async function send<T>(
    path: string,
    body: object,
    done: (answer: T) => string,
    onClose: () => void,
  ) {
    setBusy(true);
    setError("");
    try {
      const answer = await apiFetch<T>(path, { method: "POST", body });
      onClose();
      toast(done(answer));
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
      setBusy(false);
      return failed;
    }
    setBusy(false);
  }
  return { busy, error, setError, send };
}

// ------------------------------------------------------------- demo

/**
 * Confirm demo time / Reschedule demo (screen 36): the next 10 weekdays
 * (and the day they picked), the six UK times, the host and a video link.
 * Times another demo already holds can't be picked.
 */
export function ConfirmDemoDialog({
  lead,
  owners,
  defaultHostId,
  open,
  onOpenChange,
}: {
  lead: DemoDetail;
  owners: LeadPerson[];
  /** The person opening it, when they can host. */
  defaultHostId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const moved = lead.status === "SCHEDULED";
  const current = demoStart(lead);
  const days = React.useMemo<DemoDay[]>(() => {
    const list = upcomingDemoDays();
    const picked = demoDayFor(current);
    return list.some((day) => day.date === picked.date) ||
      new Date(current) < new Date()
      ? list
      : [picked, ...list];
  }, [current]);
  const startDay = days.find((day) =>
    day.slots.some((slot) => slot.start === new Date(current).toISOString()),
  );
  const [date, setDate] = React.useState(startDay?.date ?? days[0].date);
  const day = days.find((candidate) => candidate.date === date) ?? days[0];
  const [time, setTime] = React.useState(
    startDay?.slots.find(
      (slot) => slot.start === new Date(current).toISOString(),
    )?.time ?? "11:00",
  );
  const [hostId, setHostId] = React.useState(
    lead.host?.id ?? lead.owner?.id ?? defaultHostId ?? owners[0]?.id ?? "",
  );
  const [link, setLink] = React.useState(lead.videoLink ?? "");
  const [taken, setTaken] = React.useState<Set<string>>(() => new Set());
  const { busy, error, send } = useSend();

  React.useEffect(() => {
    if (!open) return;
    let live = true;
    takenDemoSlots()
      .then((slots) => {
        if (!live) return;
        // Its own time is not "taken" for this demo.
        if (lead.scheduledStart)
          slots.delete(new Date(lead.scheduledStart).toISOString());
        setTaken(slots);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [open, lead.scheduledStart]);

  const start = day.slots.find((slot) => slot.time === time)?.start;
  const first = firstOf(lead.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          {moved ? "Reschedule demo" : "Confirm demo time"}
        </DialogTitle>
        <DialogDescription>{about(lead)}</DialogDescription>
        <Hint>
          They picked{" "}
          <strong className="text-navy">
            {demoWhenLong(lead.preferredStart)}
          </strong>
        </Hint>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!start) return;
            void send<{ emailSent: boolean }>(
              `/team/leads/demos/${lead.code}/confirm`,
              { start, hostId, videoLink: link.trim() },
              (answer) =>
                answer.emailSent
                  ? `Calendar invite sent to ${lead.email}`
                  : `${lead.code} is now Scheduled, but the invite email could not be sent`,
              () => onOpenChange(false),
            );
          }}
        >
          <div className="mt-4 grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3">
            <Field label="Date">
              <Select
                value={date}
                onChange={(event) => setDate(event.target.value)}
              >
                {days.map((option) => (
                  <option key={option.date} value={option.date}>
                    {option.long}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Time (UK)">
              <Select
                value={time}
                onChange={(event) => setTime(event.target.value)}
              >
                {day.slots.map((slot) => {
                  const booked = taken.has(slot.start);
                  return (
                    <option key={slot.time} value={slot.time} disabled={booked}>
                      {slot.time}
                      {booked ? " (booked)" : ""}
                    </option>
                  );
                })}
              </Select>
            </Field>
          </div>
          <Field label="Host" className="mt-3">
            <Select
              value={hostId}
              onChange={(event) => setHostId(event.target.value)}
            >
              {owners.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Video call link (optional)" className="mt-3">
            <Input
              type="url"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="Paste a Zoom, Teams or Google Meet link"
            />
          </Field>
          <p className="mt-3 text-[13px] leading-normal text-muted-foreground">
            {first} gets a calendar invite at {lead.email} with the date, time
            and link.
          </p>
          {error ? (
            <div className="mt-3">
              <FormError>{error}</FormError>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !start || taken.has(start)}>
              {busy
                ? "Sending…"
                : moved
                  ? "Send new invite"
                  : "Send calendar invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const CANCEL_REASONS = [
  "Asked to reschedule later",
  "No longer interested",
  "Duplicate request",
  "No reply",
] as const;

/** Cancel demo: a reason, and whether to email them. */
export function CancelDemoDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: DemoDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = React.useState<string>(CANCEL_REASONS[0]);
  const [email, setEmail] = React.useState(true);
  const { busy, error, send } = useSend();
  const first = firstOf(lead.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Cancel demo</DialogTitle>
        <DialogDescription>
          {lead.code} · {lead.name} · {demoWhenLong(demoStart(lead))}
        </DialogDescription>
        <ReasonPicker
          reasons={CANCEL_REASONS}
          value={reason}
          onChange={setReason}
        />
        <Checkbox
          className="mt-4 gap-2.5 font-semibold"
          checked={email}
          onChange={(event) => setEmail(event.target.checked)}
        >
          Email {first} that the demo is cancelled
        </Checkbox>
        {error ? (
          <div className="mt-3">
            <FormError>{error}</FormError>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep demo
          </Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={() =>
              void send<{ emailSent: boolean }>(
                `/team/leads/demos/${lead.code}/cancel`,
                { reason, email },
                (answer) =>
                  `${lead.code} cancelled${answer.emailSent ? `. ${first} was emailed.` : ""}`,
                () => onOpenChange(false),
              )
            }
          >
            {busy ? "Cancelling…" : "Cancel demo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------------ quote

/** The estimate's starting amount from their budget (the design's numbers). */
const FROM_BUDGET: Record<QuoteDetail["budget"], number | null> = {
  UNDER_5K: 4500,
  FROM_5K_TO_15K: 9800,
  FROM_15K_TO_50K: 24000,
  OVER_50K: 60000,
  NOT_SURE: null,
};

/** "£24,000" -> 24000; "24,000.50" -> 24000.5; nothing usable -> null. */
export function parseAmount(text: string): number | null {
  const clean = text.replace(/[^0-9.]/g, "");
  if (!/\d/.test(clean)) return null;
  const amount = Number(clean);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

/** Today plus some days, as "2026-11-23" (the date picker's format). */
function dateInDays(days: number): string {
  const date = new Date(Date.now() + days * 86_400_000);
  return date.toISOString().slice(0, 10);
}

/** Send estimate / Update estimate (screen 39). */
export function EstimateDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: QuoteDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const latest = lead.estimates[0];
  const starting = latest ? latest.amountCents / 100 : FROM_BUDGET[lead.budget];
  const [amount, setAmount] = React.useState(
    starting ? formatGbp(Math.round(starting * 100)) : "",
  );
  const [deliveryTime, setDeliveryTime] = React.useState(
    latest?.deliveryTime ?? "6–8 weeks",
  );
  const [validUntil, setValidUntil] = React.useState(() => {
    const kept = latest?.validUntil.slice(0, 10);
    return kept && kept >= dateInDays(0) ? kept : dateInDays(14);
  });
  const [summary, setSummary] = React.useState(
    latest?.summary ?? lead.requirements,
  );
  const [tried, setTried] = React.useState(false);
  const { busy, error, send } = useSend();
  const value = parseAmount(amount);
  const updating = lead.estimates.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          {updating ? "Update estimate" : "Send estimate"}
        </DialogTitle>
        <DialogDescription>{about(lead)}</DialogDescription>
        <Hint>
          Their budget:{" "}
          <strong className="text-navy">{budgets[lead.budget].label}</strong> ·
          Timeline:{" "}
          <strong className="text-navy">
            {lead.timeline ? timelines[lead.timeline].label : "not asked"}
          </strong>
        </Hint>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setTried(true);
            if (value === null) return;
            void send<{ emailSent: boolean }>(
              `/team/leads/quotes/${lead.code}/estimate`,
              { amount: value, deliveryTime, validUntil, summary },
              (answer) =>
                answer.emailSent
                  ? `Estimate sent to ${lead.email}`
                  : "Estimate saved, but the email could not be sent",
              () => onOpenChange(false),
            );
          }}
        >
          <div className="mt-4 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Field
              label="Estimate (GBP)"
              required
              error={tried && value === null ? "Enter the estimate amount" : ""}
            >
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </Field>
            <Field label="Delivery time">
              <Input
                value={deliveryTime}
                maxLength={120}
                onChange={(event) => setDeliveryTime(event.target.value)}
              />
            </Field>
          </div>
          <Field label="Valid until" className="mt-3">
            <Input
              type="date"
              value={validUntil}
              min={dateInDays(0)}
              onChange={(event) => setValidUntil(event.target.value)}
            />
          </Field>
          <Field label="What is included" className="mt-3">
            <Textarea
              rows={4}
              value={summary}
              maxLength={10000}
              onChange={(event) => setSummary(event.target.value)}
            />
          </Field>
          <p className="mt-3 text-[13px] leading-normal text-muted-foreground">
            We email the estimate to {lead.email}. Mark the request as won or
            lost when they reply.
          </p>
          {error ? (
            <div className="mt-3">
              <FormError>{error}</FormError>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send estimate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const LOST_REASONS = [
  "Budget",
  "Timing",
  "Chose another provider",
  "No reply",
  "Not a fit",
] as const;

/** Mark as lost: a reason and an optional note for the team. */
export function LostDialog({
  lead,
  open,
  onOpenChange,
}: {
  lead: QuoteDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = React.useState<string>(LOST_REASONS[0]);
  const [note, setNote] = React.useState("");
  const { busy, error, send } = useSend();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Mark as lost</DialogTitle>
        <DialogDescription>{about(lead)}</DialogDescription>
        <ReasonPicker
          reasons={LOST_REASONS}
          value={reason}
          onChange={setReason}
        />
        <Field label="Note for the team (optional)" className="mt-4">
          <Textarea
            rows={2}
            value={note}
            maxLength={2000}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>
        {error ? (
          <div className="mt-3">
            <FormError>{error}</FormError>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={() =>
              void send(
                `/team/leads/quotes/${lead.code}/lost`,
                { reason, note: note.trim() || undefined },
                () => `${lead.code} marked as lost`,
                () => onOpenChange(false),
              )
            }
          >
            {busy ? "Saving…" : "Mark as lost"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** "Reason", as radio rows with the round mark. */
function ReasonPicker({
  reasons,
  value,
  onChange,
}: {
  reasons: readonly string[];
  value: string;
  onChange: (reason: string) => void;
}) {
  return (
    <>
      <p id="reason-label" className="mt-[18px] text-[13px] font-bold">
        Reason
      </p>
      <RadioCards
        aria-labelledby="reason-label"
        value={value}
        onValueChange={onChange}
        className="mt-2 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2"
      >
        {reasons.map((reason) => (
          <RadioCard
            key={reason}
            value={reason}
            showDot
            title={<span className="text-sm">{reason}</span>}
            className="min-h-[52px] items-center px-3.5 py-3"
          />
        ))}
      </RadioCards>
    </>
  );
}
