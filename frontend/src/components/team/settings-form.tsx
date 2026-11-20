"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/field";
import { LabelPill } from "@/components/ui/pill";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { priorities, type Priority } from "@/lib/labels";
import { targetCode, targetWords } from "@/lib/team/targets";
import type { AppSettings } from "@/lib/team/types";

const ORDER: Priority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

const SWITCHES: [keyof AppSettings["teamNotifications"], string][] = [
  ["urgentAlert", "Alert all admins about new Urgent requests"],
  [
    "notifyAssigneeOnReply",
    "Notify the assigned developer when a customer replies",
  ],
  ["dailyDigest", "Daily digest of requests waiting for review"],
  ["autoCloseResolvedAfter7Days", "Auto-close resolved requests after 7 days"],
];

const card = "rounded-[22px] border border-line-2 bg-white p-6";

type Targets = Record<Priority, string>;

const inWords = (saved: AppSettings["responseTargets"]) =>
  Object.fromEntries(ORDER.map((p) => [p, targetWords(saved[p])])) as Targets;

const toCodes = (targets: Targets) =>
  Object.fromEntries(ORDER.map((p) => [p, targetCode(targets[p])])) as Record<
    Priority,
    string | null
  >;

/** "25 Dec 2026, Friday" for a saved "2026-12-25". */
function holidayWords(day: string) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Settings (screen 33): the SLA targets for each priority (first reply,
 * and fix), the bank holidays that are not business days, and the four
 * team notification switches. Save settings saves everything.
 */
export function SettingsForm({ settings }: { settings: AppSettings }) {
  const router = useRouter();
  const toast = useToast();
  const [reply, setReply] = React.useState(() =>
    inWords(settings.responseTargets),
  );
  const [fix, setFix] = React.useState(() =>
    inWords(settings.resolutionTargets),
  );
  const [holidays, setHolidays] = React.useState<string[]>(
    settings.slaCalendar.bankHolidays,
  );
  const [reopenDays, setReopenDays] = React.useState(
    String(settings.requestRules.reopenWithinDays),
  );
  const [switches, setSwitches] = React.useState(settings.teamNotifications);
  const [tried, setTried] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const replyCodes = toCodes(reply);
  const fixCodes = toCodes(fix);
  const days = Number(reopenDays);
  const daysValid = Number.isInteger(days) && days >= 1 && days <= 365;
  const valid = daysValid && ORDER.every((p) => replyCodes[p] && fixCodes[p]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setTried(true);
    setError("");
    if (!valid) return;
    setBusy(true);
    try {
      await apiFetch("/team/settings", {
        method: "POST",
        body: {
          responseTargets: replyCodes,
          resolutionTargets: fixCodes,
          slaCalendar: { bankHolidays: holidays },
          requestRules: { reopenWithinDays: days },
          teamNotifications: switches,
        },
      });
      toast("Changes saved");
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={save}
      className="flex flex-wrap items-start gap-5"
    >
      <TargetsCard
        id="response-targets"
        title="Response targets"
        hint="How soon the first team reply is due. The clock stops at the first reply."
        what="Response target"
        targets={reply}
        codes={replyCodes}
        tried={tried}
        onChange={setReply}
      />
      <TargetsCard
        id="resolution-targets"
        title="Fix targets"
        hint="How soon a request should be resolved. A request resolved in time shows as Met."
        what="Fix target"
        targets={fix}
        codes={fixCodes}
        tried={tried}
        onChange={setFix}
      />
      <BankHolidays holidays={holidays} onChange={setHolidays} />

      <section
        aria-labelledby="team-notifications"
        className={`${card} min-w-0 flex-[1_1_380px]`}
      >
        <h2 id="team-notifications" className="text-[17px] font-bold">
          Team notifications
        </h2>
        <div className="mt-3 flex flex-col gap-1">
          <label
            htmlFor="reopen-days"
            className="flex flex-wrap items-center gap-2 text-sm"
          >
            Customers can reopen a closed request for
            <Input
              id="reopen-days"
              inputMode="numeric"
              value={reopenDays}
              aria-invalid={(tried && !daysValid) || undefined}
              onChange={(event) => setReopenDays(event.target.value)}
              className="h-10 w-[72px] text-center font-semibold"
            />
            days
          </label>
          {tried && !daysValid ? (
            <p className="text-xs font-semibold text-danger">
              Write a number of days from 1 to 365
            </p>
          ) : null}
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {SWITCHES.map(([key, label]) => (
            <li key={key}>
              <Checkbox
                className="min-h-9 gap-3"
                checked={switches[key]}
                onChange={(event) =>
                  setSwitches({ ...switches, [key]: event.target.checked })
                }
              >
                {label}
              </Checkbox>
            </li>
          ))}
        </ul>
        {error ? (
          <div className="mt-3">
            <FormError>{error}</FormError>
          </div>
        ) : null}
        <Button type="submit" className="mt-4" disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </Button>
      </section>
    </form>
  );
}

function TargetsCard({
  id,
  title,
  hint,
  what,
  targets,
  codes,
  tried,
  onChange,
}: {
  id: string;
  title: string;
  hint: string;
  /** "Response target", for each field's name: "Response target for High". */
  what: string;
  targets: Targets;
  codes: Record<Priority, string | null>;
  tried: boolean;
  onChange: (next: Targets) => void;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`${card} min-w-0 flex-[1_1_380px]`}
    >
      <h2 id={id} className="text-[17px] font-bold">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <ul className="mt-3.5 flex flex-col gap-3.5">
        {ORDER.map((priority) => {
          const bad = tried && !codes[priority];
          const field = `${id}-${priority}`;
          return (
            <li key={priority} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor={field}>
                  <span className="sr-only">
                    {what} for {priorities[priority].label}
                  </span>
                  <LabelPill group="priority" value={priority} />
                </label>
                <Input
                  id={field}
                  value={targets[priority]}
                  aria-invalid={bad || undefined}
                  aria-describedby={bad ? `${field}-error` : undefined}
                  onChange={(event) =>
                    onChange({ ...targets, [priority]: event.target.value })
                  }
                  className="h-[46px] w-[166px] font-semibold"
                />
              </div>
              {bad ? (
                <p
                  id={`${field}-error`}
                  className="text-right text-xs font-semibold text-danger"
                >
                  Write it like 4 hours or 1 business day
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The bank holidays: not business days for the SLA. */
function BankHolidays({
  holidays,
  onChange,
}: {
  holidays: string[];
  onChange: (next: string[]) => void;
}) {
  const [day, setDay] = React.useState("");
  const today = new Date().toISOString().slice(0, 10);
  const shown = holidays.filter((h) => h >= today.slice(0, 4));

  function add() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return;
    onChange([...new Set([...holidays, day])].sort());
    setDay("");
  }

  return (
    <section
      aria-labelledby="bank-holidays"
      className={`${card} min-w-0 flex-[1_1_380px]`}
    >
      <h2 id="bank-holidays" className="text-[17px] font-bold">
        Bank holidays
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Not counted as business days. England and Wales, from gov.uk: add each
        new year&apos;s dates when they are announced.
      </p>
      <ul aria-label="Bank holidays" className="mt-3 flex flex-col">
        {shown.map((holiday) => (
          <li
            key={holiday}
            className="flex items-center justify-between gap-3 border-t border-line-3 py-2 text-sm first:border-t-0"
          >
            <span>{holidayWords(holiday)}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Remove ${holidayWords(holiday)}`}
              onClick={() => onChange(holidays.filter((h) => h !== holiday))}
            >
              Remove
            </Button>
          </li>
        ))}
        {shown.length === 0 ? (
          <li className="py-2 text-sm text-muted-foreground">
            No bank holidays added.
          </li>
        ) : null}
      </ul>
      <div className="mt-3 flex items-end gap-2.5">
        <label className="flex flex-1 flex-col gap-1.5 text-[13px] font-bold">
          Add a bank holiday
          <Input
            type="date"
            value={day}
            onChange={(event) => setDay(event.target.value)}
          />
        </label>
        <Button type="button" variant="outline" onClick={add} disabled={!day}>
          Add
        </Button>
      </div>
    </section>
  );
}
