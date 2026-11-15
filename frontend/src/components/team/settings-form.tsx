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

/**
 * Settings (screen 33): the response target for each priority (used for
 * SLA due times) and the four team notification switches. Save settings
 * saves both.
 */
export function SettingsForm({ settings }: { settings: AppSettings }) {
  const router = useRouter();
  const toast = useToast();
  const [targets, setTargets] = React.useState(
    () =>
      Object.fromEntries(
        ORDER.map((p) => [p, targetWords(settings.responseTargets[p])]),
      ) as Record<Priority, string>,
  );
  const [switches, setSwitches] = React.useState(settings.teamNotifications);
  const [tried, setTried] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const codes = Object.fromEntries(
    ORDER.map((p) => [p, targetCode(targets[p])]),
  ) as Record<Priority, string | null>;
  const valid = ORDER.every((p) => codes[p]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setTried(true);
    setError("");
    if (!valid) return;
    setBusy(true);
    try {
      await apiFetch("/team/settings", {
        method: "POST",
        body: { responseTargets: codes, teamNotifications: switches },
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
      <section
        aria-labelledby="response-targets"
        className={`${card} min-w-0 flex-[1_1_380px]`}
      >
        <h2 id="response-targets" className="text-[17px] font-bold">
          Response targets
        </h2>
        <ul className="mt-3.5 flex flex-col gap-3.5">
          {ORDER.map((priority) => {
            const bad = tried && !codes[priority];
            const id = `target-${priority}`;
            return (
              <li key={priority} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor={id}>
                    <span className="sr-only">
                      Response target for {priorities[priority].label}
                    </span>
                    <LabelPill group="priority" value={priority} />
                  </label>
                  <Input
                    id={id}
                    value={targets[priority]}
                    aria-invalid={bad || undefined}
                    aria-describedby={bad ? `${id}-error` : undefined}
                    onChange={(event) =>
                      setTargets({ ...targets, [priority]: event.target.value })
                    }
                    className="h-[46px] w-[166px] font-semibold"
                  />
                </div>
                {bad ? (
                  <p
                    id={`${id}-error`}
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

      <section
        aria-labelledby="team-notifications"
        className={`${card} min-w-0 flex-[1_1_380px]`}
      >
        <h2 id="team-notifications" className="text-[17px] font-bold">
          Team notifications
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {SWITCHES.map(([key, label]) => (
            <li key={key}>
              <label className="flex min-h-9 cursor-pointer items-center gap-3 text-sm text-body">
                <Checkbox
                  checked={switches[key]}
                  onChange={(event) =>
                    setSwitches({ ...switches, [key]: event.target.checked })
                  }
                />
                {label}
              </label>
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
